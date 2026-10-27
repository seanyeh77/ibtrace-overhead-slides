---
theme: none
title: ibtrace · 成果總整
colorSchema: light
canvasWidth: 1920
aspectRatio: 16/9
lineNumbers: false
transition: none
routerMode: hash
drawings:
  enabled: false
layout: cover
subtitle: 從一次執行的 trace，預測每個優化動作能讓程式快多少
---

# 預測優化的收益

---
layout: objectives
chapter: Overview
---

# 報告重點

1. 看使用率給出的建議，可能讓程式變慢。
2. 從 trace 預測每個優化動作的收益 ΔT。
3. 在沒看過的程式上，誤差 7.3 百分點。
4. 兩種傳統做法：38.6 與 19.3 百分點。
5. 發現：多個 rank 同時跨 NUMA 會互相拖慢。
6. 新動作「只用同側的網卡」，預測得到收益。

---
src: ./fin/01-problem.md
---

---
src: ./fin/02-method.md
---

---
src: ./fin/03-actions.md
---

---
src: ./fin/04-evaluation.md
---

---
src: ./fin/05-results.md
---

---
src: ./fin/06-findings.md
---

---
src: ./fin/07-limits.md
---
