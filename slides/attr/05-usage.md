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
    text: ['分析 trace，拆開每個 rank 的時間。', '分成等待、登記、停頓與計算。']
  - title: 看排序後的建議
    text: ['模型依預測收益排出優化動作。', '有害的動作是負數。']
  - title: 實際執行驗證
    text: ['照第一名的建議再跑一次。', '量出真正快了多少。']
---

# 遇到程式變慢時的四個步驟

<!--
這是目前的使用流程。前三步只需要跑一次被測程式；第四步是再跑一次，用實測結果確認建議是對的。
目前這幾步是分開的腳本，下一步要整合成一個指令。後面四頁用重新登記記憶體的案例，把每一步實際走一次。
-->

---
layout: statement
chapter: Part 6 · Usage
---

# 範例：4 個節點上的 allreduce 比預期慢

程式在 4 個節點上反覆做 4 MiB 的 allreduce。

每個節點有 8 張 400 Gb/s 的網卡。

跑起來卻明顯比預期慢。

counter 顯示只有少數網卡在傳資料。

直覺會想：那就多開 rail。

<!--
接下來四頁照著步驟走一次。
這就是第 4 部分的案例，從使用者的角度重走一次：使用者一開始不知道原因，只知道程式慢。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 1：在原本的指令前加上 ibmon

```bash {1-3|4}
# 原本是 srun -N 4 --ntasks-per-node=1 ./my_mpi_app
$ srun -N 4 --ntasks-per-node=1 bash -c \
    'ibmon -o trace.$SLURM_PROCID.csv -- ./my_mpi_app'
ibmon: 503214 records read, 0 lost to ring overrun in 0 gap(s)
```

::note::

<Note :notes="[
  ['只在程式前面多一層 ibmon。', '每個 rank 各寫一份 trace。'],
  ['結束時印出讀到與遺失的筆數。', '遺失必須是 0，trace 才完整。'],
]" />

<!--
SLURM_PROCID 是每個 rank 的編號，所以 4 個 rank 各寫一份 trace：trace.0.csv 到 trace.3.csv。
程式不需要重新編譯：ibmon 用 LD_PRELOAD 讓程式啟動時載入 tracer。也不需要 root 權限。
筆數是示意，實際取決於程式跑多久。每個被追蹤的行程會多用 128 MiB 記憶體放 ring。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 2：看每個 rank 的時間花在哪裡

```bash {1-6|7}
$ python analysis/report.py trace.*.csv
rank    wait   register   stall   compute
0       45 %     38 %      2 %     15 %
1       50 %     36 %      2 %     12 %
2       40 %     40 %      5 %     15 %
3       48 %     37 %      3 %     12 %
note: the same 2 buffers are registered on every call
```

::note::

<Note :notes="[
  ['每個 rank 的時間拆成四類。', '登記占了將近四成。', '這是第一個線索。'],
  ['同樣兩塊暫存空間每次都被重新登記。', '只看 counter 看不到這件事。'],
]" />

<!--
四類是等待傳輸（wait）、登記記憶體（register）、CPU 被搶走的空檔（stall），以及計算（compute）。
這一頁的指令與輸出格式是示意；比例取自案例的量測：登記占總時間 37.7 %，真正在網路上傳資料約占 10 %。
等待（wait）占比高不一定代表網路慢：它也包含等其他 rank 的時間，所以要配合下一步的關鍵路徑分析。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 3：看依預測收益排序的建議

```bash {1|2-5}
$ python analysis/predict.py trace.*.csv
action                           predicted gain
keep scratch buffers (malloc)    +180 ms
change NUMA binding                 0 ms
use 8 rails                      -210 ms
```

::note::

<Note :notes="[
  ['模型讀入同一批 trace 與設定。', '對每個動作預測 ΔT。'],
  ['第一名是保留暫存空間。', 'NUMA 綁定已經正確，收益為 0。', '多開 rail 是負數，會更慢。'],
]" />

<!--
多開 rail 的結果正好和直覺相反。
指令與輸出格式是示意，數字取自案例：保留暫存空間的預測約 +180 ms；改用 8 條 rail 實測約慢 210 ms。
如果只看第 2 步的報告，可能會以為「登記很多，那就多開 rail 分散一下」；模型考慮了每多一張網卡就要多登記一次，所以給出負數。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 4：照建議再跑一次，量出實際收益

```bash {1-4|5}
# 依第一名的建議設定環境變數，其他都不變
$ export MALLOC_MMAP_THRESHOLD_=33554432
$ export MALLOC_TRIM_THRESHOLD_=1073741824
$ srun -N 4 --ntasks-per-node=1 ./my_mpi_app
# 實測 535 ms → 307 ms，快 43 %
```

::note::

<Note :notes="[
  ['只加兩個環境變數，不用改程式。', '這次不開 tracer，量的才是真實時間。'],
  ['實測省下 228 ms，預測 180 ms。', '方向和排序正確，大小低估約兩成。', '所以最後一定要實際跑一次。'],
]" />

<!--
535 ms 與 307 ms 是 4 個節點、每節點 1 個 rank 的 4 MiB allreduce 實測值，每種狀態不開 tracer 跑 10 次取中位數。
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
