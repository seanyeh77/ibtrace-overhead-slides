---
layout: section
number: 5
chapter: Part 5 · 討論
question: 結果代表什麼、下一步怎麼走？
---

# 判讀與討論

- **5.1** 初步判讀
- **5.2** 待討論的問題
- **5.3** 花費與下一步

---
layout: rows
chapter: Part 5 · 討論 · 5.1 初步判讀
numbered: true
items:
  - title: 不綁核的代價是真的
    text: 兩組機器都重現 10–47 % 的收益。
  - title: 一行參數就能拿到
    text: 分散綁核比照 trace 綁得更好。
  - title: 問題在記憶體
    text: 擠才有影響，網卡位置沒有。
  - title: 工具價值在避錯
    text: 擠到網卡旁與天真綁核都有害。
---

# 初步判讀

::note::
對應原本決策樹中「收益全被固定規則拿到」的情況。

第 3 項的機制是推論：記憶體頻寬與遠端存取。

這是初步判讀，尚未定案。

---
layout: rows
chapter: Part 5 · 討論 · 5.2 待討論的問題
numbered: true
items:
  - title: 下一個實驗的基準
    text: 要不要先綁核，再看網路層的設定？
  - title: 跨 NUMA 偵測器
    text: 要拿掉，還是改成建議分散？
  - title: 收益估計
    text: 改用記憶體位置的指標，或暫時不做？
---

# 待討論的問題

::note::
不綁核造成 10–47 % 的差異，CV 最高 17.5 %。

網路層的效果可能只有幾 %，會被蓋過，這是推論。

---
layout: textbook
chapter: Part 5 · 討論 · 5.3 花費與下一步
---

# 兩段實驗的花費

| 階段 | 核准 (核心小時) | 已花 (核心小時) |
| --- | ---: | ---: |
| 第一段 | 沒有事先核准 | 513.5 |
| 第二段 | 855 | 787.4 |

::note::
每核心小時約 0.1–0.2 元，是推論的單價。

第一段含三次煙霧測試與兩次作廢的開頭。

---
layout: rows
chapter: Part 5 · 討論 · 5.3 花費與下一步
numbered: true
items:
  - title: 決定基準
    text: 依討論結果，定下一個實驗的比較方式。
  - title: 網路型程式
    text: NPB 的 FT、IS、CG 已經編好，成本最低。
  - title: 真實應用
    text: HPCG 與 LAMMPS，找 ibtrace 獨有的機制。
---

# 接下來

::note::
送 job 之前，先給花費估計。

目標是找到簡單規則解決不了的問題。

---
layout: end
chapter: Summary
next: 在網路型程式與真實應用上，找簡單規則解決不了的問題
---

# Q&A

- `NUMA`
- `map_ldom`
- `schedstat`
