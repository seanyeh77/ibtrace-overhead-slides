---
theme: none
title: ibtrace · 擴充與後續版本
colorSchema: light
canvasWidth: 1920
aspectRatio: 16/9
lineNumbers: false
transition: none
routerMode: hash
drawings:
  enabled: false
layout: cover
subtitle: 還沒涵蓋的優化，以及第三到第五版的修正與評估
---

# 擴充與後續版本

---
layout: objectives
chapter: Overview
---

# 報告重點

1. 第二版選對動作，但收益大小不夠準。
2. 在途數與切塊大小，加入三項設定。
3. 第三版：就地校準與排隊時間，進步有限。
4. 第四版：搶 CPU 量整次執行，誤差 3.7 百分點。
5. 8 條 rail 變慢是跨 NUMA，只用同側網卡就能避開。
6. 第五版預測這個新動作，長執行只差 3 %。
7. 弱點：點對點的應用，校準還做不起來。

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
src: ./ext/07-v5.md
---

---
src: ./ext/08-summary.md
---
