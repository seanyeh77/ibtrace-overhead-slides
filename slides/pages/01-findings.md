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
---

依照格式字串把資料寫進固定大小的緩衝區，並保證結尾有一個 NUL。功能完整，但每次呼叫都要先解析格式字串。

tracer 原本用它把函式名稱寫進每筆記錄的 28 B 名稱欄，每筆約花 61 ns；但這裡其實只需要複製一段字串。

::example::

<p>優化後改成先量長度、再直接複製，寫出的位元組與 snprintf 完全相同：</p>
<pre>snprintf(rec->name, 28, "%s", api);      // 原本
n = strnlen(api, 27);                    // 優化後
memcpy(rec->name, api, n);
rec->name[n] = '\0';</pre>

<!--
snprintf 是通用的格式化輸出函式，要處理 %d、%x 等各種格式，所以即使格式只有 %s，也得先走一遍格式解析。
tracer 寫名稱時只需要「最多 27 個字元再補一個 NUL」，用 strnlen 加 memcpy 就能做到。
細節：snprintf 只寫到 NUL 為止，之後的位元組保留上一筆記錄的內容；新寫法也刻意不補零，讓輸出逐位元組相同。
-->

---
layout: definition
chapter: Part 1 · Findings
term: CLOCK_MONOTONIC
kind: Linux 時鐘
size: 46px
---

從開機後某個固定點起算的 ns，只會往前走，不受使用者修改系統時間影響；但 NTP 服務（如 chrony）仍會微調它前進的速率。

以 <code>clock_gettime(CLOCK_MONOTONIC)</code> 讀取，經由 vDSO 不需進入 kernel，一次約 17 ns。ibmon 取樣網卡計數器也用這個時鐘，所以 tracer 的時間戳必須同樣是 CLOCK_MONOTONIC 的 ns，兩者才能放在同一條時間軸上。

::example::

<p>每個 span 進入與離開時各讀一次，t1 − t0 就是這次呼叫的時長；兩次讀取合計約 31 ns，是 span 成本的大宗。</p>

<!--
另一個常見的時鐘是 CLOCK_REALTIME，也就是牆上時間，可能被手動調整或跳動，不適合量時長。
vDSO 是 kernel 映射到每個行程的一小段程式碼，讓 clock_gettime 不必真的發出系統呼叫；即使如此，一次仍要約 17 ns。
「仍會被 chrony 微調速率」這點，在後面改用 TSC 時會變得重要。
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
  'TSC 是 CPU 內建的時間戳計數器，讀取不需進入 kernel。span 改以 TSC 計時後，每個 span 由 41.5 ns 降至 23.8 ns；最終 overhead 為 0.7–4.5 µs，占 RTT 的 8–28 %。',
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
