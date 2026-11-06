---
layout: section
number: 3
chapter: Part 3 · Predictions
question: 三種方法怎麼算出預測？
---

# 預測 ΔT

- **3.1** 本研究
- **3.2** counter 做法
- **3.3** profiler 做法

---
layout: rows
numbered: true
chapter: Part 3 · Predictions · 3.1 本研究
items:
  - title: 切成一圈一圈
    text: 找出主迴圈，用第幾圈對齊各 rank。
  - title: 算每圈省多少
    text: 每個 rank、每一圈，各算拿掉瓶頸後少花的時間。
  - title: 取最慢的 rank
    text: 同一圈只看最慢的 rank，因為其他 rank 要等它。
  - title: 加總並加上迴圈外
    text: 所有圈加起來，再加上迴圈前後的部分。
---

# 本研究：每個動作都走同一個骨架

---
layout: textbook
chapter: Part 3 · Predictions · 3.1 本研究
---

# 每個動作只差「每圈省多少」怎麼算

| 動作 | 每圈省多少 | 資料來源 |
| --- | --- | --- |
| 移除搶 CPU | 這一圈排隊等 CPU 的時間 | schedstat，每 1 ms 一筆 |
| 修正 NUMA 錯置 | 每則訊息的 NUMA 懲罰加總 | 就地校準的懲罰表 |
| 移除外來流量 | 大訊息懲罰相加，小訊息取最大 | 就地校準的懲罰表 |
| 改網卡設定 | 每圈的差 × 圈數 + 固定成本的差 | 4 個候選實際各跑一次 |

---
layout: textbook
chapter: Part 3 · Predictions · 3.1 本研究
---

# 本研究的預測和實測

| 組 | 實測 ΔT | 本研究 |
| --- | ---: | ---: |
| LU 搶 CPU | +1,671.67 ms | +1,560.10 ms |
| BT 搶 CPU | +2,139.97 ms | +2,029.71 ms |
| BT 8 張 → 同側 4 張 | +626.41 ms | +501.49 ms |
| BT 8 張 → 同側 2 張 | +760.87 ms | +615.84 ms |
| LU 外來流量 | +6.03 ms | +116.42 ms |

外來流量的懲罰，比程式實際遇到的大。

---
layout: textbook
chapter: Part 3 · Predictions · 3.2 counter 做法
---

# counter 做法：只看網卡計數器，套用比例

| 動作 | 什麼時候提出 | 預測多少 |
| --- | --- | --- |
| 移除外來流量 | 外來流量 > 1 Gb/s | T × 外來流量 ÷ 網卡頻寬，最多 T |
| 修正 NUMA 錯置 | CPU 在網卡對側 | T × 5 %，固定的經驗值 |
| 多開網卡 | 用的卡少，其他卡閒置 | T × 使用率 × (1 − 目前張數 ÷ 可用張數) |

它代表只有網卡監控時的常識推論。

規則在第一版就固定，之後沒有改過。

---
layout: textbook
chapter: Part 3 · Predictions · 3.2 counter 做法
---

# counter 做法高估了外來流量

| 組 | 開 tracer 的 T | counter 預測 | 實測 ΔT |
| --- | ---: | ---: | ---: |
| MG 外來流量 | 1,194.07 ms | +1,194.07 ms | +8.70 ms |
| LU 外來流量 | 2,541.58 ms | +2,541.58 ms | +6.03 ms |
| BT 外來流量 | 3,098.57 ms | +3,098.57 ms | +16.60 ms |
| MG NUMA 錯置 | 1,216.29 ms | +60.81 ms（5 %） | +23.77 ms |

外來流量接近網卡上限，比例就接近 100 %。

但程式大部分時間在計算，沒有被頻寬卡住。

---
layout: textbook
chapter: Part 3 · Predictions · 3.3 profiler 做法
---

# profiler 做法：哪一類時間多，就說能省那一類

| 時間類別 | 對應的動作 | 預測多少 |
| --- | --- | --- |
| 呼叫中被卡住 | 移除搶 CPU | 這類時間的總和 |
| 登記記憶體 | 避免重複登記 | 這類時間的總和 |
| 等通訊 | 有外來流量時移除它，否則只說「網路」 | 這類時間的總和 |
| 其他 | 只說「計算」 | 這類時間的總和 |

每一類取各 rank 中最大的值。

「網路」與「計算」不是動作，排第一時一律算錯。

---
layout: textbook
chapter: Part 3 · Predictions · 3.3 profiler 做法
---

# profiler 做法看不到兩次呼叫之間的搶 CPU

| 組 | 實測 ΔT | profiler 預測 | 原因 |
| --- | ---: | ---: | --- |
| MG 搶 CPU | +321.61 ms | 0 ms | 忙迴圈搶的是計算時間 |
| BT 搶 CPU | +2,139.97 ms | +27.75 ms | 只算到呼叫中的卡住 |
| BT 外來流量 | +16.60 ms | +44.59 ms | 等通訊的總時間 |
| BT 8 張 → 同側 4 張 | +626.41 ms | 0 ms | 沒有網卡位置的概念 |

---
layout: textbook
chapter: Part 3 · Predictions · 3.3 三種方法比較
---

# 只有本研究在估「拿掉之後會怎樣」

| 方法 | 回答的問題 |
| --- | --- |
| 本研究 | 每圈最慢的 rank 少花多少時間 |
| counter 做法 | 網卡被占了幾成，就照比例省 |
| profiler 做法 | 時間花在哪一類，就假設那類全省 |

counter 與 profiler 都只描述「現在怎樣」。
