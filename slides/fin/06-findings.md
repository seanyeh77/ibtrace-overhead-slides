---
layout: section
number: 6
chapter: Part 6 · Findings
question: 過程中發現了什麼？
---

# 發現

- **6.1** 多開網卡為什麼會變慢
- **6.2** 其他發現

---
layout: textbook
chapter: Part 6 · Findings · 6.1 多開網卡為什麼會變慢
---

# 損失來自對側 NUMA 的網卡

| 每次迭代的時間（4×4） | 同側 2 張 | 同側 4 張 | 2 張同側 + 2 張對側 | 全部 8 張 |
| --- | ---: | ---: | ---: | ---: |
| allgather 256 KiB | 147.8 µs | **112.6 µs** | 181.0 µs | 177.0 µs |
| alltoall 1 MiB | 581.4 µs | **515.9 µs** | 720.9 µs | 725.8 µs |

::note::

<Note :notes="[
  ['兩顆 CPU 旁邊各接 4 張網卡。', '混用對側的卡，就和 8 張一樣慢。', '每節點 1 個 rank 時，影響很小。'],
]" />

---
layout: textbook
chapter: Part 6 · Findings · 6.1 多開網卡為什麼會變慢
---

# 點對點的程式：網卡越少越快

| 全部 8 張 → | NPB MG | NPB LU | NPB BT |
| --- | ---: | ---: | ---: |
| 同側 4 張 | 快 371.5 ms | 快 404.0 ms | 快 626.4 ms |
| 同側 2 張 | 快 468.8 ms | 快 548.9 ms | 快 760.9 ms |

::note::

<Note :notes="[
  ['同側 2 張比 4 張再快 97–145 ms。', '差距主要在固定成本。'],
]" />

---
layout: textbook
chapter: Part 6 · Findings · 6.2 其他發現
---

# UCX 的在途數設定被調小時，程式會變慢

| UCX 設定（預設 → 調小） | alltoall | allreduce | 判定 |
| --- | ---: | ---: | --- |
| 同時讀取的位元組：無上限 → 512 KiB | +90.8 ms | +29.6 ms | 建議改回 |
| 同時讀取的次數：硬體上限 → 1 次 | +45.6 ms | +9.5 ms | 建議改回 |
| 每次讀取的大小：自動 → 64 KiB | +13.8 ms | 區間含 0 ms | 建議改回 |
| 送出佇列：256 個 → 16 個 | 區間含 0 ms | 程式卡死 | 不建議 |

::note::

<Note :notes="[
  ['預設值下不會卡在這裡。', '只給方向，不預測收益。'],
]" />

---
layout: textbook
chapter: Part 6 · Findings · 6.2 其他發現
---

# 單一節點的問題，會讓結論反過來

| 多開 rail（alltoall 1 MiB） | 2 條 rail | 8 條 rail | 實測 ΔT |
| --- | ---: | ---: | ---: |
| 用到 hgpn050 時 | 268.7 ms | 317.7 ms | 慢 49.0 ms |
| 換一組節點重跑 | 266.6 ms | 244.2 ms | 快 22.4 ms |

::note::

<Note :notes="[
  ['hgpn050 每則 25.8 µs，其他 16.7 µs。', '所以每個 job 先檢查節點。'],
]" />
