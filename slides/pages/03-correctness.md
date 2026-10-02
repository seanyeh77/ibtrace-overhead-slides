---
layout: section
number: 3
chapter: Part 3 · Correctness
---

# 正確性

- **3.1** 優化不能改變輸出
- **3.2** 差點假通過的驗證

---
layout: cols
chapter: Part 3 · Correctness
reveal: true
clicks: 4
cards:
  - label: 名稱複製
    title: 位元組完全相同
    text: snprintf 只寫名稱加一個 NUL，之後保留舊位元組。新寫法寫出一樣的內容，285 個緩衝區比對差異 0。
  - label: pid 快取
    title: fork 後仍正確
    text: pid 放在標了 <code>MADV_WIPEONFORK</code> 的頁，子行程拿到的是歸零的頁，讀到 0 就重新取得。
  - label: TSC 時鐘
    title: 語意不變
    text: 仍是 CLOCK_MONOTONIC 的 ns。每 1 ms 重新錨定並重量斜率，60 s 測試偏差最多 84 ns。
  - label: 測試
    title: 故意弄壞過
    text: pid／tid、時鐘、符號解析三個測試，都故意製造錯誤一次，確認測試真的會失敗。
---

# 優化不能改變輸出

<!--
三項優化都有一個共同要求：記錄的格式和語意一個位元組都不能變，所以 ibmon、分析工具和 golden 都不用改。
TSC：chrony 讓 CLOCK_MONOTONIC 比原始 TSC 快 13.6 ppm，而且會變，開機量一次斜率跟不上。錨點對被打斷時偏差可達 6.5 µs，加上「兩次 TSC 讀取相隔超過 256 tick 就重讀」後才壓到 100 ns 以內。
pid 快取選 MADV_WIPEONFORK 而不是 pthread_atfork，是因為它也涵蓋繞過 atfork handler 的 fork 方式。
-->

---
layout: textbook
chapter: Part 3 · Correctness
clicks: 3
---

# 差點假通過的三次驗證

<table>
  <thead><tr><th>驗證</th><th>問題</th><th>處理</th></tr></thead>
  <tbody>
    <tr v-click="1"><td>golden 比對</td><td>結果隨 build 目錄是否存在而改變</td><td>符號解析改比對 build-id</td></tr>
    <tr v-click="2"><td>overhead 分析</td><td>不論指向哪個目錄，讀的都是原始資料</td><td>改在 manifest 所在目錄找檔案</td></tr>
    <tr v-click="3"><td>呼叫位置</td><td>對到重新建置後的 binary，靜默給錯</td><td>build-id 不符就不解析並標示原因</td></tr>
  </tbody>
</table>

::note::

<Note :notes="[
  '驗證本身也可能是假通過。',
  'golden 錄製時某個 build 目錄還不存在，之後建出來，結果就變了。',
  '這次如果沒抓到，換資料重跑的驗證就毫無意義。',
  '叢集資料中，測試程式的呼叫位置其實從來沒有解析成功過，而且沒有任何提示。',
]" />

<!--
三件事的共通點：檢查顯示「通過」，但實際上沒有比到該比的東西。
處理方式也一樣：讓失敗變成明確的錯誤或標示，而不是靜默給出看似正常的結果。
-->
