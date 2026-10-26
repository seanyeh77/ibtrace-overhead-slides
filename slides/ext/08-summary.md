---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="第五版" value="新動作只差 3 %">只用同側的網卡。<br>reduce_scatter 長執行。</Tile>
<Tile variant="accent" label="誤差" value="6.3 百分點">第五版，新程式上六種方法中最小。<br>同一批資料，第四版 8.5 百分點。</Tile>
<Tile label="新發現" value="8 條 rail 慢在跨 NUMA">只用同側的 4 張卡，比 8 條快 33–41 %。</Tile>
<Tile label="弱點" value="點對點的應用">CG 找不到迴圈，SP 重播逾時。</Tile>
<Tile label="節點健康檢查" value="抓到 2 個壞節點">正常的 12 個節點都通過。</Tile>
<Tile label="下一步" value="修正點對點的校準" wide>迴圈辨識與重播程式，讓新動作也能用在真實應用。</Tile>

---
layout: end
chapter: Summary
next: 修正點對點應用的迴圈辨識與重播校準
---

# Q&A

- `就地校準`
- `schedstat`
- `model-v3-frozen`
- `model-v4-frozen`
- `model-v5-frozen`
