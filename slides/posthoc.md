---
theme: none
title: ibtrace · 事後分析
titleTemplate: '%s'
colorSchema: light
canvasWidth: 1920
aspectRatio: 16/9
lineNumbers: false
transition: none
routerMode: hash
drawings:
  enabled: false
layout: cover
subtitle: 評估之後，查清每一個錯誤，變成下一版的設計
---

# 第 9 階段：事後分析

---
layout: figure
chapter: Stage 9 · 位置
clicks: 3
---

# 九個階段的最後一步

<PhCycle />

---
layout: section
number: 1
chapter: v6 的事後分析
question: LU 的網卡設定為什麼沒有預測？
---

# LU 網卡組

- **1.1** 模型怎麼切單位
- **1.2** 模型的 IndexError
- **1.3** 重播校準的截斷
- **1.4** 修法

---
layout: figure
chapter: v6 的事後分析 · 1.1 切單位
clicks: 5
---

# 為什麼要把一圈切成單位

<PhWhy />

---
layout: figure
chapter: v6 的事後分析 · 1.1 切單位
clicks: 4
---

# 模型怎麼從 trace 找出單位

<PhUnits />

---
layout: figure
chapter: v6 的事後分析 · 1.2 IndexError
clicks: 5
---

# 第一個錯：拿不到的單位

<PhIndex />

---
layout: textbook
chapter: v6 的事後分析 · 1.2 IndexError
---

# 修正後：不再出錯，預測是 0 ms

| 組 | 實測 ΔT | 修正後預測 | 誤差 |
| --- | ---: | ---: | ---: |
| LU 改成同側 4 張 | +404.01 ms | 0 ms | −16.2 pp |
| LU 改成同側 2 張 | +548.90 ms | 0 ms | −23.4 pp |

99 份 trace 重算，其他 93 份與 v6 逐位相同。

沒有校準資料，網卡動作依規則記為不預測。

---
layout: figure
chapter: v6 的事後分析 · 1.3 截斷
clicks: 4
---

# 為什麼要演練通訊來量網卡

<PhRehearse />

---
layout: figure
chapter: v6 的事後分析 · 1.3 截斷
clicks: 4
---

# 演練實際怎麼做

<PhReplay />

---
layout: figure
chapter: v6 的事後分析 · 1.3 截斷
clicks: 23
---

# 第二個錯：錨點、第 95 圈、順序差一格與修法

<PhLapShift />

---
layout: textbook
chapter: v6 的事後分析 · 1.4 修法
---

# 修法：送與收取同一批訊息

| 修法 | 對 LU | 對 BT |
| --- | --- | --- |
| 以送方為準切收方的訊息 | 錯位消失 | 計畫不變 |
| 產生計畫時逐則比對大小 | 配不上就不預測 | 沒有影響 |
| 保留 tag | 修不好 | 沒有影響 |
| 放大接收緩衝 | 不截斷，但時間仍錯 | 只是掩蓋 |

前兩項一起做，寫在新版本。

---
layout: end
chapter: Summary
next: 實作新的重播計畫，用現有 trace 重做 LU 的校準
---

# Q&A
