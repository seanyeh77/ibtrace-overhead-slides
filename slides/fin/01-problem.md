---
layout: section
number: 1
chapter: Part 1 · Problem
question: 為什麼要預測優化的收益？
---

# 問題

- **1.1** 一個反直覺的案例
- **1.2** 研究問題

---
layout: compare
chapter: Part 1 · Problem · 1.1 一個反直覺的案例
left: 看使用率（counter）
right: 看 trace
reveal: true
clicks: 3
rows:
  - ['看到', '8 張網卡只用了 2 張', '每次呼叫都重新登記同一塊記憶體']
  - ['建議', '改用 8 條 rail', '讓暫存空間留在程式裡']
  - ['結果', 'allreduce 慢 38 %', 'allreduce 快 45 %']
---

# 看使用率與看 trace，得到相反的建議

---
layout: rows
numbered: true
chapter: Part 1 · Problem · 1.2 研究問題
items:
  - title: 輸入
    text: ['程式一次執行的 trace。', '一般使用者的權限就能錄。']
  - title: 輸出
    text: ['每個優化動作的預測收益 ΔT。', '依收益排序，正負都要對。']
  - title: 驗證
    text: ['實際做那個動作，量真正的 ΔT。', '用沒看過的程式評估。']
---

# 研究問題：動手之前，先預測收益

::note::

<Note :notes="[
  ['ΔT = 優化前的時間 − 優化後。', '正的表示變快。', '優化動作可能有害，所以正負要對。'],
]" />
