# MOFURI. — AIペット健康診断(体験版)

> 写真1枚で、うちの子の健康年齢をAI診断。犬・猫対応、30秒で無料診断。
> 「診断サイト」ではなく「SNSでシェアしたくなる体験」。

愛犬・愛猫の健康状態を写真＋数問の情報からAIがスコア化する **MOFURI.**(旧 PETSCAN AI)の体験プロトタイプ(ダミーデータ)。オレンジ/ブラックの高級感あるブランド、5ステップ診断、健康年齢・称号・全国比較・SNSシェアまでを実装。

## 🔭 ライブプレビュー
GitHub Pages: **https://jiantailanglin266-rgb.github.io/petscan-ai/**

> 旧PETSCAN AI(シアンSFテーマ)のプロトタイプは [`prototype-petscan-cyan.html`](prototype-petscan-cyan.html) に保存。
> Next.js本実装(P0)は [`web/`](web/) を参照。

## 📱 含まれる体験(MOFURI.刷新版)
- **HERO** — MOFURI.ブランド ＋ コピー「写真1枚で、うちの子の健康年齢をAI診断」＋ 3特徴
- **5ステップ診断** — 種別 → サイズ/毛タイプ → 年齢 → 性別 → 写真アップロード(D&D対応)
- **AI解析演出** — オレンジ走査ビーム＋解析テキスト(顔の輪郭/目元/毛並み/健康年齢を算出中…)
- **結果** — 健康年齢・若見え−○歳・称号・全国比較(上位X%)・健康偏差値・5観点スコア・AIコメント
- **SNSシェア** — シェアカード＋Xでシェア/LINEで送る/画像を保存(Canvas生成)・OGP対応

---
## (旧)PETSCAN AI 体験メモ
- **HOME** — ペット写真 ＋ 巨大 `SCAN NOW` ボタン(発光パルス)
- **SCAN OVERLAY** — 5段階の演出タイムライン(約5秒)
  1. 吸い込み起動
  2. レーザー走査 `SCANNING…`(ビーム＋グリッド＋エッジトレース)
  3. 解析HUD `ANALYZING…`(回転リング＋計測ノード＋数値ルーレット)
  4. ホログラム結晶化 `SCAN COMPLETE`(スコア生成）
  5. 結果画面へシームレス着地
- **RESULT** — HEALTH SCORE(円形ゲージ＋カウントアップ)・健康年齢・項目スコア・獣医師監修コメント・ケア導線

## 🎨 デザイントークン
近未来メディカルスキャナー(SF)。ダーク背景 ＋ ネオン(cyan `#27E1FF` / green `#36F1B3` / violet `#7B6CFF`)。
詳細は仕様書(別途)を参照。

## ⚙️ ローカル起動
```bash
# 任意の静的サーバでOK
python -m http.server 8780
# → http://localhost:8780
```

## ⚠️ 注記
本デモは健康管理のための情報提供を想定したUIプロトタイプです。**獣医療・診断ではありません。**
スコア等はすべてダミー値です。

## 🛠 Stack(本実装予定)
Next.js / TypeScript / Tailwind / Supabase / Stripe / OpenAI Vision
※本プレビューは演出検証用の自己完結HTML(依存なし)。
