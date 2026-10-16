---
layout: textbook
chapter: Overview · 背景
---

# 背景名詞

<div class="deflist wide-term">
  <div><b>HCA</b><span>InfiniBand 的網卡，負責 RDMA 傳輸。</span></div>
  <div><b>verbs</b><span>操作 RDMA 網卡的最底層 API。<br>由 libibverbs 提供。</span></div>
  <div><b>UCX</b><span>建在 verbs 之上的通訊函式庫。<br>UCP 給程式用，UCT 負責實際傳輸。</span></div>
  <div><b>rc_verbs<br>rc_mlx5</b><span>UCX 的兩種 transport。<br>rc_verbs 經由 verbs 送出資料。<br>rc_mlx5 直接寫入網卡，不經過 verbs。</span></div>
  <div><b>steady RTT</b><span>ping-pong 測試中，一次來回的時間。<br>排除了第一次迭代。</span></div>
  <div><b>progress loop</b><span>UCX 要求程式反覆呼叫的輪詢函式。<br>沒事可做時的呼叫，稱為空轉輪詢。</span></div>
</div>

<!--
rc_mlx5 直接寫入的是網卡的工作佇列。ping-pong：client 送出訊息並等 server 回覆，算一次迭代。progress loop 用來推進通訊。
聽眾大致知道 RDMA 是什麼，這一頁補上 InfiniBand 與 UCX 的術語。
後面最重要的是 rc_verbs 與 rc_mlx5 的差別：rc_verbs 多經過 verbs 一層，這是 tracer overhead 不對稱的原因。
-->

---
layout: textbook
chapter: Overview · 架構
clicks: 2
---

# ibtrace 的架構

<ArchDiagram />

::note::

<Note :notes="[
  ['程式經 UCP、UCT 兩層送出資料。', 'rc_verbs 再經過 verbs。', 'rc_mlx5 直接寫入網卡。'],
  ['tracer 以 LD_PRELOAD 載入。', '每次被攔截的呼叫是一個 span。', 'span 記下進入與離開的時間。'],
  ['每個 span 寫成一筆 128 B 的記錄。', '記錄放進共享記憶體的 ring。', 'ibmon 讀出記錄並取樣 counter。'],
]" />

<!--
tracer 就是 libibtrace，它攔截 UCP、UCT、verbs 三層的呼叫。ibmon 取樣的是網卡的 port counters。
這張圖交代後面會一直出現的四個名詞：tracer、span、ring、ibmon。
注意 rc_verbs 那條路徑多經過 verbs 一層，tracer 在 rc_verbs 上攔截的呼叫因此比較多；這就是後面 overhead 不對稱的來源。
ring 有 65,536 個 slot，每個 128 B，共 8 MB。
-->

---
layout: rows
numbered: true
reveal: true
chapter: Overview · 量測設計
clicks: 3
items:
  - title: 純測試程式
    text: ['只執行 ucx_ib_test。', '這是量測 steady RTT 的基準。']
  - title: 加上 ibmon
    text: ['經 ibmon 啟動，並取樣網卡 counter。', '與上一列的差，是取樣的 overhead。']
  - title: 只攔截
    text: ['載入 tracer 並攔截呼叫，但不寫記錄。', '與上一列的差，是攔截與讀時鐘的成本。']
  - title: 完整 tracer
    text: ['攔截並把記錄寫進 ring。', '與上一列的差，是寫入記錄的成本。']
---

# 相鄰條件相減，拆出各部分的 overhead

<!--
每一格是「條件 × transport × 訊息大小」的組合，transport 有 rc_verbs、rc_mlx5，訊息大小有 8 B、64 KiB、1 MiB。
每格跑 10 次，每次 1,000 次迭代，所有格子在同一個 job 內以固定 seed 隨機交錯執行，避免時段或節點的差異被誤認為 overhead。
統計單位是一次執行：先取每次執行 999 個 RTT 的中位數，再取 10 次執行的中位數；信賴區間以執行為單位做 bootstrap。
第四列減第一列就是總 overhead。
另有第五種條件（關閉 UCT 系列 layer），這次報告不展開。
-->
