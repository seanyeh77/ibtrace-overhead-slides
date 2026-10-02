---
layout: section
number: 1
chapter: Part 1 · Findings
---

# 主要發現

- **1.1** tracer 扭曲 transport 比較
- **1.2** 成本集中的三處
- **1.3** 優化後的總成本
- **1.4** 空轉輪詢不在關鍵路徑上

---
layout: textbook
chapter: Part 1 · Findings
clicks: 2
---

# 掛著 tracer 比較，差距被放大

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
  '不掛 tracer 時，兩種 transport 的 RTT 只差 0.68 µs。',
  '掛上舊版 tracer 後差到 5.8 µs：rc_verbs 多一層 verbs 攔截，被拖得比較多。',
  '先前「rc_mlx5 的處理時間只有 rc_verbs 的 45 %」主要是這個效應；不掛 tracer 時只差 2–14 %。',
]" />

<!--
先講結論：tracer 的成本對兩種 transport 不一樣，所以掛著 tracer 量出來的 transport 比較會被放大。
點一下：綠色是掛著優化前的 tracer。rc_verbs 多付 12.7 µs，rc_mlx5 多付 7.6 µs，差 5.1 µs，這個差異是顯著的。
先前兩次 job 量到的 25.5 µs 和 17.7 µs，正好就是這裡的綠色柱子，所以那個 45 % 主要是 tracer 自己造成的。
不掛 tracer 時，rc_mlx5 確實比較快，三種大小的信賴區間都不包含 0，但只快 2–14 %，沒有倍數級差距。
-->

---
layout: textbook
chapter: Part 1 · Findings
clicks: 1
---

# 成本集中在三處

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
  '寫一筆記錄約 296 ns，兩個 syscall 加上 snprintf 就占了九成以上。',
  '每個被攔截的呼叫都是一個 span，約 41 ns，其中兩次 clock_gettime 占 31 ns。',
]" />

<!--
做法是在副本裡一次拿掉一項，跟原版交錯執行，量出每一項各自的成本。
寫記錄：getpid、gettid 各約 130 ns，snprintf 約 61 ns。atomic 取號只有 7 ns，而且多執行緒共用 ring 時一定要有，所以不動。
各項分別拿掉省下的量加起來比一次全拿掉多，代表兩個 syscall 的成本不是單純相加。
span：兩次讀時鐘是大宗；TLS、深度計數各只有 1–3 ns，低於叢集量測的解析度，不值得冒險改。
-->

---
layout: textbook
chapter: Part 1 · Findings
clicks: 2
---

# 三項優化後，總成本降到約三分之一

<GroupedBars
  :cats="[['rc_mlx5', '8 B'], ['rc_mlx5', '64 KiB'], ['rc_mlx5', '1 MiB'], ['rc_verbs', '8 B'], ['rc_verbs', '64 KiB'], ['rc_verbs', '1 MiB']]"
  :series="[
    { name: 'Before', fill: '#aeacac', values: [3.916, 7.610, 7.149, 6.427, 12.738, 11.706] },
    { name: 'Record path', fill: '#adf0c7', values: [1.163, 3.284, 3.490, 1.810, 4.532, 4.240] },
    { name: 'TSC span', fill: '#6eea9e', values: [0.726, 2.784, 3.103, 1.311, 4.168, 4.471] },
  ]"
  :max="14" :step="2" unit="C3 - C0 µs" :width="1320" :height="720" :bar-w="54"
  reveal
/>

::note::

<Note :notes="[
  '優化前，完整 tracer 每次來回多 3.9–12.7 µs，相當於 RTT 的 21–139 %。',
  'pid／tid 快取、名稱改用複製：每筆記錄從 296 降到約 20 ns。',
  'span 改讀 TSC：每個 span 從 41.5 降到 23.8 ns。最終 0.7–4.5 µs，占 RTT 8–28 %。',
]" />

<!--
三根柱子是三次量測，每次都在同一個 job 內以 C0 當錨點，所以比較的是同一次量測內的差值，不比絕對 RTT。
六格「優化前到最後」的變化，信賴區間全部不包含 0。
rc_verbs 比 rc_mlx5 多付的 tracer 成本，從 2.5–5.1 µs 降到 0.6–1.4 µs，縮小了但仍然顯著。
第三次量測的 span 優化，總成本只有一格能和 0 區分，原因在方法那一節說明。
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
  '每次迭代被攔截 150–380 次，其中 92–97 % 是 progress loop 的空轉。',
  '只拿「做了事的呼叫」乘上 span 成本，六格中有五格落在實測區間內。若把空轉也算進去，會多出 5–60 µs。',
]" />

<!--
空轉輪詢的成本藏在「等網路」的時間裡，不會延後資料抵達，所以不會拉長 RTT。
真正拉長 RTT 的是每次迭代 15–45 個做了事的呼叫。
這個推論先在資料上成立，才去優化 span；之後實際的改善幅度 0.26–0.89 µs，也符合 14–46 個呼叫乘上每個省 17 ns 的預測。
也因此「總成本除以攔截次數」不能當作每次攔截的成本。
-->
