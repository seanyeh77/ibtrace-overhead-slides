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

---
layout: figure
chapter: Part 2 · Calibrate · 2.1 流程
takeaway: 只量 trace 裡有觸發的瓶頸，用程式自己的訊息大小
---

# 從 trace 決定要量什麼

<FinDg name="calib" />

---
layout: figure
chapter: Part 2 · Calibrate · 2.2 兩條路徑
takeaway: 懲罰 = 受影響 − 對照，兩者只差一個因素
---

# 受影響路徑與對照路徑

<FinDg name="topo" />

---
layout: figure
chapter: Part 2 · Calibrate · 2.3 網卡設定
takeaway: 每個候選量出兩個數：每次迭代多久、固定成本多少
---

# 網卡設定：4 個候選各量一次

<FinDg name="nicCal" />
