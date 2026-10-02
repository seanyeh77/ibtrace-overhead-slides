---
layout: section
number: 1
chapter: Part 1 · Findings
---

# 主要發現

- **1.1** Tracer 放大 transport 之間的差距
- **1.2** Overhead 的三個主要來源
- **1.3** 三項優化後的總 overhead
- **1.4** 空轉輪詢不在關鍵路徑上

---
layout: textbook
chapter: Part 1 · Findings
clicks: 2
---

# Tracer 放大 transport 之間的差距

<GroupedBars
  :cats="[['rc_verbs', '64 KiB'], ['rc_mlx5', '64 KiB']]"
  :series="[
    { name: 'No tracer (C0)', fill: '#e7e7e7', values: [11.175, 10.497] },
    { name: 'Tracer before optimization (C3)', fill: '#6eea9e', values: [23.913, 18.107] },
  ]"
  :max="25" :step="5" unit="RTT µs" :digits="2" :width="1240" :height="720" :bar-w="150"
  reveal
/>

::note::

<Note :notes="[
  '不啟用 tracer 時，兩種 transport 在 64 KiB 下的 RTT 只相差 0.68 µs。',
  '啟用優化前的 tracer 後，差距擴大到 5.8 µs，因為 rc_verbs 多經過一層 verbs 攔截。',
  '先前「rc_mlx5 處理時間僅為 rc_verbs 的 45 %」主要來自這個效應；不啟用 tracer 時兩者只差 2–14 %。',
]" />

<!--
先講結論：tracer 的 overhead 在兩種 transport 上不同，所以在啟用 tracer 的情況下比較 transport，差距會被放大。
綠色柱子是啟用優化前的 tracer。rc_verbs 多出 12.7 µs，rc_mlx5 多出 7.6 µs，兩者相差 5.1 µs，這個差異是顯著的。
先前兩次 job 量到的 25.5 µs 和 17.7 µs 正好對應這裡的綠色柱子，所以 45 % 這個比例主要是 tracer 本身造成的。
不啟用 tracer 時，rc_mlx5 確實比較快，三種訊息大小的信賴區間都不包含 0，但只快 2–14 %，沒有倍數級的差距。
-->

---
layout: definition
chapter: Part 1 · Findings
term: snprintf
kind: C 標準函式庫
clicks: 2
---

<DgSnprintf />

兩種寫法寫出的位元組完全相同，只省掉格式解析。

<!--
snprintf 是通用的格式化輸出函式，要處理 %d、%x 等各種格式，所以即使格式只有 %s，也得先走一遍格式解析。
tracer 寫名稱時只需要「最多 27 個字元再補一個 NUL」，用 strnlen 加 memcpy 就能做到。
細節：snprintf 只寫到 NUL 為止，之後的位元組保留上一筆記錄的內容；新寫法也刻意不補零，讓輸出逐位元組相同。
tracer 原本用 snprintf(rec->name, 28, "%s", api) 把函式名稱寫進每筆記錄的 28 B 名稱欄，每筆約 61 ns。
改成 strnlen 量長度、memcpy 複製、補一個 NUL。snprintf 只寫到 NUL 為止，之後保留上一筆記錄的位元組；新寫法刻意不補零，輸出逐位元組相同。
-->

---
layout: definition
chapter: Part 1 · Findings
term: CLOCK_MONOTONIC
kind: Linux 時鐘
size: 46px
clicks: 1
---

<DgClock />

trace 與計數器讀同一個時鐘，兩者才能對齊。

<!--
另一個常見的時鐘是 CLOCK_REALTIME，也就是牆上時間，可能被手動調整或跳動，不適合量時長。
vDSO 是 kernel 映射到每個行程的一小段程式碼，讓 clock_gettime 不必真的發出系統呼叫；即使如此，一次仍要約 17 ns。
「仍會被 chrony 微調速率」這點，在後面改用 TSC 時會變得重要。
CLOCK_MONOTONIC 從開機後某個固定點起算，只會往前走，不受修改系統時間影響；但 chrony 仍會微調它的速率，這點在改用 TSC 時很重要。
以 clock_gettime 讀取，經由 vDSO 不需進入 kernel，一次仍約 17 ns；每個 span 進出各讀一次，合計約 31 ns。
-->

---
layout: textbook
chapter: Part 1 · Findings
ltag: trace.c
---

# 一個 span 做的事

```c {all|2|6|8-9|10}
void ibt_span_begin(struct ibt_span *sp, ...) {
    sp->t0_mono = ibt_mono_ns();     /* clock */
    sp->own = g_depth[sp->layer]++;
}
void ibt_span_end_args(struct ibt_span *sp, ...) {
    uint64_t t1 = ibt_mono_ns();     /* clock */
    g_depth[sp->layer]--;
    if (!g_enabled || sp->own > 0)
        return;                      /* not recorded */
    emit(api, sp->t0_mono, t1 - sp->t0_mono, ...);
}
```

::note::

<Note :notes="[
  '每個被攔截的呼叫，進入時呼叫 ibt_span_begin，離開時呼叫 ibt_span_end_args。',
  '進入時讀一次 CLOCK_MONOTONIC。',
  '離開時再讀一次；兩次讀取合計約 31 ns，是 span 成本的大宗。',
  '同一層的巢狀呼叫只執行、不記錄；IBTRACE_RECORD=0 時也在這裡返回。',
  '其餘的呼叫交給 emit 寫成一筆記錄，這是下一頁的寫入成本。',
]" />

<!--
ibt_mono_ns 就是 clock_gettime(CLOCK_MONOTONIC)。
C2 條件（只攔截、不寫記錄）付的就是這一頁上面到 return 為止的成本；C3 再加上 emit。
-->

---
layout: textbook
chapter: Part 1 · Findings
clicks: 1
---

# Overhead 的三個主要來源

<HBars
  :panels="[
    { title: 'Writing one record: 296 ns', max: 135, items: [
      { label: 'getpid', v: 129.0, hot: true },
      { label: 'gettid', v: 127.8, hot: true },
      { label: 'snprintf', v: 60.9, hot: true },
      { label: 'atomic slot', v: 7.1 },
    ] },
    { title: 'One span: 41 ns', max: 135, items: [
      { label: 'clock read x2', v: 31.1, hot: true },
      { label: 'depth count', v: 2.7 },
      { label: 'TLS access', v: 1.9 },
    ] },
  ]"
  :panel-w="650" :label-w="220" :row-h="96" :gap-x="64"
  reveal
/>

::note::

<Note :notes="[
  '寫入一筆記錄約需 296 ns，其中 getpid、gettid 兩個 syscall 與 snprintf 合計占九成以上。',
  '每次被攔截的呼叫稱為一個 span，約需 41 ns，其中兩次 clock_gettime 就占了 31 ns。',
]" />

<!--
做法是在程式副本中一次移除一項，與原版交錯執行，量出每一項各自的成本。
寫入記錄：getpid、gettid 各約 130 ns，snprintf 約 61 ns。atomic 取號只有 7 ns，而且多執行緒共用 ring 時不可缺少，所以保留。
各項分別移除時省下的時間加總，比一次全部移除時更多，代表兩個 syscall 的成本並非單純相加。
span：兩次讀取時鐘是主要成本；TLS 與深度計數各只有 1–3 ns，低於叢集量測的解析度，不值得承擔修改的風險。
-->

---
layout: textbook
chapter: Part 1 · Findings
ltag: trace.c
clicks: 2
---

# 優化一、二：寫入一筆記錄

<ConfigDiff lang="c" :rows="[
  ['', 'static void emit(const char *api, ...) {'],
  ['', '    uint64_t seq = ibt_ring_claim(g_ring);'],
  ['', '    struct ibt_rec *rec = ibt_ring_slot(g_ring, seq);'],
  ['', '    rec->t_mono_ns = t0;'],
  ['', '    rec->dur_ns = dur;'],
  ['del', '    rec->pid = getpid();                 /* syscall */'],
  ['del', '    rec->tid = syscall(SYS_gettid);      /* syscall */'],
  ['del', '    snprintf(rec->name, 28, &quot;%s&quot;, api);  /* format */'],
  ['add', '    ids(&amp;rec->pid, &amp;rec->tid);           /* cached */'],
  ['add', '    copy_name(rec->name, api);           /* copy */'],
  ['', '    ibt_ring_publish(rec, seq);'],
  ['', '}'],
]" />

::note::

<Note :notes="[
  '這是寫入一筆記錄的函式。優化前，每筆都要做兩個 syscall 和一次 snprintf。',
  '這三行合計約 318 ns：getpid、gettid 各約 130 ns，snprintf 約 61 ns。改為讀快取的 pid 與 tid，名稱改用複製。',
  '每筆記錄由 296 ns 降至約 20 ns，寫出的位元組完全不變。',
]" />

<!--
ring 取號（ibt_ring_claim）只有約 7 ns，而且多執行緒共用 ring 時不可缺少，所以保留。
ids 與 copy_name 的內容在後面兩頁與 Part 3 說明。
-->

---
layout: textbook
chapter: Part 1 · Findings
ltag: trace.c
---

# pid 與 tid 的快取

```c {all|2-6|7-10|11}
static void ids(int32_t *pid, int32_t *tid) {
    int p = *g_fork_page;            /* WIPEONFORK page */
    if (p == 0) {                    /* fresh fork */
        p = getpid();
        *g_fork_page = p;
    }
    if (t_pid != p) {                /* new thread */
        t_tid = syscall(SYS_gettid);
        t_pid = p;
    }
    *pid = p; *tid = t_tid;
}
```

::note::

<Note :notes="[
  'pid 每個行程只需取得一次，tid 每條執行緒只需取得一次，所以快取起來。',
  '快取所在的記憶體頁在 fork 後會被 kernel 清零；讀到 0 就代表這是新行程，重新呼叫 getpid。',
  '每條執行緒記下取得 tid 時的 pid；pid 一變，代表換了行程，tid 也要重讀。',
  '平常的呼叫只做一次記憶體讀取，不進入 kernel。',
]" />

<!--
簡化版：實際程式碼以 __atomic_load_n／__atomic_store_n 存取這一頁，並在 g_fork_page 為 NULL（madvise 失敗）時，退回每次都呼叫兩個 syscall。
為什麼需要清零：fork 會複製整個記憶體，包含快取，子行程若直接沿用就會拿到父行程的 pid。
-->

---
layout: textbook
chapter: Part 1 · Findings
ltag: trace.c
---

# 優化三：以 TSC 計時

```c {all|3|4-6|7-8}
uint64_t ibt_clock_ns(void) {
    struct tsc_clock *c = &t_clk;
    uint64_t d = __rdtsc() - c->tsc;    /* ticks */
    uint64_t ns = d > REANCHOR_TICKS
        ? tsc_reanchor(c)               /* real clock */
        : c->ns + ((d * c->mult) >> 32);
    if (ns < c->last)
        ns = c->last;                   /* monotonic */
    return c->last = ns;
}
```

::note::

<Note :notes="[
  'TSC 是 CPU 內建的時間戳計數器，以 rdtsc 指令讀取，不需進入 kernel，只要幾 ns。',
  '先算出距離上一個錨點經過了多少 tick。',
  '在 1 ms 以內，就從錨點的 ns 以斜率內插；超過 1 ms 才真的讀一次 CLOCK_MONOTONIC，並重新量斜率。',
  '每條執行緒的讀值不會倒退，span 的時長不會變成負數。每個 span 由 41.5 ns 降至 23.8 ns。',
]" />

<!--
簡化版：實際程式碼還處理尚未建立錨點的情況，並在 CPU 不支援 constant_tsc、nonstop_tsc，或 kernel 的 clocksource 不是 tsc 時，退回 clock_gettime。REANCHOR_TICKS 約為 1 ms 的 tick 數。
要定期重新量斜率，是因為 chrony 會微調 CLOCK_MONOTONIC 的速率，在這個叢集上約差 13.6 ppm，而且會變。
換算結果仍是 CLOCK_MONOTONIC 的 ns，所以與 ibmon 的計數器取樣仍在同一條時間軸上。
-->

---
layout: textbook
chapter: Part 1 · Findings
clicks: 2
---

# 三項優化使 overhead 降至原本的 18–43 %

<GroupedBars
  :cats="[['rc_mlx5', '8 B'], ['rc_mlx5', '64 KiB'], ['rc_mlx5', '1 MiB'], ['rc_verbs', '8 B'], ['rc_verbs', '64 KiB'], ['rc_verbs', '1 MiB']]"
  :series="[
    { name: 'Before', fill: '#aeacac', values: [3.916, 7.610, 7.149, 6.427, 12.738, 11.706] },
    { name: 'After record fix', fill: '#adf0c7', values: [1.163, 3.284, 3.490, 1.810, 4.532, 4.240] },
    { name: 'After TSC clock', fill: '#6eea9e', values: [0.726, 2.784, 3.103, 1.311, 4.168, 4.471] },
  ]"
  :max="14" :step="2" unit="C3 - C0 µs" :width="1320" :height="720" :bar-w="54"
  reveal
/>

::note::

<Note :notes="[
  '優化前，完整 tracer 讓每次來回增加 3.9–12.7 µs，相當於 RTT 的 21–139 %。',
  '快取 pid 與 tid，並改以複製寫入函式名稱後，每筆記錄的成本由 296 ns 降至約 20 ns。',
  'span 改以 TSC 計時後，每個 span 由 41.5 ns 降至 23.8 ns；最終 overhead 為 0.7–4.5 µs，占 RTT 的 8–28 %。',
]" />

<!--
三種柱子代表三次量測，每次都在同一個 job 內以 C0 作為錨點，所以比較的是同一次量測內的差值，而不是絕對 RTT。
六格從優化前到最後的變化，信賴區間全部不包含 0。
rc_verbs 比 rc_mlx5 多出的 overhead，從 2.5–5.1 µs 縮小到 0.6–1.4 µs，但仍然顯著。
第三次量測中，span 優化對總 overhead 的效果只有一格能與 0 區分，原因在量測方法一節說明。
-->

---
layout: textbook
chapter: Part 1 · Findings
clicks: 1
---

# 空轉輪詢不在關鍵路徑上

<DotCI
  :cats="[['rc_mlx5', '8 B'], ['rc_mlx5', '64 KiB'], ['rc_mlx5', '1 MiB'], ['rc_verbs', '8 B'], ['rc_verbs', '64 KiB'], ['rc_verbs', '1 MiB']]"
  :measured="[
    { v: 0.69, lo: 0.39, hi: 0.84 }, { v: 1.40, lo: 0.65, hi: 1.65 }, { v: 0.72, lo: 0.36, hi: 1.26 },
    { v: 0.71, lo: 0.25, hi: 0.97 }, { v: 1.47, lo: 1.05, hi: 1.77 }, { v: 1.31, lo: 1.07, hi: 1.88 },
  ]"
  :predicted="[0.56, 1.04, 1.28, 0.74, 1.41, 1.83]"
  :max="2" :step="0.5" :width="1320" :height="700"
/>

::note::

<Note :notes="[
  '關鍵路徑是決定 RTT 長短的那串操作。每次迭代被攔截 150–380 次，其中 92–97 % 是 progress loop 的空轉輪詢。',
  '只以非空轉呼叫數乘上 span 成本來預測，六格中有五格落在實測區間內；若連空轉也算入，預測會多出 5–60 µs。',
]" />

<!--
空轉輪詢的成本落在等待網路的時間裡，不會延後資料抵達，因此不會拉長 RTT。
真正拉長 RTT 的是每次迭代 15–45 個非空轉呼叫。
這個推論先在資料上驗證成立，才開始優化 span；之後實際的改善幅度 0.26–0.89 µs，也符合 14–46 個呼叫各省 17 ns 的預測。
也因此，總 overhead 除以攔截次數，不能當作每次攔截的成本。
-->
