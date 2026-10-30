---
layout: section
number: 4
chapter: Part 4 · Results
question: 預測準不準？
---

# 驗證與結果

- **4.1** 驗證流程
- **4.2** 與傳統做法比較
- **4.3** 發現與限制

---
layout: figure
chapter: Part 4 · Results · 4.1 驗證流程
---

# 驗證：實際做那個動作，量真正的 ΔT

<FinDg name="valid" />

---
layout: textbook
chapter: Part 4 · Results · 4.2 與傳統做法比較
---

# 誤差只有傳統做法的 1/5 到 2/5

| 指標 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| 預測收益的誤差 | **7.3 百分點** | 38.6 百分點 | 19.3 百分點 |
| 方向正確 | **5 / 8 組** | 0 / 10 組 | 1 / 10 組 |
| 實測最佳的動作排第一 | **12 / 15 次** | 0 / 18 次 | 1 / 18 次 |

本研究的數字來自評估流程（就地校準），不是 suggest 目前的常數。

---
layout: textbook
chapter: Part 4 · Results · 4.2 與傳統做法比較
---

# NPB BT：只有本研究預測得到網卡的收益

| 全部 8 張 → | 實測 ΔT | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: | ---: |
| 同側 4 張 | +626.4 ms | +501.5 ms | 0 ms | 0 ms |
| 同側 2 張 | +760.9 ms | +615.8 ms | 0 ms | 0 ms |

---
layout: textbook
chapter: Part 4 · Results · 4.3 發現與限制
---

# 發現：混用對側的網卡，就和 8 張一樣慢

| 每次迭代（4×4） | 同側 2 張 | 同側 4 張 | 2 同側 + 2 對側 | 全部 8 張 |
| --- | ---: | ---: | ---: | ---: |
| allgather 256 KiB | 147.8 µs | **112.6 µs** | 181.0 µs | 177.0 µs |
| alltoall 1 MiB | 581.4 µs | **515.9 µs** | 720.9 µs | 725.8 µs |

---
layout: textbook
chapter: Part 4 · Results · 4.3 發現與限制
---

# 限制

| 限制 | 影響 |
| --- | --- |
| suggest 還沒接上就地校準 | 使用者工具目前用預先量好的常數 |
| 點對點的重播校準不穩 | MG 找不到迴圈，LU 配對出錯 |
| 重播量不準固定成本 | 網卡收益大小可能差 30–80 % |
| 只在一個叢集驗證 | 8 張網卡、UCX 1.20、Open MPI 4.1 |
| 每次執行只有 1–2 s | 固定成本的比例被放大 |

---
layout: end
chapter: Summary
next: 修正點對點的重播校準，換一個叢集驗證
---

# Q&A
