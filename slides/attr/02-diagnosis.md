---
layout: section
number: 2
chapter: Part 2 · Diagnosis
question: 為什麼多開 rail 反而變慢？
---

# 用 trace 找原因

- **2.1** 兩種觀察方式：counter 與 trace
- **2.2** 每次呼叫都重新登記記憶體
- **2.3** 修正與結果

---
layout: textbook
chapter: Part 2 · Diagnosis
clicks: 2
---

# 兩種觀察方式：counter 與 trace

<AtTraceCounter />

::note::

<Note :notes="[
  ['程式透過 UCX 與 verbs 送資料。', 'verbs 是操作網卡的最底層 API。'],
  ['counter 記錄送出的位元組數。', '一般使用者就能讀。', '但它看不到程式呼叫了什麼。'],
  ['tracer 在程式啟動時載入。', '它記下每一次呼叫的名稱與耗時。', '這份紀錄就是 trace。'],
]" />

<!--
上一部分「8 條只用了 2 條」的觀察，來自 counter。傳統的網路監控只看 counter；trace 則是 ibtrace 提供的。這一部分改看 trace。
ibtrace 的 tracer 叫 libibtrace，用 LD_PRELOAD 的方式載入：程式不需要重新編譯，也不需要任何特權。
開啟 tracer 會讓程式變慢一點，這個額外的成本稱為 overhead，上一次報告專門處理它。
-->

---
layout: textbook
chapter: Part 2 · Diagnosis
ltag: Terminal
clicks: 1
---

# 用 ibtrace record 錄下 trace

```text {1-4|5-7}
$ srun -N 4 --ntasks-per-node=1 --mpi=pmix \
    ibtrace record runs/2rails-traced -- \
    taskset -c 0 osu_allreduce -m 4194304:4194304 \
    -i 400 -x 40 -z
ibtrace: 4 ranks, 374891 records, 0 lost
ibtrace: program output in runs/2rails-traced/rank0.out
ibtrace: saved in runs/2rails-traced/
```

::note::

<Note :notes="[
  ['在程式前面加上 ibtrace record。', '每個 rank 的資料存進同一個目錄。'],
  ['最後印出記錄筆數與遺失筆數。', '遺失必須是 0，trace 才完整。', '程式自己的輸出存在 rank0.out。'],
]" />

<!--
這是實際的輸出（job 557154，4 個節點，9 秒）。程式自己的輸出不印在終端機，存在 rank0.out；加 --show-output 才會照常印出。結束後節點的 /dev/shm 沒有留下任何 ibtrace 的檔案。
record 會自動處理：每個 rank 的檔名、tracer 的共享記憶體、它放在哪個 NUMA node，以及讀取端用哪兩顆 CPU。同一個 NUMA node 上沒有空的 CPU 時，會印出警告。
目錄裡每個 rank 有 trace（rank0.csv）、設定（rank0.json）、程式輸出（rank0.out）與網卡 counter。
不需要 root 權限，也不必重新編譯程式。每個被追蹤的行程會多用 128 MiB 記憶體放 ring。
接下來分析的是資料集裡同樣設定的那一次執行（job 517932），整理成同名的目錄。用 record 新錄的另一次（job 557079）分析起來幾乎一樣：每個 rank 登記 197–209 ms，預測保留暫存空間快 208 ms。
-->

---
layout: textbook
chapter: Part 2 · Diagnosis
ltag: Terminal
clicks: 2
---

# 拆開時間：登記比等待通訊還多

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
  ['breakdown 只要給剛才的目錄。'],
  ['每個 rank 的時間拆成四類。', 'rank 0 有 201 ms 花在登記。', '比等待通訊的 134 ms 還多。', '登記是什麼，下一頁說明。'],
  ['同兩塊記憶體被一再登記。', '每次呼叫都重新登記 4 次。'],
]" />

<!--
四類：wait 是等網路與其他 rank，RDMA 傳輸進行中的時間也在這裡；register 是向網卡登記與取消登記記憶體；stall 是比同類情況的中位數多出 1 ms 以上的停頓；other 是程式自己的計算與送收呼叫本身。total = wait + register + stall + other。
第一行的 program-reported time 是程式自己報的時間（OSU 的平均延遲 × 400），和 trace 涵蓋的 total 不同。這個落差還沒查明，列為待辦。
878 次 = 2 張網卡 × 439 次呼叫，是整個 trace 的次數；「每次 4 次」= 2 塊暫存空間 × 2 張網卡，只算計時的 400 次。
等待占比高不一定代表網路慢，所以模型還會做關鍵路徑分析。
-->

---
layout: definition
chapter: Part 2 · Diagnosis
term: registration
kind: RDMA 傳輸前的登記
size: 52px
clicks: 2
---

<AtReg />

網卡要直接讀寫一塊記憶體，必須先登記。

每一張用到的網卡，都要各登記一次。

<!--
RDMA 讓網卡不經過 CPU 直接搬資料，所以網卡必須知道哪些記憶體可以碰。這個登記稱為記憶體註冊（memory registration）。
登記很貴：1 MiB 約 22 µs，取消登記約 10 µs，而且每張網卡要各登記一次。
UCX 會記住登記過的記憶體，下次直接重用；前提是那塊記憶體一直留在程式裡，沒有還給作業系統。
-->

---
layout: textbook
chapter: Part 2 · Diagnosis
clicks: 3
---

# Trace 顯示每次呼叫都在重新註冊同一塊記憶體

<AtChurn />

::note::

<Note :notes="[
  ['每次呼叫都 malloc 兩塊 1 MiB。', 'UCX 在每張網卡上登記它們。'],
  ['接著執行 allreduce 本身。', '估算真正傳資料只占約 10 %。'],
  ['呼叫結束時 free 掉暫存空間。', 'glibc 把它還給作業系統。'],
  ['UCX 只好作廢這塊記憶體的登記。', '下一次呼叫又得重新登記。', '登記占總時間的 45 %。'],
]" />

<!--
malloc 拿到的兩塊 1 MiB 是 Open MPI 的 allreduce 用的暫存空間。glibc 是 Linux 的記憶體管理函式庫。
UCX 發現記憶體被還回去，為了安全只好作廢登記；下一次呼叫拿到同一個位址也得重新登記。
這個循環是從 trace 看出來的：同樣的兩個位址，每次呼叫都被登記、取消、再登記，在預設 2 條 rail 時各 878 次。
「約 10 %」是估算：每次迭代送出的位元組數除以 400 Gb/s 的線速。trace 只記錄張貼傳輸的時間，量不到真正在線上的時間。
登記占比 45 % 是 rank 0 的登記與取消登記時間，占總時間的比例（job 517932，8 張網卡都可見、預設 2 條 rail）。
為了確認先後順序，另外用 gdb 在記憶體被還回去與取消登記的地方設中斷點，順序與圖中一致。
用比喻來說：每次出貨都把箱子丟掉、隔天買一個新的，報關單就得重填；碼頭越多，要填的報關單越多。
-->

---
layout: textbook
chapter: Part 2 · Diagnosis
ltag: Terminal
clicks: 2
---

# 從 trace 數出登記次數

```text {1-2|3-4|5-9}
$ grep -c ibv_reg_mr runs/2rails-traced/rank0.csv
1846
$ grep -c ibv_reg_mr runs/8rails-traced/rank0.csv
7126
$ awk -F, '/ibv_reg_mr/ {printf "0x%x %d\n", $11, $12}' \
    runs/2rails-traced/rank0.csv \
    | sort | uniq -c | sort -rn | head -2
    878 0x3671060 1048576
    878 0x3571050 1048576
```

::note::

<Note :notes="[
  ['trace 是 CSV 檔，用 grep 就能數。', '2 條 rail：登記 1,846 次。'],
  ['8 條 rail：7,126 次。', '約 4 倍，正好對應網卡數 2 → 8。'],
  ['被登記的只有兩個 1 MiB 的位址。', '兩個各出現 878 次。', '每次呼叫都在重新登記它們。'],
]" />

<!--
指令與輸出都是實際的。runs/ 底下是把 job 517932 的執行整理成的目錄（只有符號連結）：2rails-traced 是預設 2 條 rail、開 tracer 的一次，8rails-traced 是改用 8 條 rail、開 tracer 的一次。兩份都是 rank 0 的 trace。
grep 算到的是 ibv_reg_mr_iova2，也就是 UCX 實際呼叫的版本；取消登記的 ibv_dereg_mr 不含這個字串，不會被算進來。ibtrace breakdown 印出的登記次數與 grep 完全相同。
位址在第 11 欄，是十進位，所以用 printf 轉成十六進位；第 12 欄是長度。
878 = 2 張網卡 × 439 次呼叫。8 條 rail 時，同樣兩個位址各 3,512 次，也就是 8 × 439。
只開放一張網卡時，同樣兩個位址各 439 次，共 912 次。
counter 看不到這件事：網卡只記錄送了多少位元組，不記錄登記了幾次記憶體。
-->

---
layout: textbook
chapter: Part 2 · Diagnosis
---

# 登記次數與使用的網卡數成正比

<HBars
  :panels="[{ title: 'Registrations in one run', max: 8000, items: [
    { label: '1 HCA', v: 912 },
    { label: '2 HCAs', v: 1846 },
    { label: '4 HCAs', v: 3606 },
    { label: '8 HCAs', v: 7126, hot: true },
  ] }]"
  unit="calls" :panel-w="1300" :label-w="220" :row-h="100"
/>

<!--
只改 UCX 使用的網卡數，其他條件都相同。網卡數加倍，登記次數也幾乎加倍，因為每張網卡都要各自登記。
都是 rank 0 一次執行的登記次數。1 張網卡來自只開放 mlx5_0 的情境（job 517932）；2、4、8 張來自 8 張都可見、改變 rail 數的診斷實驗（diag_rails，job 517043）。
從 2 條到 8 條 rail，不開 tracer 量到的總時間多了 208 ms（job 517932）。
ibtrace breakdown 量到的登記時間：2 條 rail 時每個 rank 198–211 ms，8 條 rail 時 394–414 ms，多出約 200 ms，和變慢的 208 ms 相當。
所以多開 rail 變慢，不是因為傳輸變差，而是要重複登記的網卡變多了。傳輸估算只占約 10 %，省下的時間遠小於多出的登記。
-->

---
layout: textbook
chapter: Part 2 · Diagnosis
ltag: Terminal
clicks: 3
---

# 修正：讓暫存空間留在程式裡

```text {1-3|2|3|4-10}
# 兩個 glibc 環境變數；前後各跑 10 次，不開 tracer
$ export MALLOC_MMAP_THRESHOLD_=33554432    # 32 MiB
$ export MALLOC_TRIM_THRESHOLD_=1073741824  # 1 GiB
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
  ['修正只需要兩個 glibc 環境變數。', '不必修改或重新編譯程式。'],
  ['超過 mmap 門檻，就單獨向系統要。', '門檻提高到 32 MiB。', '1 MiB 就改從記憶體池配置。'],
  ['trim 門檻決定何時歸還記憶體。', '提高到 1 GiB，空間就留在程式裡。', '兩個必須一起設。'],
  ['不開 tracer，前後各跑 10 次。', '中位數 549 → 304 ms。', '快了 245 ms。', '區間不含 0，差別是真的。'],
]" />

<!--
記憶體池指的是 heap，也就是程式自己管理的記憶體。trim 門檻是 heap 頂端空出超過這個值，才還給系統。mmap 門檻以上的記憶體單獨向系統要、free 時直接歸還。空間留在程式裡，UCX 的登記就一直有效。
只設其中一個時，glibc 會停止自動調整，另一個回到 128 KiB 的預設值，記憶體仍會被還回去。實驗也證實只設一個不夠：只設 mmap 門檻時，各 rank 的 heap 配置不同，有的 rank 每次重新登記 0 塊、有的 1 塊或 2 塊，總時間由最慢的 rank 決定，結果呈現兩群。
glibc 預設會自動調整這兩個門檻：前幾次 1 MiB 用單獨配置的方式、釋放時直接歸還；之後門檻自動提高，改從 heap 配置，但 heap 頂端空出 2 MiB 時又被修剪還給系統。所以無論哪一種，登記都會失效。
compare 只用不開 tracer 的執行：各組取中位數，區間是在各組內重抽 10,000 次得到的 95 % 區間。區間不含 0 才算有差別。
這兩組是資料集裡同設定的執行（job 517932，各 10 次），整理成 runs/2rails 與 runs/keep-buffers；當時由實驗腳本啟動，不是用 record。
同一個指令比較 2 條與 8 條 rail：548.8 → 757.3 ms，慢 38.0 %。
-->

---
layout: compare
chapter: Part 2 · Diagnosis
left: 預設的 malloc
right: 保留暫存空間
reveal: true
clicks: 4
rows:
  - ['總時間', '549 ms', '304 ms，快 45 %']
  - ['每次的登記', '4.20 次', '0.20 次']
  - ['登記占比', '45.4 %', '17.9 %']
  - ['多開 rail', '慢 38 %', '+0.1 %，沒有差別']
---

# 保留暫存空間後，allreduce 快 45 %

<!--
這是 job 517932：4 個節點、每節點 1 個 rank 的 4 MiB allreduce，8 張網卡都可見、預設 2 條 rail，每格不開 tracer 執行 10 次取中位數。總時間是 548.8 → 304.2 ms；多開 rail 時是 757.3 ms，保留暫存空間後再多開 rail 是 304.4 ms。
每次的登記與登記占比取自 rank 0 的 trace。
資料集裡另有只開放一張網卡的情境：517.3 → 307.0 ms，快 41 %。
最後一列證明了因果：保留暫存空間後，8 條 rail 和 2 條 rail 已經沒有差別，所以先前的變慢完全來自重新登記。也因為傳輸估算只占約 10 %，多開 rail 並沒有好處。
-->

---
layout: compare
chapter: Part 2 · Diagnosis
left: 看使用率（counter）
right: 看 trace
reveal: true
clicks: 3
rows:
  - ['看到', '8 條 rail 只用了 2 條', '每次呼叫都重新登記同一塊記憶體']
  - ['建議', '改用 8 條 rail', '讓暫存空間不還給系統']
  - ['結果', '慢 38 %', '快 45 %']
---

# 看使用率與看 trace 得到相反的建議

<!--
這個案例說明了三件事。
第一，閒置的資源看起來像浪費，但時間其實花在別處。
第二，優化動作可能有害，所以工具必須預測收益的正負，而不只是指出異常。
第三，counter 只記錄位元組數，看不到登記了幾次記憶體；只有攔截每一次呼叫的 trace 看得到。
誠實補充：「記憶體還給系統會讓登記失效」這個機制早在 2006 年就有人討論。我們的新發現是它在現在的預設組合下仍然存在，而且多開 rail 會把它放大。這個瓶頸不是我們製造的，任何人在類似環境跑 4 MiB allreduce 都可能遇到。
這帶出研究問題：既然優化動作可能有害，工具就必須在動手之前，預測每個動作的收益。
-->
