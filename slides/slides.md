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
subtitle: 找出 tracer overhead 的來源並加以優化
---

# ibtrace 的 Tracer Overhead

<!--
這次報告的主題是 ibtrace 自身的 overhead：啟用 tracer 之後，被測程式被拖慢多少，以及這件事對先前結論的影響。
-->

---
layout: objectives
chapter: Overview
---

# 報告重點

1. 開 tracer 會放大兩種 transport 的差距。
2. 三項優化讓 overhead 降到原本的 18–43 %。
3. 量測時先拆解成本，再決定優化什麼。
4. 記錄格式完全不變，並以回歸測試確認。

<!--
第 1 點：先前的比較結論因此失準。第 2 點：overhead 主要來自系統呼叫、字串格式化與時鐘讀取。第 3 點：以單次執行為統計單位，並只比較同一批量測內的差值。
前兩點是結果，後兩點是過程中整理出的方法。時間不夠時，講第 1、2 點，以及第 3 點中「為什麼優化停在這裡」。
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
