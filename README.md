# ibtrace · Tracer Overhead

ibtrace 量測成本的報告簡報：tracer 對量測的擾動、三項優化，以及過程中用到的量測方法與正確性檢查。

- [slides/](slides/)：Slidev 簡報，共 23 張，採 Textbook 版型。線上版：https://seanyeh77.github.io/ibtrace-overhead-slides/

## 簡報

```bash
cd slides
npm install
npm run dev      # 本機預覽，按 p 開講者模式
npm run build    # 輸出靜態網頁到 slides/dist
```

| 檔案 | 內容 |
| --- | --- |
| `slides.md` | 設定、封面與報告重點，依序引入 `pages/` |
| `pages/00-setup.md` | 背景名詞、ibtrace 架構圖、量測設計（C0 到 C3 四種條件） |
| `pages/01-findings.md` | 主要發現：transport 比較被放大、snprintf 與 CLOCK_MONOTONIC 定義、成本來源、優化結果、關鍵路徑 |
| `pages/02-method.md` | 量測方法：四條原則、量測解析度 |
| `pages/03-correctness.md` | 正確性：MADV_WIPEONFORK、golden、manifest 定義，優化不改輸出、誤判為通過的驗證 |
| `pages/04-summary.md` | 重點整理與下一步 |
| `components/` | 圖表元件 `GroupedBars`、`HBars`、`DotCI`、架構圖 `ArchDiagram`，以及 `Note`、`Tile` |
| `layouts/`、`styles/` | Textbook 版型與樣式 |

push 到 main 且 `slides/` 有變動時，GitHub Actions 會自動建置並部署到 GitHub Pages。
