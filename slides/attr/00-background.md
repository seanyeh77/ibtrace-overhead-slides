---
layout: section
number: 1
chapter: Part 1 · Background
---

# 背景

- **1.1** 叢集、網卡與 rail
- **1.2** 平行程式的通訊：allreduce
- **1.3** 兩種觀察方式：counter 與 trace

---
layout: textbook
chapter: Part 1 · Background
---

# 背景名詞

<div class="deflist wide-term">
  <div><b>節點（node）</b><span>叢集中的一台電腦。<br>平行程式同時跑在好幾個節點上。</span></div>
  <div><b>HCA</b><span>節點上的 InfiniBand 網卡，每個節點有 8 張。<br>它能直接讀寫程式的記憶體。</span></div>
  <div><b>rail</b><span>一張 HCA 加上它的網路線。<br>可以想成一條車道，8 張 HCA 就是 8 條。</span></div>
  <div><b>UCX</b><span>介於程式與網卡之間的通訊函式庫。<br>它決定一則訊息用幾條 rail 送。</span></div>
  <div><b>MPI</b><span>平行程式最常用的通訊標準。<br>這裡用 Open MPI，它透過 UCX 傳資料。</span></div>
  <div><b>rank</b><span>MPI 程式中的每一個行程，各有編號。<br>實驗中每個節點放一個 rank。</span></div>
</div>

<!--
這六個名詞會貫穿整份簡報。最重要的是 rail：後面的主要案例就是「該用幾條 rail」。
下一頁把這些名詞畫成一張圖。
-->

---
layout: textbook
chapter: Part 1 · Background
clicks: 1
---

# 兩個節點之間有 8 條 rail

<AtCluster />

::note::

<Note :notes="[
  ['程式把資料交給 UCX。', 'UCX 透過 8 張 HCA 送出。', '兩邊的 HCA 一對一相連，形成 8 條 rail。'],
  ['UCX 送大訊息時，預設只用 2 條 rail。', '其餘 6 條閒置。', '這是主要案例的起點。'],
]" />

<!--
圖中的 HCA 0 到 HCA 7 對應叢集上實際的 8 張網卡。
UCX 的參數 UCX_MAX_RNDV_RAILS 預設為 2，用 ucx_info -c 可以看到。
一對一傳輸時，把它改成 8，4 MiB 訊息的傳送時間從 62.9 ms 降到 37.5 ms，快 40 %。
-->

---
layout: textbook
chapter: Part 1 · Background
ltag: Terminal
clicks: 2
---

# 在節點上查看網卡

```bash {1-4|5-7|8-9}
$ for d in mlx5_0 mlx5_3 mlx5_4 mlx5_5 \
>          mlx5_6 mlx5_7 mlx5_8 mlx5_9; do
>   echo "$d $(cat /sys/class/infiniband/$d/ports/1/rate)"
> done
mlx5_0 400 Gb/sec (4X NDR)
mlx5_3 400 Gb/sec (4X NDR)
...                          # 其餘 6 張相同
$ cat /sys/class/infiniband/mlx5_0/device/numa_node
0
```

::note::

<Note :notes="[
  ['/sys 底下的檔案記錄硬體資訊。', '一般使用者也能讀。', '這個迴圈讀出 8 張網卡的速度。'],
  ['每張都是 400 Gb/s。', '兩個節點之間有 8 條 400 Gb/s 的 rail。'],
  ['numa_node 是網卡旁邊那顆 CPU 的編號。', 'mlx5_0 接在 CPU 0 旁邊。', 'NUMA 實驗會故意綁到另一顆 CPU。'],
]" />

<!--
Linux 把硬體資訊放在 /sys 底下，變成一般使用者也能讀的檔案。
mlx5 是 Mellanox（現為 NVIDIA）網卡的驅動名稱，後面的數字是網卡編號。節點上還有其他不屬於 InfiniBand 的網卡，所以編號不連續。
4X NDR 代表四條通道、每條 100 Gb/s 的 NDR 規格。
-->

---
layout: definition
chapter: Part 1 · Background
term: allreduce
kind: MPI 的集體通訊
clicks: 2
---

<AtAllreduce />

每個 rank 各有一份資料。

結束時，每個 rank 都拿到全部的加總。

<!--
集體通訊（collective）是所有 rank 一起參與的通訊，allreduce 是最常用的一種。
AI 訓練的每一步都要用 allreduce 把各個 GPU 算出的梯度加總，科學計算也大量使用。
圖中的做法稱為 ring：每個 rank 只和左右鄰居交換一段資料，繞一圈之後大家都有完整的總和。
實驗中 4 個 rank 各放在一個節點上，每次 allreduce 處理 4 MiB 的資料。
-->

---
layout: textbook
chapter: Part 1 · Background
clicks: 2
---

# 兩種觀察方式：counter 與 trace

<AtTraceCounter />

::note::

<Note :notes="[
  ['程式透過 UCX 與 verbs 把資料交給 HCA。', 'verbs 是操作網卡的最底層 API。'],
  ['HCA 的 counter 記錄送出多少位元組。', '一般使用者就能讀。', '但它看不到程式呼叫了什麼。'],
  ['tracer 在程式啟動時載入。', '它記下每一次呼叫的名稱與耗時。', '這份紀錄就是 trace。'],
]" />

<!--
傳統的網路監控只看 counter；trace 則是 ibtrace 提供的。後面的主要案例會說明，只看 counter 會得到錯誤的建議。
ibtrace 的 tracer 叫 libibtrace，用 LD_PRELOAD 的方式載入：程式不需要重新編譯，也不需要任何特權。
開啟 tracer 會讓程式變慢一點，這個額外的成本稱為 overhead，上一次報告專門處理它。
-->

---
layout: textbook
chapter: Part 1 · Background
ltag: Terminal
clicks: 1
---

# 讀取 counter 與錄下 trace

```bash {1-4|5-7}
# counter：累計送出的資料量，以 4 位元組為單位
$ C=/sys/class/infiniband/mlx5_0/ports/1/counters
$ cat $C/port_xmit_data
352187340021
# trace：ibmon 啟動程式並載入 tracer，記錄寫進 trace.csv
$ ibmon -o trace.csv -- ./ucx_ib_test ...
ibmon: 41207 records read, 0 lost to ring overrun in 0 gap(s)
```

::note::

<Note :notes="[
  ['counter 是一個不斷累加的數字。', '兩次讀取相減再除以時間，就是流量。', '它不會告訴你程式在做什麼。'],
  ['ibmon 啟動程式時載入 tracer。', '結束時印出讀到與遺失的筆數。'],
]" />

<!--
輸出的數字是示意：counter 的值取決於開機以來的流量，trace 的筆數取決於程式跑多久。
ibmon 從共享記憶體讀出每一筆記錄。結束時一定會印出最後那一行；遺失不為 0 的執行，在資料集中一律標為無效。
LD_PRELOAD 是 Linux 的機制：讓程式啟動時先載入指定的函式庫，於是 tracer 可以攔截程式對 UCX 與 verbs 的呼叫，不必修改或重新編譯程式。
-->
