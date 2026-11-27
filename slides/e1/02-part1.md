---
layout: section
number: 2
chapter: Part 2 · 第一段
question: 預設設定下，有沒有可以省的時間？
---

# 第一段實驗

- **2.1** 實驗設定
- **2.2** 結果
- **2.3** 原因與缺口

---
layout: textbook
chapter: Part 2 · 第一段 · 2.1 實驗設定
---

# 第一段：4 台機器、5 個程式

| 項目 | 內容 |
| --- | --- |
| 機器 | 4 台，每台 16 個 rank |
| 程式 | NPB 的 LU、BT、MG，OSU 的 allreduce、alltoall |
| 計時執行 | 318 次，失敗 0 次，逾時 0 次 |
| 開 tracer | 紀錄遺失 0 筆 |
| 花費 | 392.0 核心小時，含試跑共 513.5 核心小時 |

::note::
rank：平行程式中的一個行程。

NPB：科學計算的標準測試程式。

OSU：測集體通訊的小程式。

---
layout: textbook
chapter: Part 2 · 第一段 · 2.2 結果
---

# 綁在原地：5 個程式有 4 個變快

| 程式 | 收益 | 95 % 區間 |
| --- | ---: | ---: |
| LU | +0.7 % | −0.1 % 到 +1.5 % |
| BT | +11.6 % | +8.0 % 到 +15.1 % |
| MG | +29.8 % | +19.2 % 到 +38.9 % |
| allreduce | +43.5 % | +36.1 % 到 +50.1 % |
| alltoall | +10.8 % | +6.5 % 到 +14.9 % |

::note::
綁在原地：先觀察每個 rank 常停的 CPU，再把它綁在那裡。

正值代表變快。

LU 的下界沒有超過 3 %，所以沒有空間。

---
layout: textbook
chapter: Part 2 · 第一段 · 2.2 結果
---

# 擠到網卡旁：5 個程式都變慢

| 程式 | 收益 |
| --- | ---: |
| LU | −5.0 % |
| BT | −24.2 % |
| MG | −55.2 % |
| allreduce | −65.4 % |
| alltoall | −14.3 % |

::note::
擠到網卡旁：每台 14 個 rank 綁在網卡所在的 node 1。

負值代表變慢。

5 個程式都判定為有害。

---
layout: textbook
chapter: Part 2 · 第一段 · 2.2 結果
---

# 其他設定都沒有空間

| 設定 | 結果 |
| --- | --- |
| 兩個 glibc 記憶體門檻 | 5 個程式都約 0 % |
| 關閉同機共享記憶體 | allreduce −166 %，alltoall −5.9 %，BT −2.6 % |
| rendezvous 門檻 2 MB | allreduce −57.7 %，alltoall −49.6 % |
| rendezvous 門檻 1 KB | 5 個程式都約 0 % |

::note::
這些設定以「綁住的預設」為基準，前後配對比較。

rendezvous：大訊息先交握再傳送的協定。

---
layout: rows
chapter: Part 2 · 第一段 · 2.3 原因與缺口
numbered: true
items:
  - title: 啟動時被搬走
    text: rank 啟動後，系統把它搬到別的 CPU。
  - title: 記憶體留在原處
    text: 記憶體配在第一次使用時的 node。
  - title: 記憶體不會搬回
    text: 系統的 NUMA balancing 是關閉的。
  - title: 一直讀遠處
    text: 每次存取記憶體都要跨 node。
---

# 不綁核為什麼慢：推論的機制

::note::
第 2 項有實測：不綁核時，每次有 5–15 / 32 個 rank 的頁多半不在它停下的 node。

整個機制仍是推論。

---
layout: textbook
chapter: Part 2 · 第一段 · 2.3 原因與缺口
---

# 擠到網卡旁混了兩個因素

| 項目 | 擠到網卡旁 |
| --- | --- |
| node 1 的 rank | 14 個 |
| node 2 的 rank | 2 個 |
| node 1 可用的頻寬 | 一顆 CPU 的 1/4 |

變慢可能來自「擠」，不是「靠近網卡」。

::note::
node 1 只有一顆 CPU 四分之一的記憶體頻寬。

第二段要把這兩個因素分開。

---
layout: textbook
chapter: Part 2 · 第一段 · 2.3 原因與缺口
---

# 工具用 1/4 的成本找到全部

| 做法 | 試的設定 (組) | 找到空間 (個程式) | 試到有害 (組) |
| --- | ---: | ---: | ---: |
| 工具的預測 | 2 | 4 | 5 |
| 隨機挑選 | 2 | 1.0 | 3.0 |
| 全部試一遍 | 8 | 4 | 12 |

::note::
隨機挑選的數字是期望值。

工具的第二個建議是擠到網卡旁，每次都有害。

---
layout: textbook
chapter: Part 2 · 第一段 · 2.3 原因與缺口
---

# tracer 的開銷與遺失

| 程式 | 開銷 | 95 % 區間 | 遺失 (筆) |
| --- | ---: | ---: | ---: |
| LU | +6.5 % | +4.9 % 到 +8.0 % | 0 |
| BT | +3.5 % | −2.9 % 到 +10.2 % | 0 |
| MG | +10.1 % | −7.4 % 到 +30.9 % | 0 |
| allreduce | +30.7 % | +15.0 % 到 +48.6 % | 0 |
| alltoall | −2.3 % | −7.2 % 到 +2.8 % | 0 |

::note::
開銷：開 tracer 比不開慢多少。

開 tracer 時，監控程式佔用網卡 node 的 CPU，也算在開銷裡。

---
layout: rows
chapter: Part 2 · 第一段 · 2.3 原因與缺口
numbered: true
items:
  - title: 不是 ibtrace 獨有
    text: 一般 profiler 也看得到 rank 在哪顆 CPU。
  - title: 證據不夠
    text: 只找到 1 種機制，而且都是測試程式。
  - title: 沒有收益估計
    text: 偵測器只指出問題，沒說會快多少。
---

# 第一段留下三個缺口

::note::
ibtrace 獨有的網路層偵測器，在預設下沒有找到有收益的問題。

論文需要至少 2 種機制，其中 1 種在真實應用。
