---
layout: section
number: 4
chapter: Part 4 · Evaluation
question: 怎麼確定預測是準的？
---

# 評估方法

- **4.1** 製造瓶頸
- **4.2** 公平的評估流程

---
layout: textbook
chapter: Part 4 · Evaluation · 4.1 製造瓶頸
clicks: 1
---

# 用一般使用者的權限製造瓶頸

| 瓶頸 | 製造方式 | 移除方式 |
| --- | --- | --- |
| 搶 CPU | 在程式的核心放一個忙迴圈 | 移到別的核心 |
| NUMA 錯置 | 把程式綁到網卡另一側 | 綁回網卡那一側 |
| 網路被佔用 | 對程式的網卡灌 ib_write_bw | 停止灌流量 |
| 網卡設定 | 每個 rank 用全部 8 張 | 每個 rank 用同側 2 張或 4 張 |
| 對照組 | 流量灌到程式沒用的網卡 | 預期 ΔT 接近 0 ms |

::note::

<Note :notes="[
  ['每個狀態不開 tracer 跑 10 次。', '兩邊的中位數相減，就是實測 ΔT。'],
  ['模型讀開 tracer 的執行。', '答案用不開 tracer 的執行。'],
]" />

---
layout: rows
numbered: true
chapter: Part 4 · Evaluation · 4.2 公平的評估流程
items:
  - title: 先定版，再收測試資料
    text: ['模型打上 git tag 後不再修改。', '測試程式在定版前不執行。']
  - title: 規則先寫死
    text: ['計分規則在收資料前 commit。', '看到結果後不改任何東西。']
  - title: 每個 job 先檢查節點
    text: ['延遲、頻寬、每對節點的傳輸。', '不合格的節點排除，job 作廢重送。']
  - title: 對照組當關卡
    text: ['對照組的 ΔT 必須接近 0 ms。', '不通過就先停下，不計分。']
---

# 公平的評估流程

::note::

<Note :notes="[
  ['同一組比較在同一個 job 內完成。', '不同 job 之間約有 10 % 的變動。'],
]" />
