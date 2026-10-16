---
layout: section
number: 5
chapter: Part 5 · Validation
question: 換一個程式，預測還準嗎？
---

# 驗證

- **5.1** trace 不能掉資料，也不能拖慢程式
- **5.2** 每一筆都有實測答案的資料集
- **5.3** 在沒看過的程式上評估

---
layout: textbook
chapter: Part 5 · Validation
clicks: 2
---

# Ring 被繞圈時不再卡住

<AtRing />

::note::

<Note :notes="[
  ['評估要用上千份 trace。', 'tracer 把記錄寫進環形的 ring。', '寫到尾端就繞回開頭。', 'ibmon 跟在後面依序讀出。'],
  ['tracer 寫得太快，繞了一圈。', '兩筆還沒讀的記錄被蓋掉。', '舊版 ibmon 一直等第 3 號。', '它因此卡死。'],
  ['修正後，ibmon 跳到最舊的記錄。', '它會記下遺失了 2 筆。', 'ring 加大到約 100 萬格。', '之後遺失為 0。'],
]" />

<!--
評估要用上千次執行的 trace，每一份都必須完整，tracer 也不能改變結果。接下來三頁是為此做的修正。
ring 是環形的緩衝區；格子裡的數字是記錄的序號。MPI 程式產生記錄的速度很快，所以會被繞圈。
舊版的 ibmon 只會等「序號剛好相等」的那一筆。修正時另外發現，舊版在被繞圈時還可能讀到寫到一半的記錄；新的回歸測試會故意製造繞圈，確認這兩個問題都不再發生。
另一項修正：MPI 每次檢查「請求完成了沒」都會記一筆。現在把連續的「還沒完成」合併成一筆，記錄量減少約三分之二。
-->

---
layout: definition
chapter: Part 5 · Validation
term: page fault
kind: 作業系統的記憶體機制
clicks: 1
---

<AtFault />

第一次寫到某一頁記憶體時，作業系統才配置它。

這一次寫入會慢上數微秒。

<!--
記憶體以「頁」為單位管理，一頁 4 KiB。向系統要一大塊記憶體時，作業系統只先記帳，等程式第一次寫到某一頁才真正配置，這個過程就是 page fault。
ring 很大，所以 tracer 寫記錄時，每寫到新的一頁就觸發一次 page fault，而這發生在被追蹤的呼叫裡面，直接算進程式的時間。
MAP_POPULATE 是建立 ring 時的一個選項，讓作業系統一次把所有頁配置好。
-->

---
layout: textbook
chapter: Part 5 · Validation
clicks: 2
---

# 預先配置 ring 後，overhead 再降一半

<GroupedBars
  :cats="[['allreduce', '8 B'], ['allreduce', '64 KiB'], ['ucx_ib_test', '1 MiB']]"
  :series="[
    { name: 'Old ring', fill: '#e7e7e7', values: [1.61, 4.47, 3.11] },
    { name: 'Larger ring', fill: '#aeacac', values: [1.58, 5.25, 3.15] },
    { name: 'Larger, pre-faulted', fill: '#6eea9e', values: [0.81, 2.32, 1.26] },
  ]"
  :max="6" :step="1" unit="Tracer overhead, µs" :digits="2" :width="1300" :height="660" :bar-w="110"
  reveal
/>

::note::

<Note :notes="[
  ['柱子是每次操作多花的時間。', '灰色是舊的 ring，約 6.5 萬格。'],
  ['ring 加大到約 100 萬格。', '第一次寫到的頁變多。', '64 KiB 的 overhead 反而變大。'],
  ['建立 ring 時一次配置所有頁。', 'overhead 降到原本的一半左右。', '更新後的範圍是 0.84–2.91 µs。'],
]" />

<!--
allreduce 這兩組是 2 個節點各 1 個 rank 的 osu_allreduce，ucx_ib_test 是一對一的 ping-pong 測試。每格開 tracer 跑 10 次、不開跑 20 次。
上次報告的 0.7–4.5 µs 也含有 page fault，所以更新為 0.84–2.91 µs。
代價是每個被追蹤的行程多用 128 MiB 記憶體，啟動多約 50 ms。每節點 8 個 rank 時多用約 1 GiB，實測沒有記憶體不足。
上次簡報的「三項優化使 overhead 降至原本的 18–43 %」，以新的結果為終點則是 14–24 %。
-->

---
layout: textbook
chapter: Part 5 · Validation
---

# 用一般使用者的權限製造與移除瓶頸

| 瓶頸 | 製造方式 | 優化動作 |
| --- | --- | --- |
| 搶 CPU | 在程式所在的核心放一個忙迴圈 | 把忙迴圈移到別的核心 |
| NUMA 錯置 | 把程式綁到離網卡較遠的 CPU | 綁回網卡旁邊的 CPU |
| 網路被佔用 | 對程式使用的網卡灌入其他流量 | 停止灌入流量 |
| rail 太少 | 不需製造：UCX 預設只用 2 條 | 設定成使用 8 條 |
| 對照組 | 把流量灌到程式沒用的網卡 | 預期 ΔT 接近 0 |

<!--
這個叢集沒有 root 權限，所以每一種瓶頸都必須用一般使用者能做的方式製造，也要有一般使用者能做的優化動作。
NUMA：伺服器有兩顆 CPU，每張網卡接在其中一顆旁邊；程式跑在另一顆時，資料要多跨一段 CPU 之間的連線。網卡接在哪一顆旁邊，可以用 cat /sys/class/infiniband/mlx5_0/device/numa_node 查到：mlx5_0 是 0。
灌流量用的是 perftest 的 ib_write_bw，可以調整強度，實驗用了約 100、200、390 Gb/s 三種。
對照組（negative control）是「看起來有異常，但不應該有影響」的情境，用來檢查方法會不會誤報。
-->

---
layout: textbook
chapter: Part 5 · Validation
ltag: Terminal
clicks: 3
---

# 製造瓶頸的指令

```bash {1-2|3-4|5-7|8-9}
# 搶 CPU：在程式所在的核心 5 放一個忙迴圈
$ taskset -c 5 sh -c 'while :; do :; done' &
# NUMA 錯置：程式與記憶體都綁到另一顆 CPU
$ numactl --cpunodebind=1 --membind=1 ./program
# 網路被佔用：對 mlx5_0 灌入 100 Gb/s 的流量
$ ib_write_bw -d mlx5_0 --rate_limit=100 \
      --rate_limit_type=SW --run_infinitely node-b &
# rail 太少：把預設的 2 條改成 8 條
$ UCX_MAX_RNDV_RAILS=8 ./program
```

::note::

<Note :notes="[
  ['taskset 把行程綁在指定的核心。', '忙迴圈和程式搶同一個核心。', '移到別的核心就是優化動作。'],
  ['numactl 指定 CPU 與記憶體。', '綁到網卡另一側，資料要多跨一段。', '綁回 0 號就是優化動作。'],
  ['ib_write_bw 拿來當競爭流量。', 'rate_limit 調整流量的強度。', '對照組把流量灌到沒用的網卡。'],
  ['環境變數只影響這一次執行。', '一對一傳輸時快 40 %。', 'allreduce 時反而慢 38 %。'],
]" />

<!--
忙迴圈和程式搶同一個核心時，程式會被作業系統週期性地暫停。
ib_write_bw 是 perftest 套件的頻寬測試程式。它需要兩端：另一個節點先以相同參數、不帶主機名稱啟動 server，這一端再連過去。
最高強度不設 rate_limit，改用 -q 4 開 4 條連線，約 390 Gb/s，接近一條 rail 的上限。
對照組：程式以 UCX_NET_DEVICES=mlx5_0:1 限定只用 mlx5_0，競爭流量則打在 mlx5_4。
-->

---
layout: rows
numbered: true
reveal: true
chapter: Part 5 · Validation
clicks: 3
items:
  - title: 製造瓶頸
    text: 在有瓶頸的狀態下執行 10 次。
  - title: 執行優化動作
    text: ['移除瓶頸或改設定，再執行 10 次。', '兩者的差就是 ΔT。']
  - title: 開與不開 tracer
    text: ['每種狀態都分別開與不開 tracer。', '兩者在同一個 job 內隨機交錯。']
  - title: 事先寫下預期
    text: 正式執行前，先寫下每個情境的預期。
---

# 資料集的每一筆答案都來自實際執行

<!--
job 是向叢集排程系統 Slurm 申請的一次執行，期間使用同一批節點。換一對節點，基準時間可能差 10–33 %，所以只比較同一個 job 內的結果。
事先寫下預期，是為了避免看到結果之後才回頭找解釋。實際上有幾項預期沒有命中，這些都照實記錄，其中一項就是第 1 部分的多開 rail。
最終資料集共 1,240 次執行，trace 遺失 0 筆；另外為最後的測試收集了 960 次，合計 2,200 次。
-->

---
layout: textbook
chapter: Part 5 · Validation
ltag: Terminal
clicks: 2
---

# 申請節點並執行一整批實驗

```bash {1-3|4-6|7}
# matrix.sbatch 的標頭：不能用 --exclusive，改成申請整台節點
#SBATCH --ntasks-per-node=1 --cpus-per-task=96
#SBATCH --gres=gpu:8 --mem=0
$ sbatch -N 4 \
      docs/injection_matrix/scripts/matrix.sbatch
Submitted batch job 517932
$ squeue -w "$SLURM_JOB_NODELIST"   # 執行中確認只有自己的 job
```

::note::

<Note :notes="[
  ['想獨占節點，避免別人干擾。', '但這個叢集不允許獨占。', '所以把整台的資源都申請下來。'],
  ['sbatch 向 Slurm 申請 4 個節點。', '環境變數決定這一批跑哪些情境。'],
  ['執行中查三次 squeue。', '確認節點上只有自己的工作。'],
]" />

<!--
517932 是最終資料集中重新登記那一批：4 個節點，跑了 6 分 21 秒。提交時另外設了 GROUP=i7 與 MX=W2 兩個環境變數，選出這一批的情境；sacct 記錄的提交指令不含環境變數。一對一傳輸那一批是 517929，2 個節點。
標頭的完整內容：--account、--partition=dev、--nodes=2（被命令列的 -N 4 覆蓋）、--ntasks-per-node=1、--gres=gpu:8、--cpus-per-task=96、--mem=0、--time=02:00:00。
每節點有 8 張 GPU 與 96 個 CPU；全部申請下來，別人的工作就排不進來。
matrix.sbatch 會把這一批的所有條件以固定的隨機種子打亂順序，逐一執行，每次執行在 manifest.csv 記一行：條件、開始與結束時間、結束碼、輸出檔位置。
-->

---
layout: textbook
chapter: Part 5 · Validation
clicks: 1
---

# 開 tracer 幾乎不改變 ΔT

<AtRatio :rows="[
  { label: 'CPU contention', med: 1.18, lo: 1.02, hi: 1.37 },
  { label: 'NUMA', med: 0.79, lo: 0.59, hi: 1.00 },
  { label: 'Competing traffic', med: 1.00, lo: 0.74, hi: 1.51 },
  { label: 'Rail count', med: 1.00, lo: 0.91, hi: 1.40 },
  { label: 'Re-registration', med: 1.04, lo: 1.02, hi: 1.37 },
  { label: 'All 32 pairs', med: 1.02, hot: true },
]" />

::note::

<Note :notes="[
  ['每一列是 ΔT 的比值。', '比值 = 開 tracer ÷ 不開。', '1 代表 tracer 不影響結論。', '全部 32 組的中位數是 1.02。'],
  ['例外是 NUMA 錯置。', '開 tracer 時，效果變小。', '這一類改從設定資訊判斷。'],
]" />

<!--
這一頁回答一個關鍵問題：模型看的是開 tracer 的 trace，但使用者在乎的是不開 tracer 時能快多少。兩者一致，模型的輸入才可信。
方塊是中位數，橫線是各情境的範圍。沒有任何一組方向相反。
搶 CPU 的比值略高於 1：tracer 本身會用到一點 CPU，CPU 被搶時多被拖一點。
NUMA 錯置改從設定判斷，也就是比對程式的 CPU 和網卡在不在同一側。原因已排除攔截本身、ring 的位置和 ibmon 的位置，仍未完全確認，這裡照實列為限制。
重新登記就是第 2 部分的案例。
-->

---
layout: textbook
chapter: Part 5 · Validation
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
chapter: Part 5 · Validation
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

<!--
資料：job 519817（alltoall）與 519818（miniFE），評估由 analysis job 519956 執行一次。細節見 docs/model/HOLDOUT_DETAILS.md。
六種情境：搶 CPU、NUMA 錯置、網路被佔用（100、200、390 Gb/s 三種強度）、rail 太少、對照組、搶 CPU 加網路被佔用。
組合情境有三種移除方式：只移走 CPU 上的工作、只停掉流量、兩者都做，所以每個程式有 10 組。
實測 ΔT = 有瓶頸時 10 次不開 tracer 的中位數 − 優化後 10 次的中位數。95 % 區間用 bootstrap（10,000 次）。
百分比的分母是優化後（移除瓶頸的狀態）10 次的中位數。
預測 = 有瓶頸的狀態 10 次開 tracer 的執行，各自預測後取中位數。
-->

---
layout: textbook
chapter: Part 5 · Validation
---

# 兩種傳統做法的完整規則

| 做法 | 看到什麼 | 建議 | 預測的收益 |
| --- | --- | --- | --- |
| counter | 還有沒用到的網卡 | 多開 rail | T × 最大使用率 × (1 − rail 數 ÷ 網卡數) |
| counter | 收發流量差超過 1 Gb/s | 移除競爭流量 | T × 外來流量 ÷ 單條頻寬 |
| counter | 程式在網卡另一側 | NUMA 綁定 | 固定 5 % × T |
| counter | 搶 CPU、重複登記 | 沒有規則 | 永遠是 0 |
| profiler | stall 最多 | 移走 CPU 上的工作 | 四個 rank 中最大的那一類時間 |
| profiler | register 最多 | 保留暫存空間 | 同上 |
| profiler | wait 最多 | 競爭流量、多開 rail 或「更快的網路」 | 同上 |
| profiler | other 最多 | 「更快的計算」 | 同上 |

<!--
兩種都是我們依典型做法實作的規則（model-v2-frozen 的 v2.py 698–734），不是現成的工具。
counter：使用率 = 收與送中較小的速率 ÷ 單條 rail 的頻寬 42.8 GB/s。外來流量 = 收與送的差。外來流量的收益上限是 T。NUMA 的收益固定是 5 % × T，不是量出來的。
profiler：四類時間各取四個 rank 中最大的總和，直接當成收益，上限是 T。wait 的動作：有外來流量時是移除競爭流量；否則能多開 rail 且有 64 KiB 以上的訊息時是多開 rail；都不是時是「更快的網路」。
「更快的網路」與「更快的計算」不是任何一組的優化動作，排第一時算錯，在誤差與方向中當成沒有提出。
profiler 沒有對應 NUMA 的類別；counter 沒有搶 CPU 的規則。
-->

---
layout: textbook
chapter: Part 5 · Validation
clicks: 3
---

# 第二版在沒看過的程式上的結果

| 問題 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| 實測最佳的動作排第一 | **140 / 150** | 80 / 150 | 80 / 150 |
| 注入的瓶頸排第一 | 160 / 210 | **180 / 210** | 120 / 210 |
| 方向正確 | **20 / 22** | 13 / 22 | 17 / 22 |
| 預測收益的誤差（百分點） | 38.2 | **37.2** | 72.8 |

::note::

<Note :notes="[
  ['分母是執行次數，不是組數。', '每次執行各自計分。'],
  ['第一列：93 %、53 %、53 %。', '第二列：76 %、86 %、57 %。'],
  ['第三列只看實測確定的 22 組。'],
  ['第四列用全部 30 組。', '數字越小越好。'],
]" />

<!--
後面三頁分別說明排第一、方向與誤差怎麼算。
兩種排第一的定義結果不同：以實測最佳為準，模型最好；以我們注入的瓶頸為準，counter 做法最好。差別主要來自 miniFE：模型把它正常的計算當成停頓，每次都把「移走 CPU 上的工作」排第一。
第一版在 allreduce 測試集上的對照：誤差 18.3 / 58.9 / 22.7 個百分點（22 組）；方向 16/19、12/19、14/19；實測最佳排第一 119/150（事後才定義）；注入的瓶頸排第一 79/150、110/150、20/150。
注意：第一版在這份 alltoall 資料上的方向也剛好是 16/19，引用時要說清楚是哪一個。
-->

---
layout: textbook
chapter: Part 5 · Validation
clicks: 2
---

# 排第一：每次執行各自計分

| 程式 | 計分的執行 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: | ---: |
| alltoall 64 KiB | 70 | 60 | 40 | 30 |
| alltoall 1 MiB | 60 | 60 | 40 | 30 |
| miniFE | 20 | 20 | 0 | 20 |
| **合計** | **150** | **140** | **80** | **80** |

::note::

<Note :notes="[
  ['每個狀態先找出正確答案。', '它是實測收益最大的動作。', '區間下界還必須大於 0。'],
  ['15 個狀態有答案，各 10 次執行。', '每次執行看排第一的動作。', '沒有提出動作就算錯。'],
  ['rail 太多的狀態沒有答案。', 'miniFE 只有 2 個狀態有答案。'],
]" />

<!--
規則（eval_holdout_v2.py 152–157、199–211）：
正確答案：在這個情境中只移除一樣東西的動作裡，取實測 ΔT 點估計最大者；它的 95 % 區間下界必須 > 0，否則這個狀態沒有答案，不計入分母。
多開 rail 的兩個狀態實測是變慢，所以沒有答案。miniFE 有 6 個狀態的實測區間含 0，也沒有答案，只剩搶 CPU 與組合兩個。
每個狀態的 10 次開 tracer 執行各自計分，所以分母是 10 的倍數。三種做法在同一個狀態的 10 次中，第一名都相同。
沒有容忍度：只有組合情境有兩個候選，三個程式都是搶 CPU 明顯大於競爭流量（例如 64 KiB：+56.6 對 +36.1 ms）。
收益的正負號不看，只看名字。沒有提出任何動作的執行算錯，仍在分母內。「更快的網路」「更快的計算」排第一也算錯。
counter 做法在 miniFE 是 0：兩個有答案的狀態，正確答案都是移走 CPU 上的工作，而它沒有這條規則。
另一種定義（以注入的瓶頸為準）：21 個狀態 × 10 = 210 次，對照組不計。組合情境排搶 CPU 或競爭流量都算對。結果 160 / 180 / 120。
-->

---
layout: textbook
chapter: Part 5 · Validation
clicks: 1
---

# 方向：只看實測確定的 22 組

| 做法 | 錯的組數 | 錯在哪裡 |
| --- | ---: | --- |
| 本研究 | 2 | 1 MiB 多開 rail 預測變快；64 KiB 對照組沒有提出 |
| counter 做法 | 9 | 6 組搶 CPU 沒有規則；2 組多開 rail 只會預測變快 |
| profiler 做法 | 5 | 2 組 NUMA 沒有對應類別；2 組多開 rail 預測變快 |

::note::

<Note :notes="[
  ['實測區間不含 0 的組才列入。', '排除的 8 組中，7 組是 miniFE。'],
  ['預測與實測同號才算對。', '沒有提出動作，預測是 0，算錯。'],
]" />

<!--
規則（eval_holdout_v2.py 178、185）：實測 95 % 區間不含 0 的組才列入，共 22 組。對 = 預測不為 0，且預測與實測同號。
排除的 8 組：alltoall 1 MiB 對照組，以及 miniFE 的 NUMA、三種強度的競爭流量、多開 rail、對照組、組合情境只停掉流量。miniFE 的運算時間約 1 秒，這些瓶頸的影響小於執行間的變動。
本研究錯的 2 組：alltoall 1 MiB 多開 rail，預測 +45.7 ms，實測 −49.0 ms（collective 中多開 rail 的傳輸收益沒有實現）；alltoall 64 KiB 對照組，實測只快 0.31 ms，模型沒有提出動作。
counter 做法錯的 9 組：三個程式的搶 CPU 與組合情境只移走 CPU 工作，共 6 組，沒有規則；兩個 alltoall 的多開 rail，公式只會給正值；64 KiB 對照組。
profiler 做法錯的 5 組：兩個 alltoall 的 NUMA，沒有對應的類別；兩個多開 rail，等待時間全算成多開 rail 的收益；64 KiB 對照組。
三種做法都錯的只有 64 KiB 對照組。
-->

---
layout: textbook
chapter: Part 5 · Validation
clicks: 1
---

# 誤差：沒有提出的動作算成 0

| 程式 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| alltoall 64 KiB | 55.6 | **30.2** | 93.6 |
| alltoall 1 MiB | **31.9** | 34.1 | 78.9 |
| miniFE | **27.2** | 47.4 | 46.0 |
| 全部 30 組 | 38.2 | **37.2** | 72.8 |
| 預測為 0 的組數 | 3 | 9 | 6 |

::note::

<Note :notes="[
  ['每組誤差 = 預測 % − 實測 %。', '取絕對值，30 組平均。', '單位是百分點。'],
  ['沒有提出的動作照樣計分。', '預測當成 0，不排除。'],
]" />

<!--
公式（eval_holdout_v2.py 165、181）：每組誤差 = 100 × (預測 ms − 實測 ΔT ms) ÷ 優化後 10 次不開 tracer 的中位數。MAE = 30 組誤差絕對值的平均。
RESULTS_v2.md 寫「只算有對應動作的對」，意思是這一組的優化有對應的動作名稱，30 組都有；不是指方法有沒有提出。
本研究在 64 KiB 較差：競爭流量的常數來自只量延遲的小型測試，大量傳輸時每則訊息實際多花 4.9–18.6 µs，常數只有 1.2–2.7 µs。
本研究在 miniFE 的誤差幾乎都來自三組搶 CPU（+83、+93、+93 個百分點），其他 7 組都在 1 個百分點以內。
-->

---
layout: rows
chapter: Part 5 · Validation
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
