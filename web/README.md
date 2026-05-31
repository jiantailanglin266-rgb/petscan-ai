# PETSCAN AI — Web (Next.js P0 実装)

ルートの自己完結HTMLプロトタイプ(`../index.html`)を **Next.js + TypeScript + Tailwind** に移植した本実装の土台(P0)。

## 起動
```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド検証
```

## 構成
```
web/
├ app/
│  ├ layout.tsx        # ルートレイアウト / metadata / viewport
│  ├ page.tsx          # 画面オーケストレーター(状態機械)
│  └ globals.css       # デザインシステム(トークン/各画面CSS)
├ components/
│  ├ Splash.tsx        # ジャケット画面
│  ├ Profile.tsx       # ペルソナ入力(種別/名前/誕生日/犬種猫種/体重・バリデーション)
│  ├ Home.tsx          # ホーム(SCAN NOW)
│  ├ ScanOverlay.tsx   # スキャン演出5段階(ビーム残像/解析HUD/結晶化)
│  ├ Result.tsx        # 結果(動的ゲージ/パーティクル/グレード配色/順次フェード)
│  ├ History.tsx       # 履歴トレンド(週/月/年・SVGチャート)
│  └ SoundToggle.tsx   # サウンド切替
└ lib/
   ├ scan.ts           # スコア/グレード/テーマのドメインロジック
   └ sound.ts          # Web Audio 効果音エンジン
```

## 設計メモ
- 画面遷移は `page.tsx` の `screen` 状態で `.screen.active` をトグル(プロトタイプと同等のフェード)。
- スキャン演出は `ScanOverlay` 内の `useEffect`(`runId` 依存)で命令的にタイムラインを駆動し、`onComplete(result)` で結果を返す。タイマー/RAF/Interval はクリーンアップで解除。
- スコアは毎回 `rollScores()` で生成し、`gradeOf()` でグレード→配色を決定(`lib/scan.ts`)。
- 効果音は `lib/sound.ts` のシングルトン。`AudioContext` はユーザー操作後に遅延生成(SSR安全)。

## 次の実装(P1〜)
- Supabase 接続(Auth / pets / scans / RLS)
- 画像アップロード(Storage)→ `docs/AI_ANALYSIS_PROMPT.md` の Vision 解析を `/api/scans` に実装
- Stripe 課金 / 無料枠カウンタ / SNSシェア画像生成
