---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="第三版" value="修正兩個誤差來源">就地校準取代外部常數。<br>排隊時間分辨計算與被搶。</Tile>
<Tile variant="accent" label="單 rank 的誤差" value="14.7 → 9.2 百分點">開發資料，不是評估。</Tile>
<Tile label="多 rank" value="沒有比較好">4×4 時誤差 34.5 / 34.4 百分點。</Tile>
<Tile label="新的動作" value="三項 UCX 設定">調小時 alltoall 慢 4–27 %。</Tile>
<Tile label="節點健康檢查" value="抓到 2 個壞節點">正常的 12 個節點都通過。</Tile>
<Tile label="下一步" value="在四個新程式上評估" wide>規則已經寫死，結果出來後補上。</Tile>

---
layout: end
chapter: Summary
next: 收集測試資料，評估第一、二、三版
---

# Q&A

- `就地校準`
- `schedstat`
- `model-v3-frozen`
