---
layout: section
number: 3
chapter: Part 3 · Correctness
---

# 正確性

- **3.1** 優化必須保持輸出不變
- **3.2** 三次誤判為通過的驗證

---
layout: cols
chapter: Part 3 · Correctness
reveal: true
clicks: 4
cards:
  - label: 名稱複製
    title: 位元組完全相同
    text: snprintf 只寫入名稱與一個 NUL，其後保留舊位元組；新寫法輸出相同內容，比對 285 個緩衝區差異為 0。
  - label: pid 快取
    title: fork 後仍正確
    text: pid 存放在以 madvise 標記 <code>MADV_WIPEONFORK</code> 的記憶體頁；fork 後子行程拿到的這一頁會被 kernel 清零，讀到 0 時便重新取得。
  - label: TSC 時鐘
    title: 時間語意不變
    text: 換算結果仍是 CLOCK_MONOTONIC（Linux 不會倒退的系統時鐘）的 ns；每 1 ms 重新錨定並重算斜率，60 s 測試中偏差最多 84 ns。
  - label: 測試
    title: 以注入錯誤驗證
    text: pid／tid、時鐘、符號解析三項測試，都曾故意注入錯誤，確認測試在出錯時確實會失敗。
---

# 優化必須保持輸出不變

<!--
三項優化有一個共同要求：記錄的格式與語意一個位元組都不能改變，因此 ibmon、分析工具與 golden 檔都不需要修改。
TSC：chrony 讓 CLOCK_MONOTONIC 比原始 TSC 快 13.6 ppm，而且這個值會變動，開機時量一次斜率無法跟上。錨點對被中斷時偏差可達 6.5 µs，加上「兩次 TSC 讀取相隔超過 256 tick 就重讀」之後，才壓到 100 ns 以內。
pid 快取選用 MADV_WIPEONFORK 而不是 pthread_atfork，是因為它也涵蓋繞過 atfork handler 的 fork 方式。
-->

---
layout: textbook
chapter: Part 3 · Correctness
clicks: 3
---

# 三次誤判為通過的驗證

<table>
  <thead><tr><th>驗證</th><th>問題</th><th>處理</th></tr></thead>
  <tbody>
    <tr v-click="1"><td>golden 比對</td><td>比對結果隨 build 目錄是否存在而改變</td><td>符號解析改為比對 build-id</td></tr>
    <tr v-click="2"><td>overhead 分析</td><td>不論指向哪個目錄，讀取的都是原始資料</td><td>改為在 manifest 所在目錄尋找檔案</td></tr>
    <tr v-click="3"><td>呼叫位置</td><td>對應到重新建置後的 binary，靜默給出錯誤結果</td><td>build-id 不符時不解析，並標示原因</td></tr>
  </tbody>
</table>

::note::

<Note :notes="[
  'golden 是以固定資料產生的參考輸出，程式修改後要逐位元組相符；build-id 是編譯器寫入每個執行檔的唯一識別碼。驗證顯示通過，不代表真的比對到應該比對的內容。',
  'golden 錄製時某個 build 目錄尚未存在，該目錄出現後，比對結果隨之改變。',
  '分析程式一律讀取原始目錄；若沒有發現，以轉換後資料重跑的驗證將毫無意義。',
  '叢集資料中，測試程式的呼叫位置其實從未成功解析，而且沒有任何提示。',
]" />

<!--
三件事的共同點：檢查顯示通過，但實際上沒有比對到應該比對的內容。
處理方式也一致：讓失敗成為明確的錯誤或標示，而不是靜默地給出看似正常的結果。
-->
