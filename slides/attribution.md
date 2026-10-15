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
subtitle: 不只指出哪裡異常，而是預測每個優化動作能讓程式快多少
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

1. 研究目標從「找出哪裡異常」改為「預測每個優化動作能讓程式快多少」
2. 修正 tracer 在 MPI 程式下的問題，並建立 2,200 次執行、每一筆都有實測答案的資料集
3. 發現一個預設設定下的瓶頸：看使用率會建議多開 rail，結果慢 38 %；trace 找到的修法則快 43 %
4. 預測模型在沒看過的程式上，選對優化動作的比例為 93 %，兩種傳統做法都是 53 %

<!--
第 1 點是研究問題，第 2 點是為了回答它而做的基礎工作，第 3 點是過程中最重要的單一發現，第 4 點是預測模型的結果。
時間不夠時，講第 1、3、4 點。
-->

---
src: ./attr/00-background.md
---

---
src: ./attr/01-question.md
---

---
src: ./attr/02-dataset.md
---

---
src: ./attr/03-case.md
---

---
src: ./attr/04-model.md
---

---
src: ./attr/05-summary.md
---
