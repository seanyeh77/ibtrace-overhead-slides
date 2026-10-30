---
layout: section
number: 2
chapter: Part 2 · Calibrate
question: 程式結束後，量什麼？
---

# 就地校準

- **2.1** 流程：從 trace 決定要量什麼
- **2.2** 受影響與對照路徑
- **2.3** 網卡設定的候選
- **2.4** 固定成本與每圈怎麼分開

---
layout: figure
chapter: Part 2 · Calibrate · 2.1 流程
---

# 從 trace 決定要量什麼

<FinDg name="calib" />

---
layout: textbook
chapter: Part 2 · Calibrate · 2.1 流程
---

# 實例：NPB SP，網卡上有別人的流量

| 訊息大小 | 走有流量的卡 | 走同側乾淨的卡 | 每則多花（懲罰） |
| ---: | ---: | ---: | ---: |
| 8 B | 0.34 µs | 0.18 µs | **0.16 µs** |
| 19,200 B | 26.2 µs | 11.7 µs | **14.6 µs** |
| 42,240 B | 27.6 µs | 12.7 µs | **14.9 µs** |
| 61,440 B | 28.8 µs | 13.4 µs | **15.4 µs** |

rank 1：mlx5_3 上多出 259 Gb/s；對照是同側沒人用的 mlx5_5。沒量到的 39,600 B 內插約 14.9 µs。

---
layout: figure
chapter: Part 2 · Calibrate · 2.2 兩條路徑
---

# 受影響路徑與對照路徑

<FinDg name="topo" />

---
layout: figure
chapter: Part 2 · Calibrate · 2.3 網卡設定
---

# 網卡設定：4 個候選各量一次

<FinDg name="nicCal" />

---
layout: figure
chapter: Part 2 · Calibrate · 2.4 固定成本與每圈
---

# 固定成本與每圈：跑一次，扣掉每圈

<FinFit />

---
layout: textbook
chapter: Part 2 · Calibrate · 2.4 固定成本與每圈
---

# 實例：8 張 → 同側 4 張，兩個差

| osu_reduce_scatter | 校準量到 | 實測 |
| --- | ---: | ---: |
| 每圈的差 | 快 164 µs | 快 170 µs |
| 固定成本的差 | 快 517 ms | 快 457 ms |
| 短執行 660 圈：164 µs × 660 + 517 ms | 625 ms | 569 ms |
| 長執行 44,000 圈：164 µs × 44,000 + 517 ms | 7,715 ms | 7,951 ms |

實測欄：660 圈與 44,000 圈兩次實驗的 ΔT，兩點反推出 170 µs 與 457 ms。
