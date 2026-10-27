---
layout: section
number: 3
chapter: Part 3 · Actions
question: 會建議哪些優化？
---

# 優化動作

---
layout: textbook
chapter: Part 3 · Actions
clicks: 1
---

# 五類會預測收益的優化動作

| 瓶頸 | 優化動作 | 給使用者的設定 |
| --- | --- | --- |
| 重複登記記憶體 | 保留暫存空間 | 兩個 MALLOC 門檻 |
| 搶 CPU | 移走同核心的其他工作 | 沒有，要自己找出那個工作 |
| NUMA 錯置 | 綁回網卡那一側 | numactl 綁 CPU 與記憶體 |
| 網路被佔用 | 移除競爭流量 | 沒有，要停掉外來流量 |
| 網卡設定 | 選最快的網卡組合 | 每個 rank 的 UCX_NET_DEVICES |

::note::

<Note :notes="[
  ['網卡設定有四個候選：', '目前、同側 2 張、同側 4 張、全部 8 張。', '只選收益最大的一個。'],
  ['另外只給方向、不預測收益：', 'UCX 在途數的三項設定被調小時，', '建議改回預設。'],
]" />

---
layout: textbook
chapter: Part 3 · Actions
---

# 還沒涵蓋的優化

| 類型 | 例子 | 為什麼還沒做 |
| --- | --- | --- |
| 一般使用者能改 | collective 演算法、協定門檻、rank 擺放 | 還沒驗證 trace 看得到徵兆 |
| 要改程式 | 計算與通訊重疊、合併小訊息 | 工具只能指出值不值得改 |
| 需要管理員 | 大分頁、congestion control、SHARP | 叢集上沒有權限 |
| 看不到 | GPU 與 NCCL | tracer 還攔截不到 NCCL |
