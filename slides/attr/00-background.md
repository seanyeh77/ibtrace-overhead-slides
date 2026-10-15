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
  <div><b>節點（node）</b><span>叢集中的一台電腦。平行程式會同時在好幾個節點上執行。</span></div>
  <div><b>HCA</b><span>節點上的 InfiniBand 網卡，可以直接讀寫程式的記憶體來傳送資料。這個叢集的每個節點有 8 張。</span></div>
  <div><b>rail</b><span>一張 HCA 加上它的網路線，可以想成一條車道；8 張 HCA 就是 8 條 rail。</span></div>
  <div><b>UCX</b><span>介於程式與網卡之間的通訊函式庫，決定一則訊息要用幾條 rail、怎麼切開來送。</span></div>
  <div><b>MPI</b><span>平行程式最常用的通訊標準。這裡使用 Open MPI，它透過 UCX 傳送資料。</span></div>
  <div><b>rank</b><span>一個 MPI 程式中的每一個行程，各有編號；實驗中每個節點放一個 rank。</span></div>
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
  '每個節點上，程式把資料交給 UCX，UCX 再透過 8 張 HCA 送出；兩個節點的 HCA 一對一相連，形成 8 條 rail。',
  'UCX 送大訊息時，預設最多只用其中 2 條 rail，其餘 6 條閒置。這個預設值是後面主要案例的起點。',
]" />

<!--
圖中的 HCA 0 到 HCA 7 對應叢集上實際的 8 張網卡。
UCX 的參數 UCX_MAX_RNDV_RAILS 預設為 2，用 ucx_info -c 可以看到。
一對一傳輸時，把它改成 8，4 MiB 訊息的傳送時間從 62.9 ms 降到 37.5 ms，快 40 %。
-->

---
layout: definition
chapter: Part 1 · Background
term: allreduce
kind: MPI 的集體通訊
clicks: 2
---

<AtAllreduce />

每個 rank 各有一份資料，結束時每個 rank 都拿到全部資料的加總。

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
  '程式透過 UCX 與 verbs（操作網卡的最底層 API）把資料交給 HCA。',
  'HCA 上的 port counter 記錄送出了多少位元組，一般使用者就能讀取，但看不到程式呼叫了什麼、各花多久。',
  'ibtrace 的 tracer（libibtrace）在程式啟動時載入，攔截程式對 UCX 與 verbs 的每一次呼叫，記下名稱與耗時，這份紀錄就是 trace。',
]" />

<!--
傳統的網路監控只看 counter；trace 則是 ibtrace 提供的。後面的主要案例會說明，只看 counter 會得到錯誤的建議。
tracer 是用 LD_PRELOAD 的方式載入：程式不需要重新編譯，也不需要任何特權。
開啟 tracer 會讓程式變慢一點，這個額外的成本稱為 overhead，上一次報告專門處理它。
-->
