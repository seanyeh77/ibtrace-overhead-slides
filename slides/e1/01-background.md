---
layout: section
number: 1
chapter: Part 1 · Background
question: 這次實驗要回答什麼？
---

# 方向與硬體

- **1.1** 方向與判準
- **1.2** NUMA 與綁核

---
layout: rows
chapter: Part 1 · Background · 1.1 方向與判準
numbered: true
items:
  - title: 使用真實預設
    text: 不設任何 UCX 參數，也不綁核。
  - title: 答案來自實測
    text: 實際改設定，量出快了多少。
  - title: 預測先凍結
    text: ['先寫下預測並鎖住。', '之後才看實測結果。']
  - title: 和簡單做法比較
    text: 工具要贏過固定規則與隨機挑選。
---

# 方向：從真實預設出發

::note::
以前的實驗用了人為設定，例如強制使用 8 張網卡。

一般使用者不會這樣設定。

---
layout: textbook
chapter: Part 1 · Background · 1.1 方向與判準
---

# 判準：下界超過 3 % 才算有空間

| 判斷 | 條件 |
| --- | --- |
| 有空間 | 收益的 95 % 區間下界大於 3 % |
| 有害 | 收益的 95 % 區間上界小於 0 % |
| 估計準確 | 估計值落在實測收益的 0.5–1.5 倍 |

::note::
收益 ＝ 1 − 改後時間 ÷ 預設時間。

區間用 log 時間的 Welch t 檢定。

3 % 約是對照組雜訊的上限。

---
layout: textbook
chapter: Part 1 · Background · 1.2 NUMA 與綁核
---

# 一台機器有 8 個 NUMA node

| 位置 | NUMA node | CPU 編號 | 網卡 |
| --- | --- | --- | --- |
| 第 1 顆 CPU | node 0–3 | 0–55 | 掛在 node 1 |
| 第 2 顆 CPU | node 4–7 | 56–111 | 沒有 |

每個 node 有 14 顆核心，一台共 112 顆。

::note::
NUMA：讀自己旁邊的記憶體快，讀遠處的慢。

這台叢集開啟 SNC4，每顆 CPU 切成 4 個 node。

網卡在 node 1，也就是 CPU 14–27。

---
layout: definition
chapter: Part 1 · Background · 1.2 NUMA 與綁核
term: 綁核
---

英文是 CPU binding。

規定一個 rank 只能在哪些 CPU 上執行。

預設不綁，系統可以把 rank 搬到別處。

這次實驗比較 7 種綁法。
