---
layout: section
number: 3
chapter: Part 3 · Suggest
question: ibtrace suggest 怎麼算出 ΔT？
---

# 分析

- **3.1** 流程與主迴圈
- **3.2** 每次呼叫取最慢的 rank
- **3.3** ΔT 的三個部分
- **3.4** 輸出

---
layout: figure
chapter: Part 3 · Suggest · 3.1 流程
---

# 從 trace 到 ΔT

<FinDg name="sug" />

---
layout: figure
chapter: Part 3 · Suggest · 3.1 主迴圈
---

# 主迴圈長什麼樣子

<FinDg name="loop" />

---
layout: figure
chapter: Part 3 · Suggest · 3.2 取最慢的 rank
---

# 每次呼叫，只看最慢的 rank

<FinDg name="perCall" />

---
layout: figure
chapter: Part 3 · Suggest · 3.3 ΔT 的三個部分
---

# ΔT 的三個部分

<FinDg name="dtParts" />

---
layout: textbook
chapter: Part 3 · Suggest · 3.4 輸出
---

# 輸出：每個動作的 ΔT 與要改的設定

| 瓶頸 | 動作 | 給使用者的設定 |
| --- | --- | --- |
| 重複登記記憶體 | 保留暫存空間 | 兩個 MALLOC 門檻 |
| 搶 CPU | 移走同核心的工作 | 要自己找出那個工作 |
| NUMA 錯置 | 綁回網卡那一側 | numactl 綁 CPU 與記憶體 |
| 網路被佔用 | 移除競爭流量 | 要停掉外來流量 |
| 網卡設定 | 選最快的候選 | 每個 rank 的 UCX_NET_DEVICES |
