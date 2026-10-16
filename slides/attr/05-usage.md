---
layout: section
number: 6
chapter: Part 6 · Usage
---

# 使用方式

- **6.1** 四個步驟
- **6.2** 範例：allreduce 跑得比預期慢
- **6.3** 不同情況的判讀
- **6.4** 使用時的注意事項

---
layout: rows
numbered: true
reveal: true
chapter: Part 6 · Usage
clicks: 3
items:
  - title: 錄下 trace
    text: ['在原本的指令前加上 ibmon。', '不用改程式，也不需要特權。']
  - title: 看時間花在哪裡
    text: ['分析 trace，拆開每個 rank 的時間。', '分成等待、登記、停頓與其他。']
  - title: 看排序後的建議
    text: ['模型依預測收益排出優化動作。', '有害的動作是負數。']
  - title: 實際執行驗證
    text: ['照第一名的建議再跑一次。', '量出真正快了多少。']
---

# 遇到程式變慢時的四個步驟

<!--
這是目前的使用流程。前三步只需要跑一次被測程式；第四步是再跑一次，用實測結果確認建議是對的。
目前這幾步還是分開的：錄 trace 用 ibmon，分析與預測是呼叫模型的函式，還沒有指令列介面。下一步要整合成一個指令。
後面四頁用重新登記記憶體的案例，把每一步實際走一次。數字都來自 job 517932 與分析 job 556928。
-->

---
layout: statement
chapter: Part 6 · Usage
---

# 範例：4 個節點上的 allreduce 比預期慢

程式在 4 個節點上反覆做 4 MiB 的 allreduce。

每個節點有 8 張 400 Gb/s 的網卡。

UCX 預設只用其中 2 張。

跑起來卻明顯比預期慢。

直覺會想：那就多開 rail。

<!--
接下來四頁照著步驟走一次。
這就是第 4 部分的案例，從使用者的角度重走一次：使用者一開始不知道原因，只知道程式慢。
設定：8 張網卡都可見，UCX_MAX_RNDV_RAILS 是預設的 2。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 1：在原本的指令前加上 ibmon

```bash {1-4|5}
# 簡化版：實驗中由 matrix.sbatch 逐次啟動
$ srun --mpi=pmix -N 4 --ntasks-per-node=1 bash -c \
    'ibmon -o trace.r$SLURM_PROCID.csv -b mlx5_0:1 -- \
     osu_allreduce -m 4194304:4194304 -i 400 -x 40 -z'
ibmon: 91176 records read, 0 lost to ring overrun in 0 gap(s)
```

::note::

<Note :notes="[
  ['只在程式前面多一層 ibmon。', '每個 rank 各寫一份 trace。'],
  ['結束時印出讀到與遺失的筆數。', '遺失必須是 0，trace 才完整。'],
]" />

<!--
這是簡化版，沒有照這一行原樣跑過。實驗中由 matrix.sbatch 對每次執行呼叫 srun，再由 mx_task.py 在每個 rank 啟動 ibmon，並加上 -s、-N、-C 控制 ring 與讀取端的位置。
用 bash -c 包起來，SLURM_PROCID 才會在每個 rank 上展開，4 個 rank 各寫一份 trace。-b mlx5_0:1 是要取樣 counter 的網卡。
最後一行是實際的輸出：取自同一批實驗（job 517932）只開放 mlx5_0 那一組的 rank 0。
程式不需要重新編譯：ibmon 用 LD_PRELOAD 讓程式啟動時載入 tracer。也不需要 root 權限。每個被追蹤的行程會多用 128 MiB 記憶體放 ring。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 2
---

# 步驟 2：看每個 rank 的時間花在哪裡

```bash {1-3|4-5|4-8}
$ R=logs/injection_matrix/I7_W2_4x1-517932/runs
$ python3 docs/slides/v2_case_dump.py logs/analysis/v2frozen \
      $R/0009_W2-I7xI4-4MB_removed_rails_C3_rep08
rank       W    wait     reg   stall   other   avoid
r0     431.6   133.8   200.6     0.0    97.3   200.6
r1     451.9   131.8   210.6     5.4   104.1   210.6
r2     456.7   145.9   197.8     9.8   103.2   197.8
r3     458.1   144.4   202.8    12.9    97.9   202.8
```

::note::

<Note :notes="[
  ['模型還沒有指令列介面。', '這支小腳本呼叫凍結版模型的函式。'],
  ['rank 0 有 201 ms 花在登記。', '比等待通訊的 134 ms 還多。'],
  ['avoid 是重複登記的時間。', '每個 rank 的登記全是重複的。'],
]" />

<!--
分析在計算節點上執行（job 556928，3 秒）。v2_case_dump.py 約 70 行，只呼叫凍結版模型的 load_run、analyse、decompose 與 model，然後印出結果。
輸出是節錄，單位是 ms，是 400 次計時迭代的總和。原本還有 stall 的四個來源、outside、rep_c 與登記次數等欄位。
W 是每次迭代的牆鐘時間總和，W = wait + reg + stall + other。wait 是等通訊，包含等 RDMA 傳完與等其他 rank；other 是程式自己的工作，例如歸約計算。
等待占比高不一定代表網路慢，所以要配合下一步的關鍵路徑分析。
-->

---
layout: textbook
chapter: Part 6 · Usage
clicks: 1
---

# 步驟 3：看依預測收益排序的建議

| 優化動作 | 本研究 | counter 做法 | profiler 做法 |
| --- | ---: | ---: | ---: |
| 保留暫存空間 | **+210 ms** | 沒有列出 | +211 ms |
| 移除干擾 | +30 ms | 沒有列出 | +13 ms |
| 改用 8 條 rail | **−138 ms** | +21 ms | +146 ms |

::note::

<Note :notes="[
  ['本研究把保留暫存空間排第一。', '改用 8 條 rail 是負的，會更慢。'],
  ['兩種傳統做法都建議改用 8 條 rail。', '實測它會慢 208 ms。'],
]" />

<!--
三欄都來自同一支小腳本的輸出，分析的是步驟 2 那一次執行（job 556928）。
本研究的預測：保留暫存空間 +210.1 ms，占總時間 36.7 %；改用 8 條 rail −138.1 ms，其中傳輸省 14.6 ms，多出的登記 152.8 ms。
NUMA 綁定沒有列出，因為四個 rank 都沒有放錯 NUMA，模型不評估它；外來流量低於門檻，競爭流量也不評估。
如果只看第 2 步，可能會以為「登記很多，那就多開 rail 分散一下」；模型考慮了每多一張網卡就要多登記一次，所以給出負數。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 4：照建議再跑一次，量出實際收益

```bash {1-5|6}
# 依第一名的建議設定環境變數，其他都不變
$ export MALLOC_MMAP_THRESHOLD_=33554432
$ export MALLOC_TRIM_THRESHOLD_=1073741824
$ srun --mpi=pmix -N 4 --ntasks-per-node=1 \
      osu_allreduce -m 4194304:4194304 -i 400 -x 40 -z
# 實測 549 ms → 304 ms，快 45 %
```

::note::

<Note :notes="[
  ['只加兩個環境變數，不用改程式。', '這次不開 tracer，量的才是真實時間。'],
  ['實測省下 245 ms，預測 210 ms。', '方向和排序正確，大小低估約 14 %。', '所以最後一定要實際跑一次。'],
]" />

<!--
srun 這一行是簡化版。548.8 與 304.2 ms 是 job 517932 中 8 張網卡都可見、預設 2 條 rail 的實測值，每種狀態不開 tracer 跑 10 次取中位數。
如果第一名的動作沒有帶來收益，就回到步驟 3 試第二名。
-->

---
layout: textbook
chapter: Part 6 · Usage
---

# 不同情況下，ibtrace 看到什麼、該做什麼

| 你遇到的情況 | ibtrace 看到的證據 | 建議的動作 |
| --- | --- | --- |
| 執行時間忽長忽短 | 呼叫之間有數毫秒的空檔 | 找出搶 CPU 的行程，換核心 |
| 程式綁在離網卡遠的 CPU | 設定：CPU 與網卡在不同 NUMA node | 用 numactl 綁回網卡那一側 |
| 和別人的工作共用網卡 | counter 的流量大於程式自己送的量 | 用 UCX_NET_DEVICES 換一張網卡 |
| 大訊息只用 2 條 rail | 設定：rail 參數小於網卡數 | 沒有重新登記時，才多開 rail |
| 同一塊記憶體反覆登記 | 每次呼叫都登記與取消同一個位址 | 設定 MALLOC 門檻，保留暫存空間 |

<!--
這張表對應資料集裡的五種瓶頸：搶 CPU、NUMA 錯置、網路被佔用、rail 太少，以及案例中的重新登記。
第一列：被搶 CPU 時，程式不是每次都變慢，而是偶爾被暫停十幾到二十毫秒，所以中位數可能完全不變，只有總時間變長。
第三列：一般使用者也能用 rdma resource show qp 看到同一張網卡上其他行程的連線，確認是誰在佔用。
第四列：一對一傳輸時多開 rail 快了 40 %，但如果同時有重新登記的問題，多開反而更慢，所以要先處理第五列。
-->

---
layout: rows
chapter: Part 6 · Usage
reveal: true
clicks: 2
items:
  - label: 注意 1
    title: 以實測為準
    text: ['模型的排序大多可靠。', '收益大小可能差數十個百分點。', '每個建議都要實際跑一次。']
  - label: 注意 2
    title: Tracer 的成本
    text: ['每次操作多花約 1–3 µs。', '每個行程多用 128 MiB 記憶體。', '量時間請用不開 tracer 的執行。']
  - label: 注意 3
    title: 目前的範圍
    text: ['支援透過 UCX 傳輸的 MPI 程式。', 'GPU 與 NCCL 還不支援。', 'NUMA 類問題從設定判斷。']
---

# 使用時的注意事項

<!--
注意 1：在沒看過的程式上，模型選對第一名的比例是 93 %，但收益大小的誤差平均 38 個百分點。
注意 2：精確數字是 0.84–2.91 µs，占一次操作時間的 4.7–31.2 %。
注意 3：NCCL 有自己的網路傳輸路徑，不經過 UCX，目前的 tracer 看不到；這是未來的工作。
-->
