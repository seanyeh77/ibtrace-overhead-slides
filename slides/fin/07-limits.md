---
layout: section
number: 7
chapter: Part 7 · Limits
question: 還有哪些做不到？
---

# 限制與未來工作

---
layout: textbook
chapter: Part 7 · Limits
---

# 已知的限制

| 限制 | 影響 |
| --- | --- |
| 點對點程式的重播校準不穩 | 三個測試程式只有 BT 成功；MG 找不到迴圈，LU 配對出錯 |
| 重播量不準固定成本 | 網卡收益的方向對，大小可能差 30–80 % |
| 啟動時的排隊時間 | 可能被誤判成搶 CPU |
| 只在一個叢集驗證 | 每節點 8 張網卡、UCX 1.20、Open MPI 4.1 |
| 每次執行只有 1–2 s | 固定成本的比例被放大 |
| 每個程式只有 5–6 組 | 差一組，名次就可能改變 |

::note::

<Note :notes="[
  ['方向大多正確，大小還不可靠。', '出錯與不預測都照實計分。'],
]" />

---
layout: rows
numbered: true
chapter: Part 7 · Limits
items:
  - title: 修正重播的配對
    text: ['依 trace 的 tag 與對象配對訊息。', '讓點對點程式都能校準。']
  - title: 更長的執行與更多程式
    text: ['用真實應用的執行長度驗證。', '每個程式更多組，結論更穩。']
  - title: 換一個叢集
    text: ['不同的網卡數與軟體版本。', '確認方法可以移植。']
  - title: 更多優化動作
    text: ['collective 演算法、協定門檻。', '長期延伸到 GPU 與 NCCL。']
---

# 未來工作

---
layout: rows
chapter: Summary
items:
  - label: 方法
    title: 從 trace 預測每個優化動作的收益
    text: ['逐次呼叫比較各 rank。', '懲罰在同一組節點上直接量。']
  - label: 準度
    title: 誤差 7.3 百分點
    text: ['在沒看過的程式上。', '兩種傳統做法：38.6 與 19.3 百分點。']
  - label: 發現
    title: 多個 rank 同時跨 NUMA 會互相拖慢
    text: ['只用同側的網卡就能避開。', 'collective 的長執行，預測只差 3 %。']
  - label: 限制
    title: 點對點程式的校準還不穩
    text: ['方向大多正確，大小還不可靠。']
---

# 重點整理

---
layout: end
chapter: Summary
next: 修正點對點程式的重播校準，換一個叢集驗證
---

# Q&A

- `ΔT`
- `校準`
- `schedstat`
- `NUMA`
