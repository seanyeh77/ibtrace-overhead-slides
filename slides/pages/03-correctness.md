---
layout: section
number: 3
chapter: Part 3 · Correctness
---

# 正確性

- **3.1** 優化必須保持輸出不變
- **3.2** 回歸測試與量測紀錄

---
layout: definition
chapter: Part 3 · Correctness
term: MADV_WIPEONFORK
kind: madvise 旗標（Linux 4.14 起）
size: 50px
clicks: 2
---

<DgWipe />

fork 時，kernel 把這一頁清零。

子行程讀到 0，就重新取得 pid。

<!--
問題的根源：fork 出的子行程會複製父行程的記憶體，包括 thread-local 的快取，所以子行程會拿到父行程的 pid。
pthread_atfork 是在 fork 時呼叫的 handler，但 _Fork()、直接 clone()，或刻意跳過 handler 的函式庫都會繞過它。
MADV_WIPEONFORK 由 kernel 在 fork 時處理，不依賴使用者程式的配合。
tid 也一樣：每條執行緒記下取得 tid 時的 pid，pid 一變就重讀 tid。
madvise 是讓程式告訴 kernel 某段記憶體如何處理的系統呼叫，MADV_WIPEONFORK 從 Linux 4.14 起提供。
一般記憶體在 fork 時被複製，子行程會沿用父行程快取的 pid，這就是 stale。pthread_atfork 可能被 _Fork 或直接 clone 繞過，MADV_WIPEONFORK 由 kernel 處理，不會被繞過。
madvise 失敗時退回每筆記錄都呼叫 getpid，較慢但不會錯。
-->

---
layout: rows
chapter: Part 3 · Correctness
reveal: true
clicks: 3
items:
  - label: 名稱複製
    title: 位元組完全相同
    text: ['新寫法輸出的位元組與 snprintf 相同。', '比對 285 個緩衝區，差異為 0。']
  - label: pid 快取
    title: fork 後仍正確
    text: ['pid 快取放在 fork 時會清零的頁。', '子行程讀到 0，就重新取得 pid。']
  - label: TSC 時鐘
    title: 時間語意不變
    text: ['換算結果仍是 CLOCK_MONOTONIC 的 ns。', '60 s 測試中，偏差最多 84 ns。']
  - label: 測試
    title: 以注入錯誤驗證
    text: ['三項測試都曾故意注入錯誤。', '確認出錯時，測試確實會失敗。']
---

# 優化必須保持輸出不變

<!--
名稱複製：snprintf 只寫入名稱與一個 NUL，其後保留舊位元組，新寫法也一樣。pid 快取所在的頁標記了 MADV_WIPEONFORK。TSC 每 1 ms 重新錨定並重算斜率。三項測試是 pid／tid、時鐘與符號解析。
三項優化有一個共同要求：記錄的格式與語意一個位元組都不能改變，因此 ibmon、分析工具與 golden 檔都不需要修改。
TSC：chrony 讓 CLOCK_MONOTONIC 比原始 TSC 快 13.6 ppm，而且這個值會變動，開機時量一次斜率無法跟上。錨點對被中斷時偏差可達 6.5 µs，加上「兩次 TSC 讀取相隔超過 256 tick 就重讀」之後，才壓到 100 ns 以內。
pid 快取選用 MADV_WIPEONFORK 而不是 pthread_atfork，是因為它也涵蓋繞過 atfork handler 的 fork 方式。
-->

---
layout: definition
chapter: Part 3 · Correctness
term: golden
kind: 回歸測試方法
clicks: 1
---

<DgGolden />

只有確認是刻意的差異，才更新 golden。

<!--
golden 也叫 golden file 或 golden master。它的好處是能看到 diff：數字變了還是只有標籤變了，一眼就能分辨。
限制是只保護分析工具；tracer 與 ibmon 每次執行的時間都不同，輸出無法逐位元組比對，要靠其他測試。
golden 是以固定輸入產生、確認無誤後存下的參考輸出。ibtrace 以兩次量測的資料為兩個分析工具產生 12 個 golden 檔。
golden_check.sh 全部相符時結束碼為 0，有差異為 1，找不到輸入為 2，避免根本沒比對到卻顯示通過。
-->

---
layout: definition
chapter: Part 3 · Correctness
term: manifest
kind: 量測紀錄檔
clicks: 2
---

<DgManifest />

分析程式依 manifest 找資料。

失敗的執行也從這裡查。

<!--
manifest 是這批量測的目錄：一行對應一次執行。
圖中的 baseline、hooks、full 分別是不開 tracer、只攔截、完整 tracer；no UCT 是關閉 UCT layer 的條件。
manifest.csv 每次執行寫一行：順序、條件、transport、訊息大小、重複序號、起訖時間、結束碼、輸出檔路徑。
例如第 228 次執行的 srun 連不上 Slurm 控制器，被測程式沒有啟動，所以「關閉 UCT layer」條件、rc_mlx5、8 B 那一格只剩 9 次可分析。
-->
