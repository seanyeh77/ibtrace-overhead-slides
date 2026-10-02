---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="主要發現" value="tracer 會扭曲 transport 比較">不掛 tracer 時，rc_mlx5 只比 rc_verbs 快 2–14 %，先前的 45 % 主要是 tracer 的成本差</Tile>
<Tile label="優化前" value="3.9–12.7 µs">每次來回，占 RTT 21–139 %</Tile>
<Tile variant="accent" label="優化後" value="0.7–4.5 µs">每次來回，占 RTT 8–28 %</Tile>
<Tile label="寫一筆記錄" value="296 → 20 ns">pid／tid 快取，名稱改用複製</Tile>
<Tile label="一個 span" value="41.5 → 23.8 ns">時間戳改讀 TSC，仍是 CLOCK_MONOTONIC</Tile>
<Tile label="方法" value="先拆解，再優化" wide>以執行為單位統計，跨次量測只比同一 job 內的差值</Tile>

---
layout: end
chapter: Summary
next: 控制量測路徑，並以可控瓶頸驗證 attribution

---

# Q&A

- `C0–C3`
- `getpid / gettid`
- `TSC`
- `MADV_WIPEONFORK`
- `build-id`

<!--
下一步不再繼續壓 tracer 成本，而是回到研究本身：
1. 同一組測試換一對節點，C0 相差 10–33 %，要先記錄並控制量測路徑，基準才可重現。
2. 以已知答案的瓶頸實驗（例如用 ib_write_bw 製造競爭流量）驗證 attribution 判得對不對。
3. 用現有的逐次迭代資料看延遲分佈的尾端，不必再跑叢集。
-->
