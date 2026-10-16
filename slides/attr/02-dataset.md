---
layout: section
number: 3
chapter: Part 3 · Tool and Dataset
---

# 量測工具與資料集

- **3.1** ring 被繞圈時不再卡住
- **3.2** 預先配置記憶體，overhead 再降一半
- **3.3** 每一筆都有實測答案的資料集
- **3.4** 開 tracer 不改變結論

---
layout: textbook
chapter: Part 3 · Tool and Dataset
clicks: 2
---

# Ring 被繞圈時不再卡住

<AtRing />

::note::

<Note :notes="[
  'tracer 把每筆記錄寫進一個環形的緩衝區（ring），寫到尾端再繞回開頭；監控程式 ibmon 跟在後面依序讀出。格子裡的數字是記錄的序號。',
  'MPI 程式產生記錄的速度很快，tracer 繞了一圈，蓋掉兩筆還沒讀的記錄。舊版 ibmon 一直等第 3 號，永遠等不到，於是卡死。',
  '修正後，ibmon 跳到最舊的有效記錄繼續讀，並記下遺失 2 筆。再把 ring 加大到約 100 萬格，正式實驗的遺失為 0。',
]" />

<!--
舊版的 ibmon 只會等「序號剛好相等」的那一筆。修正時另外發現，舊版在被繞圈時還可能讀到寫到一半的記錄；新的回歸測試會故意製造繞圈，確認這兩個問題都不再發生。
另一項修正：MPI 每次檢查「請求完成了沒」都會記一筆。現在把連續的「還沒完成」合併成一筆，記錄量減少約三分之二。
-->

---
layout: definition
chapter: Part 3 · Tool and Dataset
term: page fault
kind: 作業系統的記憶體機制
clicks: 1
---

<AtFault />

程式第一次寫到某一頁記憶體時，作業系統才真正配置它，這一次寫入會慢上數微秒。

<!--
記憶體以「頁」為單位管理，一頁 4 KiB。向系統要一大塊記憶體時，作業系統只先記帳，等程式第一次寫到某一頁才真正配置，這個過程就是 page fault。
ring 很大，所以 tracer 寫記錄時，每寫到新的一頁就觸發一次 page fault，而這發生在被追蹤的呼叫裡面，直接算進程式的時間。
MAP_POPULATE 是建立 ring 時的一個選項，讓作業系統一次把所有頁配置好。
-->

---
layout: textbook
chapter: Part 3 · Tool and Dataset
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
  :max="6" :step="1" unit="C3 − C0, µs" :digits="2" :width="1300" :height="660" :bar-w="110"
  reveal
/>

::note::

<Note :notes="[
  'C0 是不開 tracer，C3 是開完整 tracer；C3 − C0 就是 tracer 讓每次操作多花的時間，也就是 overhead。灰色是舊的 ring，約 6.5 萬格。',
  '只把 ring 加大到約 100 萬格，第一次寫到的頁變多，64 KiB 的 overhead 反而變大。',
  '建立時預先配置整個 ring，overhead 降到原本的一半左右。上次報告的 0.7–4.5 µs 也含有 page fault，更新後為 0.84–2.91 µs。',
]" />

<!--
allreduce 這兩組是 2 個節點各 1 個 rank 的 osu_allreduce，ucx_ib_test 是一對一的 ping-pong 測試。每格 C3 跑 10 次、C0 跑 20 次。
代價是每個被追蹤的行程多用 128 MiB 記憶體，啟動多約 50 ms。每節點 8 個 rank 時多用約 1 GiB，實測沒有記憶體不足。
上次簡報的「三項優化使 overhead 降至原本的 18–43 %」，以新的結果為終點則是 14–24 %。
-->

---
layout: textbook
chapter: Part 3 · Tool and Dataset
---

# 用一般使用者的權限製造與移除瓶頸

| 瓶頸 | 製造方式 | 優化動作 |
| --- | --- | --- |
| I1 搶 CPU | 在程式所在的核心放一個忙迴圈 | 把忙迴圈移到別的核心 |
| I2 NUMA 錯置 | 把程式綁到離網卡較遠的 CPU | 綁回網卡旁邊的 CPU |
| I3 網路被佔用 | 對程式使用的網卡灌入其他流量 | 停止灌入流量 |
| I4 rail 太少 | 不需製造：UCX 預設只用 2 條 | 設定成使用 8 條 |
| NC 對照組 | 把流量灌到程式沒用的網卡 | 預期 ΔT 接近 0 |

<!--
這個叢集沒有 root 權限，所以每一種瓶頸都必須用一般使用者能做的方式製造，也要有一般使用者能做的優化動作。
NUMA：伺服器有兩顆 CPU，每張網卡接在其中一顆旁邊；程式跑在另一顆時，資料要多跨一段 CPU 之間的連線。
灌流量用的是 perftest 的 ib_write_bw，可以調整強度，實驗用了約 100、200、390 Gb/s 三種。
對照組（negative control）是「看起來有異常，但不應該有影響」的情境，用來檢查方法會不會誤報。
-->

---
layout: textbook
chapter: Part 3 · Tool and Dataset
ltag: Terminal
clicks: 3
---

# 製造瓶頸的指令

```bash {1-2|3-4|5-7|8-9}
# I1 搶 CPU：在程式所在的核心 5 放一個忙迴圈
$ taskset -c 5 sh -c 'while :; do :; done' &
# I2 NUMA 錯置：程式與記憶體都綁到另一顆 CPU
$ numactl --cpunodebind=1 --membind=1 ./program
# I3 網路被佔用：對 mlx5_0 灌入 100 Gb/s 的流量
$ ib_write_bw -d mlx5_0 --rate_limit=100 \
      --rate_limit_type=SW --run_infinitely node-b &
# I4 rail 太少：把預設的 2 條改成 8 條
$ UCX_MAX_RNDV_RAILS=8 ./program
```

::note::

<Note :notes="[
  'taskset 把行程綁在指定的 CPU 核心上。忙迴圈和程式搶同一個核心，程式就會被作業系統週期性地暫停。移除方式是把忙迴圈綁到別的核心。',
  'numactl 指定程式使用哪一顆 CPU 和哪裡的記憶體。綁到網卡的另一側，資料就要多跨一段連線；綁回 0 號就是優化動作。',
  'ib_write_bw 是 perftest 套件的頻寬測試程式，這裡拿來當競爭流量。改變 rate_limit 就能調整強度；對照組則把流量灌到程式沒用的網卡。',
  '環境變數只影響這一次執行，不需要特權。這一個動作在一對一傳輸時快 40 %，在 allreduce 時反而慢 38 %。',
]" />

<!--
ib_write_bw 需要兩端：另一個節點先以相同參數、不帶主機名稱啟動 server，這一端再連過去。
最高強度不設 rate_limit，改用 -q 4 開 4 條連線，約 390 Gb/s，接近一條 rail 的上限。
對照組：程式以 UCX_NET_DEVICES=mlx5_0:1 限定只用 mlx5_0，競爭流量則打在 mlx5_4。
-->

---
layout: rows
numbered: true
reveal: true
chapter: Part 3 · Tool and Dataset
clicks: 3
items:
  - title: 製造瓶頸
    text: 程式在有瓶頸的狀態下執行 10 次，記下每次的時間。
  - title: 執行優化動作
    text: 移除瓶頸或改設定，再執行 10 次；兩者的差就是 ΔT。
  - title: 開與不開 tracer
    text: 每種狀態都分別在 C0 與 C3 下執行，並在同一個 job 內隨機交錯。
  - title: 事先寫下預期
    text: 正式執行前，先把每個情境的預期結果寫下並存檔。
---

# 資料集的每一筆答案都來自實際執行

<!--
job 是向叢集排程系統 Slurm 申請的一次執行，期間使用同一批節點。換一對節點，基準時間可能差 10–33 %，所以只比較同一個 job 內的結果。
事先寫下預期，是為了避免看到結果之後才回頭找解釋。實際上有幾項預期沒有命中，這些都照實記錄，其中一項就是後面的主要案例。
最終資料集共 1,240 次執行，trace 遺失 0 筆；另外為最後的測試收集了 960 次，合計 2,200 次。
-->

---
layout: textbook
chapter: Part 3 · Tool and Dataset
ltag: Terminal
clicks: 2
---

# 申請節點並執行一整批實驗

```bash {1-2|3-5|6}
$ sbatch --exclusive -N 2 matrix.sbatch
sbatch: error: Exclusive mode is not allowed
# 改成申請整台節點的 GPU、CPU 與記憶體
$ sbatch -N 2 --gpus-per-node=8 --cpus-per-gpu=12 --mem=0 matrix.sbatch
Submitted batch job 517929
$ squeue -w "$SLURM_JOB_NODELIST"   # 執行中確認只有自己的 job
```

::note::

<Note :notes="[
  'sbatch 向 Slurm 申請節點並排入一批工作。想獨占兩台節點，避免別人的程式干擾量測，但這個叢集不允許 --exclusive。',
  '改成把整台的 8 張 GPU、所有 CPU 與記憶體都申請下來，別人的工作就排不進來。517929 是最終資料集中一對一傳輸那一批。',
  '執行的開始、中間與結束各用 squeue 檢查一次節點上的工作，確認只有自己的。',
]" />

<!--
matrix.sbatch 會把這一批的所有條件以固定的隨機種子打亂順序，逐一執行，每次執行在 manifest.csv 記一行：條件、開始與結束時間、結束碼、輸出檔位置。
每節點有 8 張 GPU、每張最多搭配 12 個 CPU，所以 --cpus-per-gpu=12 就是 96 個 CPU。
-->

---
layout: textbook
chapter: Part 3 · Tool and Dataset
clicks: 1
---

# 開 tracer 幾乎不改變 ΔT

<AtRatio :rows="[
  { label: 'I1 CPU contention', med: 1.18, lo: 1.02, hi: 1.37 },
  { label: 'I2 NUMA', med: 0.79, lo: 0.59, hi: 1.00 },
  { label: 'I3 competing traffic', med: 1.00, lo: 0.74, hi: 1.51 },
  { label: 'I4 rail count', med: 1.00, lo: 0.91, hi: 1.40 },
  { label: 'I7 re-registration', med: 1.04, lo: 1.02, hi: 1.37 },
  { label: 'All 32 pairs', med: 1.02, hot: true },
]" />

::note::

<Note :notes="[
  '每一列是開 tracer 量到的 ΔT 除以不開時的 ΔT：1 代表 tracer 不影響結論。方塊是中位數，橫線是各情境的範圍。全部 32 組的中位數是 1.02，沒有任何一組方向相反。',
  '例外是 I2：NUMA 錯置的效果在開 tracer 時會變小。因此這一類瓶頸改從設定資訊判斷，也就是比對程式的 CPU 和網卡在不在同一側，而不是從 trace 判斷。',
]" />

<!--
這一頁回答一個關鍵問題：模型看的是開 tracer 的 trace，但使用者在乎的是不開 tracer 時能快多少。兩者一致，模型的輸入才可信。
I1 的比值略高於 1：tracer 本身會用到一點 CPU，CPU 被搶時多被拖一點。
I2 的原因已排除攔截本身、ring 的位置和 ibmon 的位置，仍未完全確認，這裡照實列為限制。
I7 是下一節的主要案例。
-->
