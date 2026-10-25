---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="第四版" value="誤差 3.7 百分點">新程式上五種方法中最小。<br>搶 CPU 改量整次執行。</Tile>
<Tile variant="accent" label="第三版" value="10.2 / 5.3 百分點">兩次評估的誤差。<br>就地校準在大量傳輸有效。</Tile>
<Tile label="盲點" value="8 條 rail 每次迭代都變慢">長執行慢 22 %，所有方法猜錯方向。</Tile>
<Tile label="新的動作" value="三項 UCX 設定">調小時 alltoall 慢 4–27 %。</Tile>
<Tile label="節點健康檢查" value="抓到 2 個壞節點">正常的 12 個節點都通過。</Tile>
<Tile label="下一步" value="查 rail 的原因，搬到 CPU 叢集" wide>rail 留在多網卡的叢集，其他類別移到 CPU 叢集。</Tile>

---
layout: end
chapter: Summary
next: 查 8 條 rail 變慢的原因，其他類別移到 CPU 叢集
---

# Q&A

- `就地校準`
- `schedstat`
- `model-v3-frozen`
- `model-v4-frozen`
