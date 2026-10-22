# ibtrace 報告簡報

ibtrace 的兩份報告簡報，都採 Textbook 版型，放在同一個 Slidev 專案 [slides/](slides/) 裡，共用版型與元件。

| 簡報 | 入口檔 | 內容 | 線上版 |
| --- | --- | --- | --- |
| Tracer Overhead | `slides.md` | tracer 對量測的擾動、三項優化、量測方法與正確性檢查，共 26 張 | https://seanyeh77.github.io/ibtrace-overhead-slides/ |
| Counterfactual Attribution | `attribution.md` | 零基礎版：用重新登記記憶體的案例串起全場，依序是反直覺的現象、用 trace 找原因、研究問題、預測模型、驗證與使用方式；每一部分的開頭寫出它要回答的問題，最後整理 suggest 目前評估的六個動作與還沒涵蓋的優化；以實際的 bash 指令與 ibtrace 輸出舉例，共 75 張 | https://seanyeh77.github.io/ibtrace-overhead-slides/attribution/ |

Tracer Overhead 簡報中的 overhead 數字（0.7–4.5 µs、降至 18–43 %）含有 ring 的 page fault；預先配置 ring 之後的數字見 Counterfactual Attribution 第 36 張。

## 簡報

```bash
cd slides
npm install
npm run dev                      # 本機預覽 Tracer Overhead，按 p 開講者模式
npx slidev attribution.md        # 本機預覽 Counterfactual Attribution
npm run build                    # 輸出靜態網頁到 slides/dist
```

| 檔案 | 內容 |
| --- | --- |
| `slides.md` | 設定、封面與報告重點，依序引入 `pages/` |
| `pages/00-setup.md` | 背景名詞、ibtrace 架構圖、量測設計（C0 到 C3 四種條件） |
| `pages/01-findings.md` | 主要發現：transport 比較被放大、snprintf 與 CLOCK_MONOTONIC 定義、span 與三項優化的程式碼、成本來源、優化結果、關鍵路徑 |
| `pages/02-method.md` | 量測方法：四條原則、量測解析度 |
| `pages/03-correctness.md` | 正確性：MADV_WIPEONFORK、golden、manifest 定義，優化不改輸出 |
| `pages/04-summary.md` | 重點整理與下一步 |
| `attribution.md`、`attr/` | Counterfactual Attribution 的入口與各部分：反直覺的現象、用 trace 找原因、研究問題、預測模型、可信的資料、評估結果、使用方式、還沒涵蓋的優化、重點整理 |
| `components/` | 圖表元件 `GroupedBars`、`HBars`、`DotCI`、架構圖 `ArchDiagram`、定義頁圖 `Dg*`、程式碼對照 `ConfigDiff`，以及 `Note`、`Tile`；`At*` 是 Counterfactual Attribution 的圖 |
| `layouts/`、`styles/` | Textbook 版型與樣式 |

push 到 main 且 `slides/` 有變動時，GitHub Actions 會自動建置兩份簡報並部署到 GitHub Pages，第二份放在 `/attribution/`。
