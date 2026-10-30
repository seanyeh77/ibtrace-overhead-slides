---
layout: section
number: 2
chapter: Part 2 · Coverage
question: 六個動作之外，還有哪些優化？
---

# 還沒涵蓋的優化

- **2.1** 目前會評估的六個動作
- **2.2** 每一層還有哪些優化
- **2.3** 下一個要加哪一個

---
layout: textbook
chapter: Part 2 · Coverage
---

# 目前會評估的六個動作

| 瓶頸 | 優化動作 | suggest 給的設定 | 什麼時候評估 |
| --- | --- | --- | --- |
| 重複登記記憶體 | 保留暫存空間 | 兩個 MALLOC 門檻 | 同一塊記憶體登記兩次以上 |
| 搶 CPU | 移走同核心的其他工作 | 沒有，要自己找出那個工作 | 停頓或計算不平衡超過 1 ms |
| NUMA 錯置 | 綁回網卡那一側 | numactl 綁 CPU 與記憶體 | 命令列綁到網卡另一側，且指定了網卡 |
| 網路被佔用 | 移除競爭流量 | 沒有，要停掉外來流量 | 外來流量超過 1 Gb/s |
| rail 太少 | 多開 rail | UCX_MAX_RNDV_RAILS=N | 有大訊息，且還有閒置網卡 |
| rail 太多 | 降回 2 條 | UCX_MAX_RNDV_RAILS=2 | 有大訊息，且已多於 2 條 |

<!--
這六個動作，就是 ibtrace suggest 目前唯一會評估的清單。前四個瓶頸是資料集裡用一般使用者的權限製造的；重複登記是案例中找到的。模型只會在這張表裡挑，所以 suggest 沒提到的優化，不代表不值得做。
每一列的評估條件（模型 model-v2-frozen，取自 docs/cli/HOW_SUGGEST_WORKS.md 與 analysis/ibtrace/cli/suggest.py）：
保留暫存空間：在計時的呼叫中，同一個（位址, 長度）被 ibv_reg_mr 登記 2 次以上。設定是 MALLOC_TRIM_THRESHOLD_=1073741824 與 MALLOC_MMAP_THRESHOLD_=33554432。
搶 CPU：任一 rank 有停頓（呼叫之間的空檔比同一情境的中位數長 1 ms 以上），或計算不平衡（呼叫之外的時間比其他 rank 的中位數多 1 ms 以上）。suggest 沒有可設的變數，使用者要自己找出同一顆 CPU 上的其他工作。
NUMA 錯置：有 rank 的程式 CPU 或 --membind 在網卡之外的 NUMA node；或 CPU 放錯且有計算不平衡。設定例如 numactl --cpunodebind=<node> --membind=<node>。
網路被佔用：外來流量 =（這張網卡的 port counter 位元組數 − 程式自己送的位元組數）× 8 ÷ 時間，超過 1 Gb/s 才評估。沒有可設的變數。
多開 rail：有 64 KiB 以上的訊息，而且目前的 rail 數小於可用的網卡數。N = 可用網卡數，最多 8。
降回 2 條：有 64 KiB 以上的訊息，而且 rail 數多於 2。
沒有評估的動作，suggest 會在 not checked 那一行寫出原因，例如案例中的 ranks already on the HCA's node。
-->

---
layout: textbook
chapter: Part 2 · Coverage
---

# NUMA 錯置：只在一種寫法下偵測得到

| 情況 | 實測結果（job 601107、601315） |
| --- | --- |
| taskset／numactl 綁到另一側，並指定網卡 | 偵測得到，建議綁回網卡那一側 |
| 綁到另一側，沒有指定網卡 | UCX 改用程式那一側的網卡；印「HCA guessed」 |
| 完全沒有綁定 | 判斷不了；印「binding unknown」 |
| 只用 `--membind` 綁記憶體 | 偵測得到，但只算訊息的懲罰 |
| srun 的 `--cpu-bind` 綁到另一側 | 偵測得到 |
| 遮罩、env、巢狀、`--interleave` 等寫法 | 解析得到 |

::note::

<Note :notes="[
  ['位置是從命令列與綁定解析的，不是量測程式實際跑在哪裡。'],
]" />

---
layout: textbook
chapter: Part 2 · Coverage
---

# NUMA 錯置在 4 MiB allreduce 上只慢 0.2 %

| 放法 | 實測變慢 [95 % 區間] | 模型預測 |
| --- | ---: | ---: |
| 兩個 rank 的 CPU 都在另一側 | +0.23 ms [−0.14, +0.81] ms | +0.55 ms |
| CPU 與記憶體都在另一側 | +0.44 ms [+0.19, +1.18] ms | +0.55 ms |
| 只有一個 rank 在另一側 | +0.50 ms [+0.28, +1.15] ms | 沒有建議（算 0 ms） |

::note::

<Note :notes="[
  ['基準是放在網卡那一側：232.4 ms，每種放法各跑 10 次（job 601387）。', '只有一個 rank 放錯時，第二版預測為 0 ms。', '第三版已修正，見第 3 部分。'],
]" />

---
layout: textbook
chapter: Part 2 · Coverage
clicks: 2
---

# 每一層都有常見的優化

<AtLayers />

::note::

<Note :notes="[
  ['每一列是一層軟硬體。', '綠色是 ibtrace 會評估的動作。', '白色是常見、但還沒涵蓋的。', '灰色需要管理員權限。', '或是 tracer 還看不到。', '這個叢集上暫時做不到。', '剩下的集中在上面三層。', '粗框是最可能先加的三個。'],
]" />

<!--
這張圖整理的是一般常見的優化方法，不是完整清單，也還沒有在這個叢集上逐一量過。
六個動作分布在 UCX（多開、降回 rail）、系統（保留暫存空間、移走 CPU 上的其他工作、NUMA 綁定）與網路（移除競爭流量）三層。應用程式、MPI 與 GPU 三層目前完全沒有涵蓋。
各層的細節在後面兩頁：一般使用者能改的一頁，需要管理員或看不到的一頁。
-->

---
layout: textbook
chapter: Part 2 · Coverage
---

# 應用程式層：要改程式的優化

| 優化 | 怎麼做 | 模型需要從 trace 看出 |
| --- | --- | --- |
| 計算與通訊重疊 | 改用非阻塞的 MPI_Iallreduce | 等待通訊時，CPU 是否閒著 |
| 合併小訊息 | 一次送一大塊，減少呼叫次數 | 小訊息的數量與大小 |
| 重用通訊用的 buffer | 改用 MPI 4 的 persistent collective | 重複的 malloc 與登記 |

<!--
這一層的優化都要修改程式，ibtrace 只能指出值不值得改，不能代替使用者改。
計算與通訊重疊：MPI_Iallreduce 先送出、之後再 MPI_Wait，中間可以做不依賴結果的計算。收益的上限是等待時間與可重疊計算中較小的那一個。
合併小訊息：每一次呼叫都有固定的成本，很多小訊息合併成一則，固定成本只付一次。AI 訓練框架把梯度分組（bucket）後再 allreduce，就是這個做法。
重用 buffer：MPI 4.0 的 MPI_Allreduce_init 先建立一次，之後每次 MPI_Start 重用同一組資源。它和保留暫存空間解決的是同一類問題，只是改在程式裡。
最右欄是模型需要的資訊，還沒有逐一確認現有的 trace 是否都有。
-->

---
layout: textbook
chapter: Part 2 · Coverage
---

# MPI 與 UCX 層：改參數就能試的優化

| 層 | 優化 | 怎麼做 | 模型需要從 trace 看出 |
| --- | --- | --- | --- |
| MPI | collective 演算法 | 用 mca 參數選演算法 | 每則訊息的大小與對象 |
| MPI | rank 的擺放 | mpirun 的 --map-by | 每對 rank 之間的流量 |
| MPI | collective 元件 | 改用 UCC 或 HCOLL | 呼叫經過哪個元件 |
| UCX | 傳輸方式 | UCX_TLS 選 rc、dc 或 ud | 連線數與每則的延遲 |
| UCX | 協定門檻 | UCX_RNDV_THRESH | 訊息大小與交握的等待 |

<!--
這一頁的優化都不用改程式，也不需要特權，和現有的六個動作一樣，是一般使用者就能試的。
collective 演算法：allreduce 有 ring、recursive doubling、Rabenseifner 等做法，最好的選擇隨訊息大小與 rank 數改變。Open MPI 用 --mca coll_tuned_use_dynamic_rules 1 --mca coll_tuned_allreduce_algorithm <編號> 指定。案例用的是 ring。
rank 的擺放：mpirun 的 --map-by、--bind-to 或 rankfile 決定每個 rank 放在哪個節點與核心。常互傳的 rank 放在同一個節點，跨節點的流量就會變少。案例每個節點只有 1 個 rank，所以這一項沒有作用。
collective 元件：Open MPI 5 可以用 --mca coll_ucc_enable 1 改走 UCC；有安裝 HCOLL 時也可以用它。不同元件的演算法與實作不同。
傳輸方式：UCX_TLS 決定用哪些傳輸，例如 rc（每對 rank 一條連線）、dc（連線共用，rank 多時省記憶體）、ud（不保證送達）。
協定門檻：UCX 對小訊息用 eager（直接送），大訊息用 rendezvous（先交握再搬資料）。UCX_RNDV_THRESH 是切換的門檻，UCX_RNDV_SCHEME 選 rendezvous 的方式。門檻設得不好，中型訊息會多等一次交握。
最右欄是模型需要的資訊，還沒有確認現有的 trace 是否都有，例如送出的記錄裡是否有對象 rank。
-->

---
layout: textbook
chapter: Part 2 · Coverage
---

# 需要管理員、或目前看不到的優化

| 層 | 優化 | 為什麼現在做不到 |
| --- | --- | --- |
| 系統 | 大分頁（huge pages） | 預留大分頁需要管理員 |
| 系統 | CPU 頻率、中斷綁定 | 需要 root 權限 |
| 網路 | adaptive routing | 由管理員在交換器上設定 |
| 網路 | congestion control | 由管理員在交換器與網卡上設定 |
| 網路 | SHARP 網內運算 | 需要交換器支援並由管理員開啟 |
| GPU | GPUDirect RDMA、NCCL 參數 | tracer 還看不到 NCCL |

<!--
這些優化在其他叢集上常有很大的效果，但這個專題的前提是沒有特權，所以暫時排除。
大分頁：一頁 2 MiB 或 1 GiB，減少 page fault 與網卡的位址轉換。hugetlbfs 的大分頁要管理員預留；透明大分頁（THP）是否可用，取決於系統設定。
CPU 頻率與中斷綁定：改 governor 或 IRQ affinity 都需要 root。
adaptive routing：交換器依壅塞情況替封包選路。congestion control：網路壅塞時降低送出的速度。兩者都由管理員在 subnet manager、交換器與網卡上設定。
SHARP：在交換器裡直接做 allreduce 的加總，資料不必在節點之間來回。需要交換器支援；叢集已經開啟時，使用者可以透過 UCC、HCOLL 或 NCCL 的外掛使用。
GPU：NCCL 有自己的網路傳輸，不經過 UCX，目前的 tracer 攔截不到。NCCL 本身有 NCCL_ALGO、NCCL_PROTO、NCCL_IB_HCA 等參數可調。這是未來的工作。
-->

---
layout: rows
numbered: true
reveal: true
chapter: Part 2 · Coverage
clicks: 2
items:
  - title: 一般使用者能改
    text: ['不需要 root 或管理員。', '這個叢集沒有特權。']
  - title: trace 看得到徵兆
    text: ['模型只能從 trace 算收益。', '看不到的瓶頸，算不出收益。']
  - title: 能製造並實測
    text: ['要能製造出這個瓶頸。', '前後各跑 10 次，量出 ΔT。']
---

# 加入一個新動作的三個條件

::note::

<Note :notes="[
  ['現有的六個動作都符合。', '網路層的優化不符合。', 'GPU 的優化不符合。', 'tracer 看不到 NCCL。', '沒有實測的 ΔT，就無法評估。', '預測準不準，只能靠實際執行。'],
]" />

<!--
三個條件對應這份報告的方法：沒有特權（第 5 部分製造瓶頸的方式）、從 trace 預測（第 4 部分的模型）、用實際執行驗證（第 5 部分的資料集與第 6 部分的定版評估）。
每加一個動作，要做的事是：寫出一條從 trace 算 ΔT 的公式、用小型測試量公式裡的常數、製造這個瓶頸並實際執行，最後定版後再評估。
-->

---
layout: textbook
chapter: Part 2 · Coverage
---

# 在途請求數與切塊大小：預設值下沒有瓶頸

| 項目 | 實際用量 | 上限 |
| --- | ---: | ---: |
| 每條連線同時在途的 RDMA read | 最多 2 個 | 16 個（網卡上限） |
| 送出佇列 | 最多 2 個 | 256 個 |
| 「資源不足、稍後再送」的回傳 | 0 次 | — |

::note::

<Note :notes="[
  ['資料是 4 MiB allreduce 與 1 MiB alltoall，共 1,366,150 筆記錄。', '正常的執行離上限很遠，所以不會卡在這裡。', 'tracer 已補上兩項：記下排隊，記下 UCX 實際設定。'],
]" />

---
layout: textbook
chapter: Part 2 · Coverage
---

# 把設定調小時會變慢：三項加入，一項排除

| UCX 設定（預設 → 調小） | alltoall | allreduce | 判定 |
| --- | ---: | ---: | --- |
| 同時讀取的位元組：無上限 → 512 KiB | +90.8 ms | +29.6 ms | 加入 |
| 同時讀取的次數：硬體上限 → 1 次 | +45.6 ms | +9.5 ms | 加入 |
| 每次讀取的大小：自動 → 64 KiB | +13.8 ms | 區間含 0 ms | 加入 |
| 送出佇列：256 個 → 16 個 | 區間含 0 ms | 程式卡死 | 排除 |

::note::

<Note :notes="[
  ['每種設定跑 10 次，與預設值比較（job 603440）。', '新動作：發現這三項被調小時，建議改回預設。', '送出佇列調到 16 個會卡死，不能當建議。', 'alltoall 1 MiB 慢 4–27 %。', 'allreduce 是 4 MiB。'],
]" />

---
layout: rows
chapter: Part 2 · Coverage
reveal: true
clicks: 2
items:
  - label: MPI
    title: collective 演算法
    text: ['allreduce 有好幾種演算法。', '最好的選擇隨訊息大小改變。']
  - label: UCX
    title: 協定門檻
    text: ['大訊息要先交握，再搬資料。', '門檻不對，中型訊息會多等。']
  - label: MPI
    title: rank 的擺放
    text: ['常互傳的 rank 放在同一節點。', '跨節點的流量就會變少。']
---

# 最可能先加的三個動作

::note::

<Note :notes="[
  ['只要改 mca 參數。', '不必改程式。', '只要改 UCX 的環境變數。', '小型測試就能量常數。', '每節點多個 rank 時才有作用。', '案例每節點只有 1 個。'],
]" />

<!--
三個都符合前一頁的三個條件：一般使用者能改、不需要特權、可以製造並實測。是否符合「trace 看得到徵兆」還沒驗證，這是下一步要先檢查的事：現有的 trace 有沒有記下每則訊息的對象 rank、協定的切換與交握的時間。
collective 演算法：Open MPI 用 --mca coll_tuned_use_dynamic_rules 1 --mca coll_tuned_allreduce_algorithm <編號> 指定。模型要從訊息的大小與對象推出目前用的演算法，再預測換成另一種的收益。
協定門檻：UCX_RNDV_THRESH 與 UCX_RNDV_SCHEME。模型要知道每則訊息走 eager 還是 rendezvous，以及交握花了多久。
rank 的擺放：mpirun 的 --map-by、--bind-to 或 rankfile。模型要知道每對 rank 之間送了多少資料。
這些都還沒有實作，也沒有在這個叢集上量過。
-->
