---
theme: none
title: ibtrace · Counterfactual Attribution
colorSchema: light
canvasWidth: 1920
aspectRatio: 16/9
lineNumbers: false
transition: none
routerMode: hash
drawings:
  enabled: false
layout: cover
subtitle: 預測每個優化動作能讓程式快多少
---

# 從找出瓶頸到預測收益

<!--
上一次報告處理的是 ibtrace 自己的 overhead。這一次往研究的主題前進：給定一個跑得慢的平行程式，告訴使用者該做哪個優化、做了能快多少。
這份簡報假設聽眾沒有 InfiniBand 與 MPI 的背景，所有名詞都會在第一次出現前定義。
-->

---
layout: objectives
chapter: Overview
---

# 報告重點

1. 多開 rail 讓 allreduce 慢了 38 %。
2. trace 找到原因，修正後快 45 %。
3. 研究目標是預測每個優化動作的收益。
4. 模型在沒看過的程式上，選對的比例是 93 %。
5. 四個 ibtrace 指令，就能照著做一次。

<!--
整份報告沿著同一個案例往下走：第 1 點是反直覺的現象，第 2 點用 trace 找到原因，第 3 點把它推廣成研究問題，第 4 點是預測模型與 2,200 次執行的驗證，第 5 點是使用方式。
每一部分的開頭都會寫出這一部分要回答的問題，也就是上一部分留下的問題。
時間不夠時，講第 1、2、4 點。
-->

---
src: ./attr/01-phenomenon.md
---

---
src: ./attr/02-diagnosis.md
---

---
src: ./attr/03-question.md
---

---
src: ./attr/04-model.md
---

---
src: ./attr/05-validation.md
---

---
src: ./attr/06-usage.md
---

---
src: ./attr/07-summary.md
---
