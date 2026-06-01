# assets/ — ヒーロー画像

`index.html` のヒーローは画像1枚を主役に、PC横長 / スマホ縦長を `<picture>` で出し分けます（配置済み）。

| ファイル | 用途 | サイズ | 形式 |
|---|---|---|---|
| `mofuri-hero.webp` | PC・タブレット（≥769px・優先） | 1682×935（≒16:9 横長） | WebP |
| `mofuri-hero.png` | PC WebP非対応フォールバック / og:image | 1682×935 | PNG |
| `mofuri-hero-mobile.webp` | スマホ（≤768px・優先） | 1080×1440（3:4 縦長） | WebP |
| `mofuri-hero-mobile.png` | スマホ WebP非対応フォールバック | 1080×1440 | PNG |

差し替え時は同サイズ（比率）で。`aspect-ratio` はPC=1682/935・スマホ=1080/1440 で指定済み（CLS防止）。

## 注意
- 画像内に「写真1枚で、うちの子の健康年齢をAI診断」等の文言を入れる前提。
  SEO/アクセシビリティ用に視覚的非表示の `<h1 class="sr-only">` を残しています。
- `aspect-ratio` をPC(1682/935)・スマホ(1080/1440)で指定済み（CLS防止）。サイズは比率を合わせてください。
- `og:image` / `twitter:image` は `mofuri-hero.png` を参照します（差し替え時は `<head>` のURLも確認）。
- WebPは80–85品質目安で200KB前後に収めるとLCPが安定します。
