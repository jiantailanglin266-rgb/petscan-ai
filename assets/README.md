# assets/ — ヒーロー画像

`index.html` のヒーローは画像1枚を主役にします。現在は横長1枚を全デバイスで使用中。

## 配置済み（横長・全デバイス共通）
| ファイル | 用途 | サイズ | 形式 |
|---|---|---|---|
| `mofuri-hero.webp` | 全デバイス（優先） | 1682×935（≒16:9） | WebP |
| `mofuri-hero.png` | WebP非対応フォールバック / og:image | 1682×935 | PNG |

## （任意）スマホ縦長版で「犬猫を大きく」見せたい場合
横長デザインは左右にテキスト/解析パネルがあり、縦長クロップだと見切れます。
スマホで動物を大きく見せたい場合は **縦長専用に再構成した** 画像を別途用意し、
`<picture>` にモバイル `<source>` を再追加してください（コードは下記）。
- `mofuri-hero-mobile.webp` / `.png` … 1080×1440（3:4 縦長）
```html
<picture class="hero-img">
  <source media="(max-width:768px)" srcset="assets/mofuri-hero-mobile.webp" type="image/webp">
  <source media="(max-width:768px)" srcset="assets/mofuri-hero-mobile.png">
  <source srcset="assets/mofuri-hero.webp" type="image/webp">
  <img src="assets/mofuri-hero.png" ...>
</picture>
```
あわせて CSS に `@media(max-width:768px){.hero-img{aspect-ratio:1080/1440}}` を戻します。

## 注意
- 画像内に「写真1枚で、うちの子の健康年齢をAI診断」等の文言を入れる前提。
  SEO/アクセシビリティ用に視覚的非表示の `<h1 class="sr-only">` を残しています。
- `aspect-ratio` をPC(1682/935)・スマホ(1080/1440)で指定済み（CLS防止）。サイズは比率を合わせてください。
- `og:image` / `twitter:image` は `mofuri-hero.png` を参照します（差し替え時は `<head>` のURLも確認）。
- WebPは80–85品質目安で200KB前後に収めるとLCPが安定します。
