---
theme: none
title: ibtrace · 擴充、第三版與第四版
colorSchema: light
canvasWidth: 1920
aspectRatio: 16/9
lineNumbers: false
transition: none
routerMode: hash
drawings:
  enabled: false
layout: cover
subtitle: 還沒涵蓋的優化，以及兩次修正與評估
---

# 擴充、第三版與第四版

---
layout: objectives
chapter: Overview
---

# 報告重點

1. 第二版選對動作，但收益大小不夠準。
2. 在途數與切塊大小，加入三項設定。
3. 第三版用就地校準取代外部常數。
4. 第三版用排隊時間分辨計算與被搶。
5. 單 rank 時誤差從 14.7 降到 9.2 百分點。
6. 在新程式上，第三版沒有明顯比第二版好。
7. 第四版的誤差最小：3.7 百分點。
8. 8 條 rail 變慢是跨 NUMA，只用同側網卡就能避開。

---
src: ./ext/01-recap.md
---

---
src: ./ext/02-coverage.md
---

---
src: ./ext/03-v3.md
---

---
src: ./ext/04-protocol.md
---

---
src: ./ext/05-evaluation.md
---

---
src: ./ext/06-v4.md
---

---
src: ./ext/07-summary.md
---
