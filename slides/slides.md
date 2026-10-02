---
theme: none
title: ibtrace · Tracer Overhead
colorSchema: light
canvasWidth: 1920
aspectRatio: 16/9
lineNumbers: false
transition: none
routerMode: hash
drawings:
  enabled: false
layout: cover
subtitle: tracer 對量測的擾動、三項優化與量測方法
---

# Tracer 的量測成本

<!--
這次報告的主題是 ibtrace 自己的成本：掛上 tracer 之後，被量測的程式被拖慢多少，以及這件事對先前結論的影響。
-->

---
layout: objectives
chapter: Overview
---

# 報告重點

1. tracer 會扭曲 transport 之間的比較
2. 成本集中在三處，優化後降到約三分之一
3. 量測方法：先拆解、再優化，統計要誠實
4. 正確性：優化不改輸出，驗證不能假通過

<!--
四個重點，前兩個是結果，後兩個是過程中學到的方法。時間不夠時講第 1、2 點，以及第 3 點裡「為什麼停在這裡」。
-->

---
src: ./pages/00-setup.md
---

---
src: ./pages/01-findings.md
---

---
src: ./pages/02-method.md
---

---
src: ./pages/03-correctness.md
---

---
src: ./pages/04-summary.md
---
