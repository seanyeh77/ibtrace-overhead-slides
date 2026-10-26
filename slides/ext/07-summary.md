---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="第四版" value="誤差 3.7 百分點">新程式上五種方法中最小。<br>搶 CPU 改量整次執行。</Tile>
<Tile variant="accent" label="第三版" value="10.2 / 5.3 百分點">兩次評估的誤差。<br>就地校準在大量傳輸有效。</Tile>
<Tile label="新發現" value="8 條 rail 慢在跨 NUMA">只用同側的 4 張卡，比 8 條快 33–41 %。</Tile>
<Tile label="新的動作" value="三項 UCX 設定">調小時 alltoall 慢 4–27 %。</Tile>
<Tile label="節點健康檢查" value="抓到 2 個壞節點">正常的 12 個節點都通過。</Tile>
<Tile label="下一步" value="第五版" wide>新增「只用同側網卡」，校準改成全部 rank 同時跑。</Tile>

---
layout: end
chapter: Summary
next: 第五版：同側網卡的動作與 collective 校準
---

# Q&A

- `就地校準`
- `schedstat`
- `model-v3-frozen`
- `model-v4-frozen`
