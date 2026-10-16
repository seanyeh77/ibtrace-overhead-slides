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
layout: textbook
chapter: Part 5 · Validation
clicks: 2
---

# 第二版在沒看過的程式上的結果

| 問題 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| 實測收益最大的動作排在第一 | **93 %** | 53 % | 53 % |
| 預測會變快或變慢，方向正確 | **20 / 22** | 13 / 22 | 17 / 22 |
| 預測收益的誤差（百分點） | 38.2 | 37.2 | 72.8 |

::note::

<Note :notes="[
  ['第一列問：第一名選對了嗎？', '模型 93 %，傳統做法都是 53 %。'],
  ['第二列問：方向對嗎？', '22 組中，模型對了 20 組。'],
  ['第三列是預測的誤差。', '數字越小越好。', '模型與 counter 做法相當。', '比 profiler 做法好得多。'],
]" />

<!--
方向錯的其中一組是 alltoall 1 MiB 改用更多 rail：模型預測會變快，實際並沒有。
誤差的單位是百分點：例如實測快 30 %、預測快 40 %，誤差就是 10 個百分點。
解讀：在「該做哪一個、會不會有害」這種決策問題上，模型明顯勝出；在「能快多少」的數字上，目前與 counter 做法打平。
這是照實報告的結果，事先也指定了誤差（第三列）為主要指標，比較對象是 profiler 做法，這一項模型勝出。
第一版在 allreduce 上的結果：誤差 18.3 個百分點，profiler 做法為 22.7、counter 做法為 58.9；只有模型把多開 rail 預測為變慢。
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
