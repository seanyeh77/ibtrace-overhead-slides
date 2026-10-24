---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="第三版" value="修正兩個誤差來源">就地校準取代外部常數。<br>排隊時間分辨計算與被搶。</Tile>
<Tile variant="accent" label="新程式上的誤差" value="11.1 → 10.2 百分點">排第一反而較差。</Tile>
<Tile label="主要的失分" value="loader 找錯迴圈">第二版就有的錯誤。</Tile>
<Tile label="新的動作" value="三項 UCX 設定">調小時 alltoall 慢 4–27 %。</Tile>
<Tile label="節點健康檢查" value="抓到 2 個壞節點">正常的 12 個節點都通過。</Tile>
<Tile label="下一步" value="第四版" wide>修正找迴圈的上限，加入 rail 的啟動成本。</Tile>

---
layout: end
chapter: Summary
next: 第四版：修正 loader 與 rail 的啟動成本
---

# Q&A

- `就地校準`
- `schedstat`
- `model-v3-frozen`
