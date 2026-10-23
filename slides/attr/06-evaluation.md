---
layout: section
number: 6
chapter: Part 6 · Evaluation
question: 換一個沒看過的程式，預測還準嗎？
---

# 評估結果

- **6.1** 評估設計：定版、測試資料、怎麼算
- **6.2** 比較對象：兩種傳統做法的規則
- **6.3** 總表
- **6.4–6.6** 三個指標，各自先講規則再講結果
- **6.7** 誤差從哪裡來，以及第一版的對照

---
layout: textbook
chapter: Part 6 · Evaluation · 6.1 評估設計
clicks: 1
---

# 先定版，再在沒看過的程式上評估一次

<AtEval />

::note::

<Note :notes="[
  ['第一版用一對一傳輸的資料開發。', '定版後不再修改。', '再到 allreduce 上評估一次。'],
  ['第二版已經看過 allreduce 的資料。', '所以改用全新的程式評估。', '包括 alltoall 與真實應用 miniFE。'],
]" />

<!--
這個流程避免「看了答案再調整」：如果用同一份資料開發又評估，結果一定好看，但不代表能用在新的程式上。
定版的方式是在 git 打上標籤，之後不再修改。
第一版用一對一傳輸的資料開發，在 allreduce 上評估。第二版修正了第一版的錯誤，所以第一版的測試資料已經看過，不能再用；第二版改在全新的程式上評估：
osu_alltoall 是每個 rank 都送資料給其他每個 rank 的測試程式；miniFE 是一個真實的科學計算小程式，用有限元素法求解方程式。兩者各 4 個節點，共 960 次執行。
-->

---
layout: rows
numbered: true
reveal: true
chapter: Part 6 · Evaluation · 6.1 評估設計
clicks: 3
items:
  - title: 三個新程式
    text: ['alltoall 64 KiB、alltoall 1 MiB 與 miniFE。', '每個程式都跑在 4 個節點上。']
  - title: 六種情境
    text: ['四種瓶頸、對照組，與兩個瓶頸同時存在。', '三個程式共 18 個情境。']
  - title: 30 組答案
    text: ['每組是一個瓶頸配一個優化動作。', '每個程式 10 組。']
  - title: 960 次執行
    text: ['每個狀態開與不開 tracer 各跑 10 次。', 'trace 遺失 0 筆。']
---

# 測試資料怎麼組成

::note::

<Note :notes="[
  ['這三個程式在定版前都沒看過。'],
  ['對照組：流量灌到程式沒用的網卡。', '預期優化沒有效果。'],
  ['實測 ΔT：前後中位數相減。', '換成百分比時，除以優化後的時間。'],
  ['模型讀開 tracer 的 trace。', '答案用不開 tracer 的執行。'],
]" />

---
layout: textbook
chapter: Part 6 · Evaluation · 6.1 評估設計
---

# 實測與預測怎麼算

| 項目 | 怎麼算 |
| --- | --- |
| 實測 ΔT | 有瓶頸時的中位數 − 優化後的中位數，各 10 次不開 tracer |
| 95 % 區間 | 兩組各自重抽 10,000 次（bootstrap） |
| 百分比 | 除以優化後 10 次的中位數 |
| 預測 | 有瓶頸時 10 次開 tracer 的執行，各自預測後取中位數 |
| 組合情境 | 三種優化：只移走 CPU 工作、只停流量、兩者都做 |
| 資料來源 | 收集 job 519817、519818，評估 job 519956 |

---
layout: textbook
chapter: Part 6 · Evaluation · 6.2 比較對象
---

# 兩種傳統做法的完整規則

| 做法 | 看到什麼 | 建議 | 預測的收益 |
| --- | --- | --- | --- |
| counter | 還有沒用到的網卡 | 多開 rail | T × 最大使用率 × (1 − rail 數 ÷ 網卡數) |
| counter | 收發流量差超過 1 Gb/s | 移除競爭流量 | T × 外來流量 ÷ 單條頻寬 |
| counter | 程式在網卡另一側 | NUMA 綁定 | 固定 5 % × T |
| counter | 搶 CPU、重複登記 | 沒有規則 | 永遠是 0 ms |
| profiler | stall 最多 | 移走 CPU 上的工作 | 四個 rank 中最大的那一類時間 |
| profiler | register 最多 | 保留暫存空間 | 同上 |
| profiler | wait 最多 | 競爭流量、多開 rail 或「更快的網路」 | 同上 |
| profiler | other 最多 | 「更快的計算」 | 同上 |

---
layout: rows
chapter: Part 6 · Evaluation · 6.2 比較對象
items:
  - label: counter
    title: 使用率與外來流量
    text: ['使用率 = 收與送中較小的速率 ÷ 42.8 GB/s。', '外來流量 = 收與送的速率差。']
  - label: profiler
    title: 四類時間
    text: ['每一類取四個 rank 中最大的總和。', '收益上限是程式的時間 T。']
  - label: profiler
    title: wait 的歸屬
    text: ['有外來流量就歸給移除流量。', '否則能多開 rail 就歸給多開 rail。', '都不是就是「更快的網路」。']
  - label: 兩者
    title: 缺的規則
    text: ['counter 沒有搶 CPU 的規則。', 'profiler 沒有對應 NUMA 的類別。', '「更快的網路、計算」不算任何動作。']
---

# 傳統做法的規則細節

---
layout: textbook
chapter: Part 6 · Evaluation · 6.3 總表
clicks: 3
---

# 第二版在沒看過的程式上的結果

| 問題 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| 實測最佳的動作排第一 | **140 / 150 次** | 80 / 150 次 | 80 / 150 次 |
| 注入的瓶頸排第一 | 160 / 210 次 | **180 / 210 次** | 120 / 210 次 |
| 方向正確 | **20 / 22 組** | 13 / 22 組 | 17 / 22 組 |
| 預測收益的誤差（百分點） | 38.2 百分點 | **37.2 百分點** | 72.8 百分點 |

::note::

<Note :notes="[
  ['分母是執行次數，不是組數。', '每次執行各自計分。'],
  ['第一列：93 %、53 %、53 %。', '第二列：76 %、86 %、57 %。'],
  ['第三列只看實測確定的 22 組。'],
  ['第四列用全部 30 組。', '數字越小越好。'],
]" />

---
layout: rows
chapter: Part 6 · Evaluation · 6.4 排第一
items:
  - label: 規則 1
    title: 只看名字
    text: ['收益的正負號不看。', '預測有害的動作排第一，也可能算對。']
  - label: 規則 2
    title: 沒有容忍度
    text: ['正確答案取點估計最大的動作。', '只有組合情境有兩個候選，差距都很大。']
  - label: 規則 3
    title: 沒提出算錯
    text: ['沒有提出任何動作的執行算錯。', '它仍然留在分母裡。']
  - label: 規則 4
    title: 同分
    text: ['480 次執行中，前兩名沒有同分。', '同一狀態 10 次的第一名都相同。']
---

# 排第一怎麼計分：四條規則

---
layout: textbook
chapter: Part 6 · Evaluation · 6.4 排第一
clicks: 2
---

# 排第一：每次執行各自計分

| 程式 | 計分的執行 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: | ---: |
| alltoall 64 KiB | 70 次 | 60 次 | 40 次 | 30 次 |
| alltoall 1 MiB | 60 次 | 60 次 | 40 次 | 30 次 |
| miniFE | 20 次 | 20 次 | 0 次 | 20 次 |
| **合計** | **150 次** | **140 次** | **80 次** | **80 次** |

::note::

<Note :notes="[
  ['每個狀態先找出正確答案。', '它是實測收益最大的動作。', '區間下界還必須大於 0。'],
  ['15 個狀態有答案，各 10 次執行。', '每次執行看排第一的動作。', '沒有提出動作就算錯。'],
  ['rail 太多的狀態沒有答案。', 'miniFE 只有 2 個狀態有答案。'],
]" />

---
layout: textbook
chapter: Part 6 · Evaluation · 6.4 排第一
---

# 排第一的另一種定義：以注入的瓶頸為準

| 程式 | 計分的執行 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: | ---: |
| alltoall 64 KiB | 70 次 | 70 次 | 60 次 | 50 次 |
| alltoall 1 MiB | 70 次 | 70 次 | 60 次 | 50 次 |
| miniFE | 70 次 | 20 次 | **60 次** | 20 次 |
| **合計** | **210 次** | 160 次 | **180 次** | 120 次 |

對照組沒有注入的瓶頸，不計入；組合情境排搶 CPU 或競爭流量都算對。

本研究在 miniFE 把正常的計算當成停頓，每次都排「移走 CPU 上的工作」第一。

---
layout: textbook
chapter: Part 6 · Evaluation · 6.5 方向
---

# 方向：先排除實測區間含 0 的 8 組

| 程式 | 情境 | 實測 ΔT ms | 95 % 區間 |
| --- | --- | ---: | --- |
| alltoall 1 MiB | 對照組 | −2.9 ms | −9.4 到 +3.2 ms |
| miniFE | NUMA 錯置 | +0.8 ms | −22.4 到 +78.4 ms |
| miniFE | 競爭流量 100 Gb/s | +7.3 ms | −68.8 到 +32.9 ms |
| miniFE | 競爭流量 200 Gb/s | −5.0 ms | −80.4 到 +16.3 ms |
| miniFE | 競爭流量 390 Gb/s | +5.9 ms | −68.8 到 +42.3 ms |
| miniFE | rail 太少 | +2.1 ms | −35.0 到 +84.6 ms |
| miniFE | 對照組 | −1.7 ms | −12.7 到 +89.8 ms |
| miniFE | 組合，只停流量 | +11.2 ms | −47.9 到 +95.3 ms |

miniFE 一次約 1 秒，這些瓶頸的影響小於執行之間的變動。

---
layout: textbook
chapter: Part 6 · Evaluation · 6.5 方向
clicks: 1
---

# 方向：剩下 22 組的結果

| 做法 | 錯的組數 | 錯在哪裡 |
| --- | ---: | --- |
| 本研究 | 2 組 | 1 MiB 多開 rail 預測變快；64 KiB 對照組沒有提出 |
| counter 做法 | 9 組 | 6 組搶 CPU 沒有規則；2 組多開 rail 只會預測變快 |
| profiler 做法 | 5 組 | 2 組 NUMA 沒有對應類別；2 組多開 rail 預測變快 |

::note::

<Note :notes="[
  ['實測區間不含 0 的組才列入。', '排除的 8 組中，7 組是 miniFE。'],
  ['預測與實測同號才算對。', '沒有提出動作，預測是 0，算錯。'],
]" />

---
layout: textbook
chapter: Part 6 · Evaluation · 6.5 方向
---

# 每種做法錯的組

| 做法 | 組 | 預測 ms | 實測 ms |
| --- | --- | ---: | ---: |
| 本研究 | alltoall 1 MiB 多開 rail | +45.7 ms | −49.0 ms |
| 本研究 | alltoall 64 KiB 對照組 | 沒有建議（算 0 ms） | +0.3 ms |
| counter | 三個程式的搶 CPU（6 組） | 沒有建議（算 0 ms） | +37 到 +996 ms |
| counter | 兩個 alltoall 多開 rail | +7.3、+63.5 ms | −6.0、−49.0 ms |
| counter | alltoall 64 KiB 對照組 | 沒有建議（算 0 ms） | +0.3 ms |
| profiler | 兩個 alltoall 的 NUMA | 沒有建議（算 0 ms） | +5.2、+147.6 ms |
| profiler | 兩個 alltoall 多開 rail | +66.5、+176.6 ms | −6.0、−49.0 ms |
| profiler | alltoall 64 KiB 對照組 | 沒有建議（算 0 ms） | +0.3 ms |

三種做法都錯的，只有 64 KiB 對照組。

---
layout: textbook
chapter: Part 6 · Evaluation · 6.6 誤差
clicks: 1
---

# 誤差：沒有提出的動作算成 0

| 程式 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| alltoall 64 KiB | 55.6 百分點 | **30.2 百分點** | 93.6 百分點 |
| alltoall 1 MiB | **31.9 百分點** | 34.1 百分點 | 78.9 百分點 |
| miniFE | **27.2 百分點** | 47.4 百分點 | 46.0 百分點 |
| 全部 30 組 | 38.2 百分點 | **37.2 百分點** | 72.8 百分點 |
| 預測為 0 ms 的組數 | 3 組 | 9 組 | 6 組 |

::note::

<Note :notes="[
  ['每組誤差 = 預測 % − 實測 %。', '取絕對值，30 組平均。', '單位是百分點。'],
  ['沒有提出的動作照樣計分。', '預測當成 0，不排除。'],
]" />

---
layout: rows
chapter: Part 6 · Evaluation · 6.6 誤差
items:
  - label: 公式
    title: 每組的誤差
    text: ['誤差 = (預測 ms − 實測 ms) ÷ 優化後的時間。', '取絕對值，30 組平均，單位是百分點。']
  - label: 64 KiB
    title: 本研究較差
    text: ['競爭流量的常數來自延遲測試。', '實際每則多 4.9–18.6 µs，常數只有 1.2–2.7 µs。']
  - label: miniFE
    title: 誤差集中在三組
    text: ['三組搶 CPU 各高估 83–93 個百分點。', '其他 7 組都在 1 個百分點以內。']
---

# 誤差的公式與兩個觀察

---
layout: rows
chapter: Part 6 · Evaluation · 6.7 誤差從哪裡來
reveal: true
clicks: 2
items:
  - label: 誤差來源 1
    title: 常數不適用大量傳輸
    text: ['常數來自量測延遲的小型測試。', '大量傳輸時，低估數倍到數十倍。']
  - label: 誤差來源 2
    title: 計算被當成等待
    text: ['miniFE 的計算被當成 CPU 被搶。', '正常的執行也出現假的瓶頸。']
  - label: 下一版
    title: 就地校準
    text: ['不用外部常數。', '改用沒受影響的網卡當對照。']
---

# 預測收益大小的兩個誤差來源

::note::

<Note :notes="[
  ['alltoall 64 KiB<br>實測 4.9–18.6 µs<br>常數 1.2–2.7 µs', 'NUMA 1 MiB<br>實測 19.7 µs<br>常數 0.35 µs'],
  ['每一輪計算 4–6 ms。', '都被算成 CPU 被搶。'],
  ['拿其他網卡當對照。', '兩邊的差值就是懲罰。'],
]" />

<!--
兩個誤差來源都已經找到具體的證據。案例中預測偏小（第 4 部分最後一頁），也屬於第一種。
來源 1：例如 alltoall 64 KiB 時，網路被佔用讓每則訊息多花 4.9–18.6 µs，常數只有 1.2–2.7 µs；1 MiB 的 NUMA 懲罰實測 19.7 µs，常數只有 0.35 µs。
來源 2 是分類上的錯誤，不是方法本身的問題。
就地校準的好處是自動適應延遲型與頻寬型的情境，也不需要知道競爭流量用了幾條連線這類看不到的資訊。
-->

---
layout: textbook
chapter: Part 6 · Evaluation · 6.7 誤差從哪裡來
---

# 對照：第一版在 allreduce 上的結果

| 問題 | 第一版 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| 實測最佳的動作排第一（事後才定義） | **119 / 150 次** | 50 / 150 次 | 20 / 150 次 |
| 注入的瓶頸排第一 | 79 / 150 次 | **110 / 150 次** | 20 / 150 次 |
| 方向正確 | **16 / 19 組** | 12 / 19 組 | 14 / 19 組 |
| 預測收益的誤差（百分點，22 組） | **18.3 百分點** | 58.9 百分點 | 22.7 百分點 |

第一版在 alltoall 上的方向也剛好是 16 / 19，引用時要說清楚是哪一個。
