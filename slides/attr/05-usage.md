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
    text: ['程式前面加上 ibtrace record。', '不用改程式，也不需要特權。']
  - title: 看時間花在哪裡
    text: ['用 ibtrace breakdown 拆開時間。', '分成等待、登記、停頓與其他。']
  - title: 看排序後的建議
    text: ['ibtrace suggest 依預測收益排序。', '每個建議都附上要改的設定。']
  - title: 實際執行驗證
    text: ['照建議改設定，再跑幾次。', '用 ibtrace compare 比較前後。']
---

# 遇到程式變慢時的四個步驟

<!--
四個步驟各對應一個 ibtrace 指令。前三步只需要跑一次被測程式；第四步是改設定後再跑幾次，用實測確認建議是對的。
這套指令在 branch cli（commit 1cad82a），還沒有併入 main。分析用的是凍結的模型 v2，程式碼一行都沒改，啟動時會檢查模型檔案的雜湊。
目前能分析的程式是 OSU micro-benchmarks、ucx_ib_test 與 miniFE；其他程式照樣能錄，但分析會說不支援。
後面幾頁用重新登記記憶體的案例，把每一步實際走一次，輸出都是真實的。
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
接下來照著步驟走一次。
這就是第 4 部分的案例，從使用者的角度重走一次：使用者一開始不知道原因，只知道程式慢。
設定：8 張網卡都可見，UCX_MAX_RNDV_RAILS 是預設的 2。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 1：在程式前面加上 ibtrace record

```bash {1-4|5-7}
$ srun -N 4 --ntasks-per-node=1 --mpi=pmix \
    ibtrace record runs/2rails-traced -- \
    taskset -c 0 osu_allreduce -m 4194304:4194304 \
    -i 400 -x 40 -z
# （osu_allreduce 自己的輸出照常印出，這裡省略）
ibtrace: 4 ranks, 373674 records, 0 lost
ibtrace: saved in runs/2rails-traced/
```

::note::

<Note :notes="[
  ['在程式前面加上 ibtrace record。', '每個 rank 的資料存進同一個目錄。'],
  ['最後印出記錄筆數與遺失筆數。', '遺失必須是 0，trace 才完整。'],
]" />

<!--
這是實際的輸出（job 557079，4 個節點，13 秒）。省略的是 osu_allreduce 自己印的 4 行結果。
record 會自動處理：每個 rank 的檔名、tracer 的共享記憶體、它放在哪個 NUMA node，以及讀取端用哪兩顆 CPU。同一個 NUMA node 上沒有空的 CPU 時，會印出警告。
目錄裡每個 rank 有 trace（rank0.csv）、設定（rank0.json）、程式輸出（rank0.out）與網卡 counter。
不需要 root 權限，也不必重新編譯程式。每個被追蹤的行程會多用 128 MiB 記憶體放 ring。
接下來兩步分析的是資料集裡同樣設定的那一次執行（job 517932），整理成同名的目錄，數字和第 4 部分一致。新錄的這一次分析起來幾乎一樣：每個 rank 登記 197–209 ms，預測保留暫存空間快 208 ms。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 2
---

# 步驟 2：看每個 rank 的時間花在哪裡

```text {1|3-8|9-10}
$ ibtrace breakdown runs/2rails-traced
osu_allreduce 4 MB, 4 ranks; program-reported time 572.3 ms
time the trace covers, its 400 timed calls (ms):
rank   total    wait  register   stall   other
   0   431.6   133.8     200.6     0.0    97.3
   1   451.9   131.8     210.6     5.4   104.1
   2   456.7   145.9     197.8     9.8   103.2
   3   458.1   144.4     202.8    12.9    97.9
rank 0: 1846 registrations; 9 buffers repeat (top 878x, 878x)
same buffer registered again per call: 4.0 on every rank
```

::note::

<Note :notes="[
  ['只要給剛才的目錄。'],
  ['每個 rank 的時間拆成四類。', 'rank 0 有 201 ms 花在登記。', '比等待通訊的 134 ms 還多。'],
  ['同兩塊暫存空間被一再登記。', '每次呼叫都重新登記 4 次。'],
]" />

<!--
四類：wait 是等網路與其他 rank，RDMA 傳輸進行中的時間也在這裡；register 是向網卡登記與取消登記記憶體；stall 是比同類情況的中位數多出 1 ms 以上的停頓；other 是程式自己的計算與送收呼叫本身。total = wait + register + stall + other。
第一行的 program-reported time 是程式自己報的時間（OSU 的平均延遲 × 400），和 trace 涵蓋的 total 不同。這個落差還沒查明，列為待辦。
878 次 = 2 張網卡 × 439 次呼叫，是整個 trace 的次數；「每次 4 次」= 2 塊暫存空間 × 2 張網卡，只算計時的 400 次。
等待占比高不一定代表網路慢，所以模型還會做關鍵路徑分析。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 2
---

# 步驟 3：看依預測收益排序的建議

```text {1-5|6-7|8-9}
$ ibtrace suggest runs/2rails-traced
gain (ms, % of 572.3 ms)  action and setting
 +210.1  +36.7 %  keep scratch buffers:
                  MALLOC_TRIM_THRESHOLD_=1073741824
                  MALLOC_MMAP_THRESHOLD_=33554432
  +30.2   +5.3 %  stop other work on the ranks' CPUs
 -138.1  -24.1 %  use 8 rails: UCX_MAX_RNDV_RAILS=8
not checked: NUMA binding (ranks already on the HCA's node);
  competing traffic (none seen); fewer rails (already 2)
```

::note::

<Note :notes="[
  ['第一名是保留暫存空間。', '連要設的環境變數都列出來。'],
  ['改用 8 條 rail 是負的。', '代表它會讓程式更慢。'],
  ['沒有評估的動作也會說明原因。', '例如 NUMA 綁定已經正確。'],
]" />

<!--
預測收益的百分比是除以程式回報的 572.3 ms。
多開 rail 是負的，因為每多一張網卡，每塊暫存空間就要多登記一次：傳輸省 14.6 ms，多出的登記 152.8 ms。
如果只看第 2 步，可能會以為「登記很多，那就多開 rail 分散一下」；模型給出的是相反的答案。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 加上 --baselines，和傳統做法對照

```text {1-6|5}
$ ibtrace suggest --baselines runs/2rails-traced
gain (ms)                model  counters  profiler
keep scratch buffers    +210.1         —    +210.6
stop other CPU work      +30.2         —     +12.9
use 8 rails             -138.1     +20.9    +145.9
faster computation           —         —    +104.1
counters: port counters only; profiler: largest time class
```

::note::

<Note :notes="[
  ['同一份 trace，三種做法並列。', 'model 是本研究的模型。'],
  ['兩種傳統做法都建議改用 8 條 rail。', '實測它會慢 208 ms。'],
]" />

<!--
counters 是只看網卡 counter 的做法：看到有 rail 閒置就建議多開。profiler 是「哪一類時間最多就改哪一類」的做法。兩者就是第 5 部分比較的兩個基準。
「—」代表這個做法沒有提出這個動作。faster computation 沒有對應的設定，只有 profiler 做法會提。
-->

---
layout: textbook
chapter: Part 6 · Usage
ltag: Terminal
clicks: 1
---

# 步驟 4：照建議改設定，比較前後

```text {1-4|5-10}
# 照建議設定兩個環境變數，前後各跑 10 次，不開 tracer
$ export MALLOC_TRIM_THRESHOLD_=1073741824
$ export MALLOC_MMAP_THRESHOLD_=33554432
# 每次用 ibtrace record --no-trace 存進 runs/keep-buffers/
$ ibtrace compare runs/2rails runs/keep-buffers
              runs  median (ms)
2rails          10        548.8
keep-buffers    10        304.2
keep-buffers is 244.6 ms faster (-44.6 %)
95 % interval of the difference: -248.3 to -242.6 ms
```

::note::

<Note :notes="[
  ['只加兩個環境變數，不用改程式。', '比較時不開 tracer，量的才是真實時間。'],
  ['實測快 245 ms，預測 210 ms。', '方向和排序正確，大小低估約 14 %。', '所以最後一定要實際跑一次。'],
]" />

<!--
compare 只用不開 tracer 的執行：各組取中位數，區間是在各組內重抽 10,000 次得到的 95 % 區間。區間不含 0 才算有差別。
這兩組是資料集裡同設定的執行（job 517932，各 10 次），整理成 runs/2rails 與 runs/keep-buffers；當時由實驗腳本啟動，不是用 record。
同一個指令比較 2 條與 8 條 rail：548.8 → 757.3 ms，慢 38.0 %。
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
    text: ['支援透過 UCX 傳輸的 MPI 程式。', '分析目前只支援測試過的程式。', 'GPU 與 NCCL 還不支援。']
---

# 使用時的注意事項

<!--
注意 1：在沒看過的程式上，模型選對第一名的比例是 93 %，但收益大小的誤差平均 38 個百分點。
注意 2：精確數字是 0.84–2.91 µs，占一次操作時間的 4.7–31.2 %。
注意 3：分析需要知道程式回報的時間與迭代數，目前支援 OSU micro-benchmarks、ucx_ib_test 與 miniFE；其他程式照樣能錄。NUMA 類的問題從設定判斷，不從 trace 判斷。NCCL 有自己的網路傳輸路徑，不經過 UCX，目前的 tracer 看不到；這是未來的工作。
-->
