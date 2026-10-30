---
layout: section
number: 5
chapter: Part 5 · Data
question: 要知道預測準不準，需要什麼資料？
---

# 可信的資料

- **5.1** 用一般使用者的權限製造瓶頸
- **5.2** 每一筆答案怎麼從實際執行產生
- **5.3** 開 tracer 不改變答案

---
layout: textbook
chapter: Part 5 · Data · 5.1 製造瓶頸
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
chapter: Part 5 · Data · 5.1 製造瓶頸
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
  ['taskset：忙迴圈和程式搶同一個核心。', 'numactl：程式綁到網卡另一側。', 'ib_write_bw：灌入競爭流量。', '對照組：流量灌到沒用的網卡。', 'UCX 環境變數只影響這一次執行。'],
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
chapter: Part 5 · Data · 5.2 產生答案
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

# 每一筆答案都來自實際執行：四個原則

<!--
job 是向叢集排程系統 Slurm 申請的一次執行，期間使用同一批節點。換一對節點，基準時間可能差 10–33 %，所以只比較同一個 job 內的結果。
事先寫下預期，是為了避免看到結果之後才回頭找解釋。實際上有幾項預期沒有命中，這些都照實記錄，其中一項就是第 1 部分的多開 rail。
最終資料集共 1,240 次執行，trace 遺失 0 筆；另外為最後的測試收集了 960 次，合計 2,200 次。
-->

---
layout: textbook
chapter: Part 5 · Data · 5.2 產生答案
clicks: 2
---

# 資料怎麼做出來：整體流程

<AtPipeline />

::note::

<Note :notes="[
  ['先寫下每個情境的狀態與動作。', '再寫下預期，之後不能改。', '每一批申請一個 job，用同一組節點。', '所有執行以固定種子打亂順序。', '每次執行在 manifest 記一列。', '結束碼不是 0 的執行判為無效。', 'trace 遺失不是 0 也判為無效。'],
]" />

---
layout: textbook
chapter: Part 5 · Data · 5.2 產生答案
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
  ['想獨占節點，避免別人干擾。', '但這個叢集不允許獨占。', '所以把整台的資源都申請下來。', 'sbatch 向 Slurm 申請 4 個節點。', '環境變數決定這一批跑哪些情境。', '執行中查三次 squeue。', '確認節點上只有自己的工作。'],
]" />

<!--
517932 是最終資料集中重新登記那一批：4 個節點，跑了 6 分 21 秒。提交時另外設了 GROUP=i7 與 MX=W2 兩個環境變數，選出這一批的情境；sacct 記錄的提交指令不含環境變數。一對一傳輸那一批是 517929，2 個節點。
標頭的完整內容：--account、--partition=dev、--nodes=2（被命令列的 -N 4 覆蓋）、--ntasks-per-node=1、--gres=gpu:8、--cpus-per-task=96、--mem=0、--time=02:00:00。
每節點有 8 張 GPU 與 96 個 CPU；全部申請下來，別人的工作就排不進來。
matrix.sbatch 會把這一批的所有條件以固定的隨機種子打亂順序，逐一執行，每次執行在 manifest.csv 記一行：條件、開始與結束時間、結束碼、輸出檔位置。
-->

---
layout: textbook
chapter: Part 5 · Data · 5.2 產生答案
clicks: 2
---

# 一組答案怎麼產生：40 次執行

<AtPair />

::note::

<Note :notes="[
  ['一組有兩個狀態。', '有瓶頸，與做了優化之後。', '每個狀態開與不開 tracer 各 10 次。', '答案只用不開 tracer 的執行。', '兩邊各取中位數相減，就是 ΔT。', '模型讀有瓶頸時的 10 份 trace。', '10 個預測取中位數。', '再和答案比較。'],
]" />

---
layout: textbook
chapter: Part 5 · Data · 5.3 tracer 不改變答案
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
  ['每一列是 ΔT 的比值。', '比值 = 開 tracer ÷ 不開。', '1 代表 tracer 不影響結論。', '全部 32 組的中位數是 1.02。', '例外是 NUMA 錯置。', '開 tracer 時，效果變小。', '這一類改從設定資訊判斷。'],
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
chapter: Part 5 · Data · 5.3 tracer 不改變答案
---

# NUMA 的效果變小，主要來自寫 ring

| tracer 的模式 | NUMA 錯置的 ΔT | 比值（÷ 不開 tracer） |
| --- | ---: | ---: |
| 不開 tracer | +5.75 ms | 1.00 倍 |
| 只攔截，不寫 ring | +5.08 ms | 0.88 倍（區間含 1 倍） |
| 全部開啟 | +4.03 ms | 0.70 倍（區間不含 1 倍） |

少掉的 1.73 ms 中，1.05 ms 出現在開始寫 ring 之後。

所以 NUMA 錯置改從設定判斷，不從 trace 量。

::note::

<Note :notes="[
  ['每種模式各跑 10 次。', '程式是 64 KiB allreduce。', '資料來自 job 603195。', '推論：其他 rank 本來就在等。', '寫 ring 的時間落在等待裡。'],
]" />
