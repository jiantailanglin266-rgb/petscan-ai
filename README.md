# PETSCAN AI — Scan Demo (Preview)

> スマホで撮るだけ。AIが犬猫をスキャンし、健康状態を可視化する。
> 体験は「病院」ではなく「SF映画」。

犬猫向け次世代AIヘルスケアサービス **PETSCAN AI** の、スキャン演出プロトタイプ(ダミーデータ)です。

## 🔭 ライブプレビュー
GitHub Pages: **https://jiantailanglin266-rgb.github.io/petscan-ai/**

## 📱 含まれる体験
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
