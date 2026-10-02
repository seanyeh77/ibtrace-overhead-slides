---
layout: textbook
chapter: Overview · 背景
---

# 背景名詞

<div class="deflist wide-term">
  <div><b>HCA</b><span>InfiniBand 的網卡，負責執行 RDMA 傳輸。</span></div>
  <div><b>verbs</b><span>操作 RDMA 網卡的最底層 API，由 libibverbs 提供。</span></div>
  <div><b>UCX</b><span>建在 verbs 之上的通訊函式庫，分為給應用程式使用的 UCP，以及負責實際傳輸的 UCT。</span></div>
  <div><b>rc_verbs<br>rc_mlx5</b><span>UCX 的兩種 transport：rc_verbs 經由 verbs 送出資料，rc_mlx5 直接寫入網卡的工作佇列，不經過 verbs。</span></div>
  <div><b>steady RTT</b><span>測試程式以 ping-pong 量測：client 送出訊息並等 server 回覆，算一次迭代；steady RTT 是排除第一次迭代後的來回時間。</span></div>
  <div><b>progress loop</b><span>UCX 要求程式反覆呼叫的輪詢函式，用來推進通訊；沒有事可做時的呼叫稱為空轉輪詢。</span></div>
</div>

<!--
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
  '被測程式經由 UCX 的 UCP、UCT 兩層送出資料；rc_verbs 會再經過 verbs，rc_mlx5 則直接寫入網卡。',
  'tracer（libibtrace）以 LD_PRELOAD 載入並攔截這三層的呼叫。每次被攔截的呼叫稱為一個 span，記下進入與離開的時間。',
  '每個 span 寫成一筆 128 B 的記錄，放進共享記憶體 ring；ibmon 從 ring 讀出記錄，同時取樣網卡的 port counters。',
]" />

<!--
這張圖交代後面會一直出現的四個名詞：tracer、span、ring、ibmon。
注意 rc_verbs 那條路徑多經過 verbs 一層，tracer 在 rc_verbs 上攔截的呼叫因此比較多；這就是後面 overhead 不對稱的來源。
ring 有 65,536 個 slot，每個 128 B，共 8 MB。
-->

---
layout: steps
chapter: Overview · 量測設計
clicks: 3
steps:
  - title: 純測試程式
    code: C0
    text: 只執行 ucx_ib_test，作為量測 ping-pong steady RTT 的基準。
  - title: 加上 ibmon
    code: C1
    text: 經 ibmon 啟動並取樣網卡計數器，但不載入 tracer；C1 − C0 即取樣的 overhead。
  - title: 只攔截
    code: C2
    text: 載入 tracer 並攔截呼叫，但不寫入記錄；C2 − C1 即攔截與讀取時鐘的 overhead。
  - title: 完整 tracer
    code: C3
    text: 攔截並寫入 ring；C3 − C2 即寫入記錄的 overhead，C3 − C0 則是總 overhead。
---

# 相鄰條件相減，拆出各部分的 overhead

<!--
每一格是「條件 × transport × 訊息大小」的組合，transport 有 rc_verbs、rc_mlx5，訊息大小有 8 B、64 KiB、1 MiB。
每格跑 10 次，每次 1,000 次迭代，所有格子在同一個 job 內以固定 seed 隨機交錯執行，避免時段或節點的差異被誤認為 overhead。
統計單位是一次執行：先取每次執行 999 個 RTT 的中位數，再取 10 次執行的中位數；信賴區間以執行為單位做 bootstrap。
另有 C4（關閉 UCT 系列 layer），這次報告不展開。
-->
