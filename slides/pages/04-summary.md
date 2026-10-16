---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="主要發現" value="Tracer 放大 transport 差距">rc_mlx5 只比 rc_verbs 快 2–14 %。<br>先前的 45 % 來自 overhead 的差異。</Tile>
<Tile label="優化前" value="3.9–12.7 µs">每次來回增加的時間。<br>占 RTT 的 21–139 %。</Tile>
<Tile variant="accent" label="優化後" value="0.7–4.5 µs">三項優化後增加的時間。<br>占 RTT 的 8–28 %。</Tile>
<Tile label="寫一筆記錄" value="296 → 20 ns">快取 pid 與 tid。<br>以複製取代 snprintf。</Tile>
<Tile label="一個 span" value="41.5 → 23.8 ns">時間戳改由 TSC 換算。<br>仍與原本的時鐘對齊。</Tile>
<Tile label="方法" value="先拆解，再優化" wide>以單次執行為統計單位。<br>只比較同一 job 內的差值。</Tile>

---
layout: end
chapter: Summary
next: 控制量測路徑，並以可控的瓶頸驗證 attribution
---

# Q&A

- `span`
- `getpid / gettid`
- `TSC`
- `MADV_WIPEONFORK`
- `build-id`

<!--
下一步不再繼續壓低 tracer 的 overhead，而是回到研究本身：
1. 同一組測試換一對節點，基準就相差 10–33 %；要先記錄並控制量測路徑，基準才能重現。
2. 以答案已知的瓶頸實驗，例如用 ib_write_bw 製造競爭流量，驗證 attribution 是否判斷正確。
3. 用現有的逐次迭代資料分析延遲分佈的尾端，不需要再跑叢集。
-->
