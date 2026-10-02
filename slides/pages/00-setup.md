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
