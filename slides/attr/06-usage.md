---
layout: section
number: 6
chapter: Part 6 · Usage
question: 怎麼用在自己的程式上？
---

# 使用方式

- **6.1** 四個指令
- **6.2** 不同情況的判讀
- **6.3** 使用時的注意事項

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

::note::

<Note :notes="[
  ['每一步都在案例中走過。', '案例：4 個 rank，遺失 0 筆。'],
  ['案例：rank 0 登記 201 ms。', '比等待通訊的 134 ms 還多。'],
  ['案例：保留暫存空間排第一。', '--baselines 會並列傳統做法。'],
  ['案例：實測快 245 ms。', '模型預測 210 ms。'],
]" />

<!--
四個步驟各對應一個 ibtrace 指令。前三步只需要跑一次被測程式；第四步是改設定後再跑幾次，用實測確認建議是對的。
這套指令已併入 ibtrace 的 main（commit 29b6fe3）。分析用的是凍結的模型 v2，程式碼一行都沒改，啟動時會檢查模型檔案的雜湊。
目前能分析的程式是 OSU micro-benchmarks、ucx_ib_test 與 miniFE；其他程式照樣能錄，但分析會說不支援。
每一步都在前面走過：record 與 breakdown 在第 2 部分找原因時，compare 在修正那一頁，suggest 在第 4 部分。
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
下一部分整理 suggest 目前會評估的六個動作，以及還沒涵蓋的優化。
-->
