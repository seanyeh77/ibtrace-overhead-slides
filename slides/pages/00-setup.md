---
layout: steps
chapter: Overview · 量測設計
clicks: 3
steps:
  - title: 純測試程式
    code: C0
    text: 基準。只跑 ucx_ib_test，量 ping-pong 的 steady RTT。
  - title: 加上 ibmon
    code: C1
    text: 只取樣網卡計數器，不載入 tracer。C1 − C0 是取樣的成本。
  - title: 只攔截
    code: C2
    text: 載入 tracer，照常攔截但不寫記錄。C2 − C1 是攔截加上讀時鐘。
  - title: 完整 tracer
    code: C3
    text: 攔截並寫入 ring。C3 − C2 是寫記錄的成本，C3 − C0 是總成本。
---

# 四種條件，兩兩相減拆出成本

<!--
每一格是「條件 × transport × 訊息大小」，transport 有 rc_verbs、rc_mlx5，大小有 8 B、64 KiB、1 MiB。
每格 10 次執行，每次 1,000 次迭代，所有格子在同一個 job 內以固定 seed 隨機交錯執行。
統計單位是「一次執行」：先取每次執行 999 個 RTT 的中位數，再取 10 次的中位數；信賴區間以執行為單位做 bootstrap。
另外還有 C4（關掉 UCT 系列 layer），這次報告不展開。
-->
