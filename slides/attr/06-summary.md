---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="主要發現" value="看使用率會給出有害的建議">counter 的建議：慢 38 %。<br>trace 的建議：快 45 %。</Tile>
<Tile label="Tracer overhead" value="0.84–2.91 µs">每次操作多花的時間。<br>約為上次報告的一半。</Tile>
<Tile label="資料集" value="2,200 次執行">每一筆的 ΔT 都來自實際執行。</Tile>
<Tile variant="accent" label="選對優化動作" value="93 %">在沒看過的程式上。<br>傳統做法都是 53 %。</Tile>
<Tile label="開 tracer 與結論" value="ΔT 比值 1.02">開不開 tracer，ΔT 幾乎相同。<br>NUMA 錯置是例外。</Tile>
<Tile label="限制" value="收益大小仍不夠準" wide>誤差與 counter 做法相當。<br>下一版改用就地校準。</Tile>

<!--
一句話總結：要知道修哪裡、能快多少，必須看 trace 並考慮關鍵路徑；只看使用率，可能會做出讓程式更慢的決定。
-->

---
layout: end
chapter: Summary
next: 回報上游、公開資料集、做成一個指令的工具
---

# Q&A

- `ΔT`
- `critical path`
- `registration`
- `page fault`
- `MAP_POPULATE`

<!--
下一步依時間由短到長：
1. 把重新登記的問題連同最小重現程式回報給 Open MPI 與 UCX；上游修正後，所有使用者都會自動受惠。
2. 寫成論文並公開資料集，讓其他人可以用它評估自己的診斷方法，包括 LLM。
3. 做成一個指令就能執行的工具：自動試跑候選的優化動作，回報實測的加速比。
4. 長期延伸到 GPU 與 NCCL，也就是 AI 訓練叢集。
-->
