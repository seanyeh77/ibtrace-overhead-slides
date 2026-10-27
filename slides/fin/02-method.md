---
layout: section
number: 2
chapter: Part 2 · Method
question: 怎麼從 trace 算出 ΔT？
---

# 方法

- **2.1** 量到什麼
- **2.2** 模型怎麼算
- **2.3** 校準：在同一組節點上量懲罰

---
layout: textbook
chapter: Part 2 · Method · 2.1 量到什麼
clicks: 1
---

# 一次執行錄下四種資料

| 資料 | 怎麼量 | 用來回答 |
| --- | --- | --- |
| trace | 攔截 UCX 與 verbs 的每一次呼叫 | 每個 rank 在每次呼叫花了多久 |
| 網卡 counter | ibmon 讀 port counter | 外來流量、每張卡的流量 |
| 排隊時間 | 每 1 ms 讀一次 schedstat | 程式被別人搶走 CPU 多久 |
| UCX 設定 | 錄製時存下 ucx_info 與協定表 | 用了哪些網卡、哪種協定 |

::note::

<Note :notes="[
  ['全部用一般使用者的權限。', '不需要 root 或管理員。'],
  ['開 tracer 每次操作多 0.84–2.91 µs。', '開與不開，ΔT 的比值中位數 1.02。'],
]" />

---
layout: rows
numbered: true
chapter: Part 2 · Method · 2.2 模型怎麼算
items:
  - title: 找出主迴圈
    text: ['從 trace 找出重複的週期。', '各 rank 用第幾個週期對齊。']
  - title: 每次呼叫取最慢的 rank
    text: ['collective 要等最慢的 rank。', '只有它變快，整體才會變快。']
  - title: 逐次呼叫算差，再加總
    text: ['懲罰 × 受影響的訊息數。', '加上迴圈外的部分與固定成本。']
---

# 模型怎麼算 ΔT

::note::

<Note :notes="[
  ['同一次呼叫的小訊息取最大值。', '它們同時在途，延遲會重疊。'],
]" />

---
layout: textbook
chapter: Part 2 · Method · 2.3 校準：在同一組節點上量懲罰
clicks: 1
---

# 校準：程式跑完後，直接量懲罰

| 瓶頸 | 受影響的路徑 | 對照路徑 |
| --- | --- | --- |
| 網路被佔用 | 程式用的網卡，外來流量還在 | 同一側沒有外來流量的網卡 |
| NUMA 錯置 | CPU 在網卡的另一側 | CPU 綁回網卡那一側 |
| 網卡設定 | 目前的設定 | 候選設定，全部 rank 同時跑 |

::note::

<Note :notes="[
  ['懲罰 = 受影響 − 對照。', '用程式自己的訊息大小。', '不用外部的常數。'],
  ['網卡設定：collective 用程式本身，', '點對點的程式重播一個週期。', '同時量每次迭代與固定成本。'],
]" />

---
layout: textbook
chapter: Part 2 · Method · 2.3 校準：在同一組節點上量懲罰
clicks: 1
---

# 分辨「在計算」與「被搶走 CPU」

| 項目 | 有忙迴圈 | 沒有忙迴圈 |
| --- | ---: | ---: |
| 呼叫之間的空檔 | 1,652 ms | 823 ms |

| 只看空檔 | 看排隊時間 | 實測 ΔT |
| ---: | ---: | ---: |
| +1,850 ms | +975 ms | +984 ms |

::note::

<Note :notes="[
  ['沒有瓶頸時，空檔也有 823 ms。', '那是正常的計算。'],
  ['只看空檔會高估將近一倍。', '排隊等 CPU 的時間才是被搶。', '例子：miniFE 搶 CPU。'],
]" />
