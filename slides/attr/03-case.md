---
layout: section
number: 4
chapter: Part 4 · Case Study
---

# 案例：重新註冊記憶體

- **4.1** 記憶體註冊
- **4.2** 多開 rail 反而變慢
- **4.3** trace 找到的原因
- **4.4** 修正與結果

---
layout: definition
chapter: Part 4 · Case Study
term: registration
kind: RDMA 傳輸前的登記
size: 52px
clicks: 2
---

<AtReg />

網卡要直接讀寫一塊記憶體，必須先登記。

每一張用到的網卡，都要各登記一次。

<!--
RDMA 讓網卡不經過 CPU 直接搬資料，所以網卡必須知道哪些記憶體可以碰。這個登記稱為記憶體註冊（memory registration）。
登記很貴：1 MiB 約 22 µs，取消登記約 10 µs，而且每張網卡要各登記一次。
UCX 會記住登記過的記憶體，下次直接重用；前提是那塊記憶體一直留在程式裡，沒有還給作業系統。
-->

---
layout: textbook
chapter: Part 4 · Case Study
ltag: Terminal
clicks: 1
---

# 預設設定只使用 8 條 rail 中的 2 條

```bash {1-2|3}
$ ucx_info -c | grep MAX_RNDV_RAILS
UCX_MAX_RNDV_RAILS=2
$ UCX_MAX_RNDV_RAILS=8 srun ... osu_allreduce
```

::note::

<Note :notes="[
  ['ucx_info -c 列出 UCX 參數的目前值。', '大訊息最多只用 2 條 rail。', 'counter 也顯示只有 2 張網卡有流量。'],
  ['只看使用率，結論很自然。', '6 條 rail 閒著，就改成 8 條。'],
]" />

<!--
counter 的觀察來自一對一傳輸：8 張網卡只有 2 張有流量。
srun 是 Slurm 在分配到的節點上啟動程式的指令；osu_allreduce 是量測 allreduce 速度的標準測試程式。
這一頁刻意先站在「只看使用率」的角度：這是傳統監控工具會給的建議，也是一般人會做的事。
-->

---
layout: textbook
chapter: Part 4 · Case Study
clicks: 1
---

# 多開 rail 在一對一傳輸變快，在 allreduce 卻變慢

<GroupedBars
  :cats="[['ucx_ib_test', 'one to one, 4 MiB'], ['osu_allreduce', '4 ranks, 4 MiB']]"
  :series="[
    { name: '2 rails, default', fill: '#e7e7e7', values: [100, 100] },
    { name: '8 rails', fill: '#6eea9e', values: [59.6, 138.2] },
  ]"
  :max="150" :step="25" unit="Time relative to 2 rails, %" :digits="1" :width="1300" :height="660" :bar-w="170"
  reveal
/>

::note::

<Note :notes="[
  ['以預設的 2 條 rail 為 100 %。', '比較改用 8 條之後的時間。'],
  ['一對一傳輸：100 % → 59.6 %，快 40 %。', 'allreduce：100 % → 138.2 %，慢 38 %。'],
]" />

<!--
一對一傳輸：4 MiB 從 62.9 ms 降到 37.5 ms，單向頻寬從 67 GB/s 升到 110 GB/s。
allreduce 變慢的結果和我們事先寫下的預期相反。依照規則，預期沒有修改，結果照實記為預測錯誤，再去找原因。
-->

---
layout: textbook
chapter: Part 4 · Case Study
clicks: 3
---

# Trace 顯示每次呼叫都在重新註冊同一塊記憶體

<AtChurn />

::note::

<Note :notes="[
  ['每次呼叫都用 malloc 要兩塊 1 MiB。', 'UCX 在每張網卡上登記它們。'],
  ['接著執行 allreduce 本身。', '真正傳資料的時間只占約 10 %。'],
  ['呼叫結束時 free 掉暫存空間。', 'glibc 把它還給作業系統。'],
  ['UCX 只好作廢這塊記憶體的登記。', '下一次呼叫又得重新登記。', '登記占總時間的 37.7 %。'],
]" />

<!--
malloc 拿到的兩塊 1 MiB 是 Open MPI 的 allreduce 用的暫存空間。glibc 是 Linux 的記憶體管理函式庫。
UCX 發現記憶體被還回去，為了安全只好作廢登記；下一次呼叫拿到同一個位址也得重新登記。
這個循環是從 trace 看出來的：同樣的兩個位址，每次呼叫都被登記、取消、再登記，各約 880 次。
為了確認先後順序，另外用 gdb 在記憶體被還回去與取消登記的地方設中斷點，順序與圖中一致。
用比喻來說：每次出貨都把箱子丟掉、隔天買一個新的，報關單就得重填；碼頭越多，要填的報關單越多。
-->

---
layout: textbook
chapter: Part 4 · Case Study
ltag: Terminal
clicks: 2
---

# 從 trace 數出登記次數

```bash {1-3|4-5|6-10}
# rank 0 的 trace 中，登記記憶體的呼叫有幾次
$ grep -c ibv_reg_mr rails2/rank0.csv
1846
$ grep -c ibv_reg_mr rails8/rank0.csv
7126
# 被登記的位址：同樣兩個位址反覆出現
$ grep ibv_reg_mr rails2/rank0.csv \
    | cut -d, -f6 | sort | uniq -c
    878 0x7f2c4a200000
    878 0x7f2c4a400000
```

::note::

<Note :notes="[
  ['trace 是 CSV 檔，用 grep 就能數。', '2 條 rail 時，登記了 1,846 次。'],
  ['改成 8 條 rail，變成 7,126 次。', '約 4 倍，正好對應網卡數 2 → 8。'],
  ['被登記的位址只有兩個。', '兩個各出現 878 次。', '每次呼叫都在重新登記它們。'],
]" />

<!--
trace 的每一行是一次呼叫；這裡數的是 rank 0 一次執行。
次數是實際量到的值；檔名、欄位編號與位址是示意，實際以 trace 的格式為準。
grep -c ibv_reg_mr 也會算到 ibv_reg_mr_iova2，這正是 UCX 實際呼叫的版本。
counter 看不到這件事：網卡只記錄送了多少位元組，不記錄登記了幾次記憶體。
-->

---
layout: textbook
chapter: Part 4 · Case Study
---

# 登記次數與使用的網卡數成正比

<HBars
  :panels="[{ title: 'Registrations in one run', max: 8000, items: [
    { label: '1 HCA', v: 913 },
    { label: '2 HCAs', v: 1846 },
    { label: '4 HCAs', v: 3606 },
    { label: '8 HCAs', v: 7126, hot: true },
  ] }]"
  unit="calls" :panel-w="1300" :label-w="220" :row-h="100"
/>

<!--
只改 UCX 使用的網卡數，其他條件都相同。網卡數加倍，登記次數也幾乎加倍，因為每張網卡都要各自登記。
從 2 條到 8 條 rail，rank 0 的登記時間多了 226 ms；不開 tracer 量到的總時間多了 212 ms，兩者對得上。
所以多開 rail 變慢，不是因為傳輸變差，而是要重複登記的網卡變多了。傳輸本來只占約 10 %，省下的時間遠小於多出的登記。
-->

---
layout: textbook
chapter: Part 4 · Case Study
ltag: Terminal
clicks: 3
---

# 修正：讓暫存空間留在程式裡

```bash {all|2|3|2-3}
# keep freed scratch buffers inside the process
export MALLOC_MMAP_THRESHOLD_=33554432    # 32 MiB
export MALLOC_TRIM_THRESHOLD_=1073741824  # 1 GiB
srun ... osu_allreduce -m 4194304:4194304
```

::note::

<Note :notes="[
  ['修正只需要兩個 glibc 環境變數。', '不必修改或重新編譯程式。'],
  ['mmap 門檻：超過的記憶體單獨向系統要。', '提高到 32 MiB 後，改從記憶體池配置。'],
  ['trim 門檻：記憶體池空出夠多才歸還。', '提高到 1 GiB 後，空間留在程式裡。', 'UCX 的登記就一直有效。'],
  ['兩個必須一起設。', '只設一個，另一個會回到預設值。', '實驗也證實只設一個不夠。'],
]" />

<!--
記憶體池指的是 heap，也就是程式自己管理的記憶體。trim 門檻是 heap 頂端空出超過這個值，才還給系統。mmap 門檻以上的記憶體單獨向系統要、free 時直接歸還。
只設其中一個時，glibc 會停止自動調整，另一個回到 128 KiB 的預設值，記憶體仍會被還回去。
glibc 預設會自動調整這兩個門檻：前幾次 1 MiB 用單獨配置的方式、釋放時直接歸還；之後門檻自動提高，改從 heap 配置，但 heap 頂端空出 2 MiB 時又被修剪還給系統。所以無論哪一種，登記都會失效。
只設 mmap 門檻時，各 rank 的 heap 配置不同，有的 rank 每次重新登記 0 塊、有的 1 塊或 2 塊，總時間由最慢的 rank 決定，結果呈現兩群。
-->

---
layout: compare
chapter: Part 4 · Case Study
left: 預設的 malloc
right: 保留暫存空間
reveal: true
clicks: 4
rows:
  - ['總時間', '535 ms', '307 ms，快 43 %']
  - ['每次的登記', '2.07 次', '0.08 次']
  - ['登記占比', '37.7 %', '3.9 %']
  - ['多開 rail', '慢 38.2 %', '−0.1 %，沒有差別']
---

# 保留暫存空間後，allreduce 快 43 %

<!--
這是 4 個節點、每節點 1 個 rank 的 4 MiB allreduce，每格不開 tracer 執行 10 次。
最後一列證明了因果：保留暫存空間後，8 條 rail 和 2 條 rail 已經沒有差別，所以先前的變慢完全來自重新登記。也因為傳輸只占約 10 %，多開 rail 並沒有好處。
-->

---
layout: compare
chapter: Part 4 · Case Study
left: 看使用率（counter）
right: 看 trace
reveal: true
clicks: 3
rows:
  - ['看到', '8 條 rail 只用了 2 條', '每次呼叫都重新登記同一塊記憶體']
  - ['建議', '改用 8 條 rail', '讓暫存空間不還給系統']
  - ['結果', '慢 38 %', '快 43 %']
---

# 看使用率與看 trace 得到相反的建議

<!--
這個案例說明了三件事。
第一，閒置的資源看起來像浪費，但時間其實花在別處。
第二，優化動作可能有害，所以工具必須預測收益的正負，而不只是指出異常。
第三，counter 只記錄位元組數，看不到登記了幾次記憶體；只有攔截每一次呼叫的 trace 看得到。
誠實補充：「記憶體還給系統會讓登記失效」這個機制早在 2006 年就有人討論。我們的新發現是它在現在的預設組合下仍然存在，而且多開 rail 會把它放大。這個瓶頸不是我們製造的，任何人在類似環境跑 4 MiB allreduce 都可能遇到。
-->
