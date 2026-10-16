---
layout: section
number: 1
chapter: Part 1 · Phenomenon
question: 閒置的 rail，該不該打開？
---

# 反直覺的現象

- **1.1** 叢集、網卡與 rail
- **1.2** 平行程式的通訊：allreduce
- **1.3** 多開 rail，allreduce 反而變慢

---
layout: textbook
chapter: Part 1 · Phenomenon
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
這六個名詞會貫穿整份簡報。最重要的是 rail：整份報告從「該用幾條 rail」這個問題開始。
下一頁把這些名詞畫成一張圖。
-->

---
layout: textbook
chapter: Part 1 · Phenomenon
clicks: 1
---

# 兩個節點之間有 8 條 rail

<AtCluster />

::note::

<Note :notes="[
  ['程式把資料交給 UCX。', 'UCX 透過 8 張 HCA 送出。', '兩邊的 HCA 一對一相連。', '這樣就形成 8 條 rail。'],
  ['UCX 預設只用 2 條 rail。', '其餘 6 條閒置。', '後面的案例就從這裡開始。'],
]" />

<!--
圖中的 HCA 0 到 HCA 7 對應叢集上實際的 8 張網卡。
UCX 的參數 UCX_MAX_RNDV_RAILS 預設為 2，用 ucx_info -c 可以看到。
一對一傳輸時，把它改成 8，4 MiB 訊息的傳送時間從 62.9 ms 降到 37.5 ms，快 40 %。
-->

---
layout: textbook
chapter: Part 1 · Phenomenon
ltag: Terminal
clicks: 2
---

# 查看網卡與 UCX 的 rail 設定

```bash {1-4|5-7|8-9}
$ for d in mlx5_0 mlx5_3 mlx5_4 mlx5_5 \
>          mlx5_6 mlx5_7 mlx5_8 mlx5_9; do
>   echo "$d $(cat /sys/class/infiniband/$d/ports/1/rate)"
> done
mlx5_0 400 Gb/sec (4X NDR)
mlx5_3 400 Gb/sec (4X NDR)
...                          # 其餘 6 張相同
$ ucx_info -c | grep MAX_RNDV_RAILS
UCX_MAX_RNDV_RAILS=2
```

::note::

<Note :notes="[
  ['/sys 底下的檔案記錄硬體資訊。', '一般使用者也能讀。', '這個迴圈讀出 8 張網卡的速度。'],
  ['每張都是 400 Gb/s。', '8 張網卡就是 8 條 rail。'],
  ['ucx_info -c 列出 UCX 的參數。', '大訊息最多只用 2 條 rail。', '其餘 6 條閒置。'],
]" />

<!--
Linux 把硬體資訊放在 /sys 底下，變成一般使用者也能讀的檔案。
mlx5 是 Mellanox（現為 NVIDIA）網卡的驅動名稱，後面的數字是網卡編號。節點上還有其他不屬於 InfiniBand 的網卡，所以編號不連續。
4X NDR 代表四條通道、每條 100 Gb/s 的 NDR 規格。
UCX_MAX_RNDV_RAILS 是 UCX 送大訊息時最多使用的 rail 數，預設為 2。一對一傳輸時，網卡的 counter 也顯示 8 張只有 2 張有流量。
-->

---
layout: definition
chapter: Part 1 · Phenomenon
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
layout: statement
chapter: Part 1 · Phenomenon
---

# 直覺：rail 閒著，就多開

程式在 4 個節點上反覆做 4 MiB 的 allreduce。

8 條 rail 只用了其中 2 條。

監控工具看到的是：網卡閒置。

直覺的做法是改用 8 條。

<!--
這一頁刻意先站在「只看使用率」的角度：這是傳統監控工具會給的建議，也是一般人會做的事。
改的方式只要一個環境變數：UCX_MAX_RNDV_RAILS=8。
設定：4 個節點、每節點 1 個 rank，8 張網卡都可見，UCX_MAX_RNDV_RAILS 是預設的 2（job 517932）。這個設定就是整份報告的案例。
-->

---
layout: textbook
chapter: Part 1 · Phenomenon
clicks: 1
---

# 多開 rail 在一對一傳輸變快，在 allreduce 卻變慢

<GroupedBars
  :cats="[['ucx_ib_test', 'one to one, 4 MiB'], ['osu_allreduce', '4 ranks, 4 MiB']]"
  :series="[
    { name: '2 rails, default', fill: '#e7e7e7', values: [100, 100] },
    { name: '8 rails', fill: '#6eea9e', values: [59.6, 138.0] },
  ]"
  :max="150" :step="25" unit="Time relative to 2 rails, %" :digits="1" :width="1300" :height="660" :bar-w="170"
  reveal
/>

::note::

<Note :notes="[
  ['以預設的 2 條 rail 為 100 %。', '比較改用 8 條之後的時間。'],
  ['一對一傳輸快了 40 %。', 'allreduce 反而慢了 38 %。', '下一部分用 trace 找原因。'],
]" />

<!--
兩組來自不同的程式。一對一傳輸是 ucx_ib_test 在 2 個節點上的 4 MiB ping-pong：62.9 ms 降到 37.5 ms，單向頻寬從 67 GB/s 升到 110 GB/s。
allreduce 是 osu_allreduce，4 個節點、8 張網卡都可見（job 517932）：548.8 ms 變成 757.3 ms，每種狀態不開 tracer 跑 10 次取中位數。
allreduce 變慢的結果和我們事先寫下的預期相反（事先寫下預期的做法見第 5 部分）。依照規則，預期沒有修改，結果照實記為預測錯誤，再去找原因。
-->
