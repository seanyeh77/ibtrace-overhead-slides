---
layout: section
number: 4
chapter: Part 4 · Model
question: 怎麼從一次執行的 trace 算出 ΔT？
---

# 預測模型

- **4.1** 從 trace 預測每個動作的收益
- **4.2** 關鍵路徑
- **4.3** 案例的兩個預測怎麼算出來
- **4.4** 與傳統做法比較

---
layout: textbook
chapter: Part 4 · Model
clicks: 2
---

# 模型從 trace 預測每個動作的收益

<AtModel />

::note::

<Note :notes="[
  ['模型讀入跑得慢的那一次執行。', '包含 trace、counter 與設定資訊。'],
  ['每個 rank 的時間拆成四類。', '四類是等待、登記、停頓與其他。'],
  ['每個動作套一條公式，預測 ΔT。', '再依預測的收益排序。', '收益可以是負的。'],
]" />

<!--
設定資訊例如程式綁在哪顆 CPU、UCX 的參數。停頓（stall）指 CPU 被搶走的空檔；其他（other）是程式自己的工作，例如歸約計算。
模型會預測改用 8 條 rail 反而變慢，這就是負的收益。
這是規則式的模型，不是機器學習：每一種動作都有一條人寫的公式。
公式裡的常數，例如登記一次要多久、網路被佔用時每則訊息多花多少時間，全部來自獨立的小型測試（microbenchmark），不從資料集反推，避免用答案調整模型。
圖中的兩個數字是模型對案例那一次執行的預測：4 MiB allreduce、8 張網卡都可見、預設 2 條 rail（job 517932）。保留暫存空間預測快 210 ms，改用 8 條 rail 預測慢 138 ms；實測分別是快 245 ms、慢 208 ms。
-->

---
layout: definition
chapter: Part 4 · Model
term: critical path
kind: 關鍵路徑
size: 52px
clicks: 2
---

<AtCritical />

一次 allreduce 要等最慢的 rank 完成。

只有加速最慢的 rank，整體才會變快。

<!--
圖中每一條是一個 rank 在一次 allreduce 中自己花的時間，虛線是這次呼叫結束的時間點。
第一步：加速一個不是最慢的 rank，呼叫結束的時間不變，收益為 0。這就是「看起來有問題，但修了沒用」的情況。
第二步：最慢的 rank 快了 40，但原本第二慢的 rank 1 變成最慢，所以收益只有 25。
模型對每一次呼叫做這樣的計算再加總。各台電腦的時鐘不必同步，因為 MPI 呼叫有序號，可以用序號對齊同一次呼叫。
-->

---
layout: textbook
chapter: Part 4 · Model
clicks: 2
---

# 保留暫存空間的 +210 ms 怎麼算

<AtGainCall />

::note::

<Note :notes="[
  ['以一次呼叫為例。', '長條是每個 rank 自己忙的時間。', '深綠色是重複登記。', '最慢的是 rank 1。'],
  ['去掉重複登記。', '最慢的換成 rank 2。', '這次呼叫快了 0.518 ms。'],
  ['400 次呼叫逐次這樣算再加總。', '結果是 +210 ms。'],
]" />

<!--
圖中用的是案例那一次執行的平均值（job 517932，8 張網卡都可見、預設 2 條 rail），不是任何一次實際的呼叫。
「自己在忙的時間」是總時間扣掉等待其他 rank 與網路的時間。重複登記是同一塊記憶體在計時期間被登記第二次以上；每次呼叫 4 次：2 塊暫存空間 × 2 張網卡。
每次呼叫的收益 = 去掉之前最慢 rank 的時間 − 去掉之後最慢 rank 的時間。用平均值算是 0.8003 − 0.2825 = 0.5178 ms，乘 400 是 207.1 ms；模型逐次呼叫計算，結果是 210.1 ms。
所以收益不等於任何一個 rank 自己的登記時間（rank 1 是 210.6 ms）：每次呼叫只看最慢的 rank，而且最多快到第二慢的 rank 為止。
出處：docs/cli/HOW_SUGGEST_WORKS.md 第 2.1 與第 3 節。
-->

---
layout: textbook
chapter: Part 4 · Model
clicks: 2
---

# 改用 8 條 rail 的 −138 ms 怎麼算

<AtRailsGain />

::note::

<Note :notes="[
  ['每次呼叫送 6 則 1 MiB 的訊息。', '每則從 11.8 µs 變 5.7 µs。', '400 次共省 14.6 ms。'],
  ['每次呼叫重複登記 4 次。', '網卡從 2 張變 8 張。', '每次要多登記 3 次。', '登記加取消一次要 31.8 µs。', '400 次呼叫共多 152.8 ms。'],
  ['合起來是 −138 ms。', '模型預測會變慢。', '實測慢了 208 ms。', '方向對，大小低估。'],
]" />

<!--
傳輸：11.8 與 5.7 µs 是小型測試量到的一則 1 MiB 訊息用 2 條與 8 條 rail 的時間（ucx_perftest tag_bw，job 518110）。ring allreduce 每次呼叫，每個 rank 送 3 次 reduce-scatter 與 3 次 allgather，共 6 則 1 MiB。400 × 6 × 6.092 µs = 14.6 ms。
登記：每一塊暫存空間原本在 2 張網卡上各登記一次，改成 8 張就要登記 8 次，等於每一次原有的登記再多 3 次。31.8 µs = 登記 21.8 µs + 取消登記 10.0 µs，來自小型測試（reg_split，job 518110）。400 × 4 × 3 × 31.8 µs = 152.8 ms。
四個 rank 每次呼叫的變化都一樣，所以關鍵路徑的合併不改變數字。
為什麼低估，見本部分最後一頁。出處：docs/cli/HOW_SUGGEST_WORKS.md 第 2.3 節。
-->

---
layout: textbook
chapter: Part 4 · Model
ltag: Terminal
clicks: 2
---

# 模型的輸出：依預測收益排序的建議

```text {1-5|6-7|8-9}
$ ibtrace suggest runs/2rails-traced
gain (ms, % of 572.3 ms)  action and setting
 +210.1  +36.7 %  keep scratch buffers:
                  MALLOC_TRIM_THRESHOLD_=1073741824
                  MALLOC_MMAP_THRESHOLD_=33554432
  +30.2   +5.3 %  stop other work on the ranks' CPUs
 -138.1  -24.1 %  use 8 rails: UCX_MAX_RNDV_RAILS=8
not checked: NUMA binding (ranks already on the HCA's node);
  competing traffic (none seen); fewer rails (already 2)
```

::note::

<Note :notes="[
  ['第一名是保留暫存空間。', '連要設的環境變數都列出來。'],
  ['改用 8 條 rail 是負的。', '代表它會讓程式更慢。'],
  ['沒有評估的動作也會說明原因。', '例如 NUMA 綁定已經正確。'],
]" />

<!--
ibtrace suggest 印出的就是前兩頁算出來的數字。預測收益的百分比是除以程式回報的 572.3 ms。
多開 rail 是負的，因為每多一張網卡，每塊暫存空間就要多登記一次：傳輸省 14.6 ms，多出的登記 152.8 ms。
如果只看 breakdown，可能會以為「登記很多，那就多開 rail 分散一下」；模型給出的是相反的答案。
suggest 只會在固定的六個動作裡挑，完整的清單與評估條件見下一份簡報「擴充與第三版」。
第二名「移除干擾 +30 ms」可能是誤判：那些停頓可能來自新配置的暫存空間，見本部分最後一頁。
-->

---
layout: rows
chapter: Part 4 · Model
reveal: true
clicks: 2
items:
  - label: 網路監控
    title: counter 做法
    text: ['只看網卡的 counter 與設定。', '有 rail 閒置，就建議多開。']
  - label: 效能分析
    title: profiler 做法
    text: ['時間最多的那一類就是瓶頸。', '收益等於那一類的全部時間。']
  - label: 本研究
    title: 反事實模型
    text: ['逐次呼叫看最慢的 rank。', '收益可以是負的。']
---

# 與兩種傳統做法比較

::note::

<Note :notes="[
  ['案例中網卡的使用率約 5 %。', '算出改用 8 條 rail 快 21 ms。'],
  ['等待最多的 rank 是 146 ms。', '全部算成改用 8 條 rail 的收益。'],
  ['同一個動作，模型預測 −138 ms。', '實測慢了 208 ms。'],
]" />

<!--
counter 做法的收益 = 程式時間 × 最大的網卡使用率 × (1 − 目前 rail 數 ÷ 網卡數)。案例中是 572 ms × 約 0.049 × 0.75 = 20.9 ms；使用率沒有被印出，是從結果反推的。
profiler 做法對四類時間各取四個 rank 中最大的總和，直接當成收益：等待 145.9、登記 210.6、其他 104.1、停頓 12.9 ms。等待被當成多開 rail 能省下的時間。
counter 做法代表傳統的網路監控：有外來流量就判斷為網路被佔用。profiler 做法代表傳統的效能分析工具。兩者都是我們依照它們的典型做法實作的，作為比較的基準（baseline）。
profiler 做法的問題是忽略關鍵路徑：花最多時間的地方不一定在最慢的 rank 上，修掉也未必變快。
實際使用時，ibtrace suggest --baselines 會把三種做法並列印出：改用 8 條 rail，模型 −138.1、counter 做法 +20.9、profiler 做法 +145.9 ms。
-->

---
layout: rows
chapter: Part 4 · Model
reveal: true
clicks: 2
items:
  - label: 保留暫存空間
    title: 低估 35 ms
    text: ['預測 +210 ms，實測 +245 ms。', '模型只算登記本身的時間。']
  - label: 8 條 rail
    title: 低估 70 ms
    text: ['預測 −138 ms，實測 −208 ms。', '每次登記的成本可能算得太低。']
  - label: 可能的誤判
    title: 移除干擾 +30 ms
    text: ['這些停頓可能也來自新的 buffer。', '那就不是別的工作在搶 CPU。']
---

# 案例中，預測為什麼偏小

::note::

<Note :notes="[
  ['新 buffer 第一次被碰到時會停頓。', '這段約 30 ms，被算成另一項。', '兩者的關係還沒驗證。'],
  ['傳輸省下的 15 ms 可能不存在。', '多張網卡時，每次登記更貴。', '仍有約 29 ms 沒有解釋。'],
  ['這一點還沒驗證。', '若成立，這個建議應該拿掉。'],
]" />

<!--
三點都整理自 docs/cli/HOW_SUGGEST_WORKS.md 第 2.2 與第 5 節，標「還沒驗證」的都只是推測。
保留暫存空間：長於 1 ms 的空檔都落在新配置的暫存空間第一次被碰到的地方，可能是 page fault。模型把這段算成「停頓」（約 30 ms），歸給「移除干擾」，沒有算進保留暫存空間的收益。30 ms 和低估的 35 ms 同一個量級。
改用 8 條 rail：在 collective 中，多開 rail 的傳輸收益在其他測試裡沒有實現（alltoall 1 MiB：預測 +45.7 ms，實測 −49.0 ms），所以 +14.6 ms 可能根本不存在。登記成本用的是單張網卡的小型測試；同一塊記憶體依序在多張網卡上登記的實測更貴：從 2 張到 8 張，每塊多 224 µs，模型用的是 191 µs。兩點都換掉，預測是 −179 ms，與實測仍差約 29 ms。
可能的誤判：如果那些停頓真的來自新 buffer，保留暫存空間之後它們也會消失，「移除干擾」這個建議就是錯的。
開發集上也是同樣的模式：方向一致，大小偏小。
這只是一個案例。要評估模型，先要有可信、有標準答案的資料，這是下一部分；第 6 部分再在沒看過的程式上評估。
-->
