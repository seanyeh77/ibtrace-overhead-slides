---
layout: section
number: 1
chapter: Part 1 · Record
question: ibtrace record 在節點上做了什麼？
---

# 錄製

- **1.1** 跨節點：srun 之後
- **1.2** 一個行程裡：攔截與 ring
- **1.3** 一筆記錄：span

---
layout: figure
chapter: Part 1 · Record · 1.1 跨節點
takeaway: 每個 rank 寫自己的 ring，ibmon 讀出後寫進共用的執行目錄
---

# srun 之後：每個節點上有什麼

<FinDg name="record" />

---
layout: figure
chapter: Part 1 · Record · 1.2 一個行程裡
takeaway: 攔截 UCP、UCT、verbs 三層；ibmon 另外取樣 counter 與 schedstat
---

# 一個行程裡：資料從哪裡來

<FinDg name="process" />

---
layout: figure
chapter: Part 1 · Record · 1.3 一筆記錄
takeaway: 進入與離開都用 CLOCK_MONOTONIC，和 counter 取樣在同一條時間軸
---

# 一個 span：一次被攔截的呼叫

<FinDg name="span" />

---
layout: textbook
chapter: Part 1 · Record · 1.3 一筆記錄
---

# 錄製的代價

| 項目 | 數值 |
| --- | ---: |
| 每次被攔截的呼叫多花 | 0.84–2.91 µs |
| 每個行程多用的記憶體（ring） | 128 MiB |
| ΔT 的比值（開 ÷ 不開 tracer），32 組中位數 | 1.02 倍 |
| 需要的權限 | 一般使用者 |
