# PETSCAN AI — AI解析プロンプト設計書 v1.0

写真1枚から犬猫の健康指標を**推定**し、安全・一貫・構造化された結果を返すための設計。
OpenAI Vision(`gpt-4o` / `gpt-4o-mini` 等のマルチモーダル)＋ Structured Outputs(JSON Schema) を前提とする。

> ⚠️ 大原則:本機能は **医学的診断ではなく「写真から観察される一般的特徴の推定」**。断定・病名・治療指示を一切出力しない。不確実なら正直に低 confidence を返す(ハルシネーション抑制)。

---

## 1. 設計原則

| # | 原則 | 実装への反映 |
|---|---|---|
| 1 | 診断しない | 病名・治療・「効果」を出力禁止。`level` と一般的 `note` のみ |
| 2 | 不確実性を隠さない | 各項目に `confidence(0–1)`。低品質画像は `retake` |
| 3 | 構造化を強制 | Structured Outputs(strict JSON Schema)で自由文を排除 |
| 4 | 再現性 | `temperature: 0.2`、固定 system prompt、`ai_model_version` を記録 |
| 5 | 安全弁優先 | 画像品質ゲートを先に判定し、不適切なら解析せず再撮影へ |

---

## 2. パイプライン全体

```
画像アップロード
  └─ ① 画像品質ゲート (quality gate)
        - 被写体検出(犬/猫がいるか) / 明るさ / ブレ / 構図(顔・全身)
        - NG → status='retake'(解析モデルを呼ばない=コスト&誤推定防止)
  └─ ② 項目別ビジョン解析 (1回のVisionコールで全項目をJSON出力)
        - BODY / TEAR / COAT (MVP)。将来 ACTIVITY/JOINT/DENTAL/GUT
        - 各 metric: score, level, confidence, observations, note
  └─ ③ 集計
        - confidence < 0.6 の metric は総合スコアから除外
        - HEALTH SCORE = Σ(score × weight) を有効metricで正規化
        - grade / health_age を算出
  └─ ④ 監修コメント割当 (vet_comments テーブルから metric×level で引当)
  └─ ⑤ 保存 (scans / scan_metrics)
```

① と ② は**別コール**にしてもよいし、コスト優先で1コールに「まず品質判定→不十分なら解析せず needs_retake=true を返す」形に統合してもよい。MVPは1コール統合を推奨。

---

## 3. 入力(Input)

### 3.1 モデルに渡すもの
- **画像**:正方形 or 元アスペクト、長辺 ≤ 1024px に圧縮(コスト最適化)。
- **ペットのメタデータ**(コンテキスト):種別・推定犬種猫種・年齢・体重。推定精度の補助に使う。

### 3.2 ユーザーメッセージ構造(Chat Completions / Responses API)
```jsonc
{
  "role": "user",
  "content": [
    { "type": "text", "text": "{{PET_CONTEXT_JSON}}" },
    { "type": "image_url", "image_url": { "url": "https://.../scan.jpg", "detail": "high" } }
  ]
}
```
`PET_CONTEXT_JSON` 例:
```json
{ "species": "dog", "breed": "toy_poodle", "age_years": 7.0, "weight_kg": 4.2 }
```

---

## 4. System Prompt(固定)

```
You are PETSCAN's veterinary-supervised image *estimation* assistant.
You are NOT a veterinarian and you do NOT diagnose. You ESTIMATE general,
visible characteristics of a pet from a single photo and return a structured score.

Rules:
- NEVER name diseases, never suggest treatment, never claim any product "cures"
  or "treats" anything. Avoid the words: diagnose, disease, treatment, cure, prescription.
- If the image is low quality (dark, blurry, no clearly visible pet, wrong framing),
  set "needs_retake": true and explain briefly in "retake_reason". Do not invent scores.
- Express uncertainty honestly via per-metric "confidence" (0.0–1.0). When unsure, lower it.
- Use the provided pet context (species, breed, age, weight) only as a prior; the photo is primary.
- Output language for human-facing "note": Japanese, calm and supportive, never alarming.
- Return ONLY the JSON object defined by the schema. No extra prose.

Scoring guidance (0–100, higher = better condition):
- body: estimate Body Condition Score (under/ideal/over weight) from silhouette; map to 0–100.
- tear: estimate tear-stain by reddish-brown staining area/intensity around the eyes.
- coat: estimate coat shine, uniformity, and absence of visible matting/flaking.
A "note" must be a general care suggestion, not a medical instruction, and must include
the nuance "気になる場合は獣医師にご相談ください" when level is "attention".
```

---

## 5. 出力(Output)JSON Schema(Structured Outputs / strict)

```json
{
  "name": "petscan_analysis",
  "strict": true,
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "required": ["needs_retake", "retake_reason", "image_quality", "metrics"],
    "properties": {
      "needs_retake": { "type": "boolean" },
      "retake_reason": { "type": "string" },
      "image_quality": {
        "type": "object",
        "additionalProperties": false,
        "required": ["brightness", "sharpness", "subject_detected", "framing"],
        "properties": {
          "brightness":       { "type": "number", "minimum": 0, "maximum": 1 },
          "sharpness":        { "type": "number", "minimum": 0, "maximum": 1 },
          "subject_detected": { "type": "boolean" },
          "framing":          { "type": "string", "enum": ["face", "full_body", "partial", "unclear"] }
        }
      },
      "metrics": {
        "type": "array",
        "minItems": 3,
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": ["key", "score", "level", "confidence", "observations", "note"],
          "properties": {
            "key":        { "type": "string", "enum": ["body", "tear", "coat"] },
            "score":      { "type": "integer", "minimum": 0, "maximum": 100 },
            "level":      { "type": "string", "enum": ["good", "watch", "attention"] },
            "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
            "observations": { "type": "array", "items": { "type": "string" }, "maxItems": 4 },
            "note":       { "type": "string" }
          }
        }
      }
    }
  }
}
```

> 将来項目(activity/joint/dental/gut)は `key` の enum と `minItems` を拡張するだけで段階追加できる。

---

## 6. Confidence 設計

### 6.1 画像品質ゲート(②に入る前 or 同コール内)
| 指標 | しきい値(retake) | 理由 |
|---|---|---|
| `subject_detected` | false | 犬猫が写っていない |
| `brightness` | < 0.25 | 暗すぎて毛色・涙やけ判定不能 |
| `sharpness` | < 0.30 | ブレで体型/毛並み判定不能 |
| `framing` | `unclear` | 構図不明 |

いずれか該当で `needs_retake = true` → UIは演出③で `SIGNAL WEAK` → 「もう一度だけ」モーダル(`§4 絵コンテ`の再撮影分岐)。

### 6.2 項目別 confidence
- モデルが各 metric に `confidence(0–1)` を自己申告。
- **`confidence < 0.6` の metric は総合スコアから除外**(UIでは「測定中の精度が低い項目」として控えめ表示 or 非表示)。
- 全 metric が低 confidence → `needs_retake = true` 扱いに格上げ。

### 6.3 confidence を下げるべき状況(プロンプトで明示)
- 毛色が極端に濃く涙やけ判定が困難 / 毛が長く体型が隠れる / 一部しか写っていない / 逆光。

---

## 7. スコア集計ロジック(サーバ側)

```ts
const WEIGHTS = { body: 0.5, tear: 0.25, coat: 0.25 }; // MVP

function aggregate(metrics) {
  const valid = metrics.filter(m => m.confidence >= 0.6);
  if (valid.length === 0) return { needs_retake: true };

  const wsum = valid.reduce((s, m) => s + WEIGHTS[m.key], 0);
  const score = Math.round(
    valid.reduce((s, m) => s + m.score * WEIGHTS[m.key], 0) / wsum
  );
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  return { health_score: score, health_grade: grade, confidence: avg(valid.map(m => m.confidence)) };
}
```

### 7.1 健康年齢(health_age)— 演出用の派生値
- 実年齢 `age` を基準に、総合スコアで前後させる目安値(医学的根拠の主張はしない)。
- 例:`health_age = age - (score - 70) / 14`(下限0.1)。UIに「目安」と明記。

---

## 8. リクエスト設定(推奨)

| 項目 | 値 | 備考 |
|---|---|---|
| model | `gpt-4o`(本番) / `gpt-4o-mini`(コスト) | A/Bで精度とコストを比較 |
| temperature | `0.2` | 再現性重視 |
| response_format | Structured Outputs(`json_schema`, strict) | 自由文排除 |
| image detail | `high`(品質判定/涙やけ) | コストとのトレードオフ |
| timeout / retry | 20s / 1 retry | 失敗時 `status='failed'` |
| 記録 | `ai_model_version` を scans に保存 | 後の精度改善で版管理 |

---

## 9. リクエスト/レスポンス例

### 9.1 正常(犬・良好)
レスポンス:
```json
{
  "needs_retake": false,
  "retake_reason": "",
  "image_quality": { "brightness": 0.72, "sharpness": 0.81, "subject_detected": true, "framing": "full_body" },
  "metrics": [
    { "key": "body", "score": 94, "level": "good", "confidence": 0.88,
      "observations": ["腰のくびれが確認できる", "肋骨が過度に出ていない"],
      "note": "適正体型に見えます。今の食事と運動のバランスを維持しましょう。" },
    { "key": "tear", "score": 88, "level": "good", "confidence": 0.79,
      "observations": ["目下の着色はごく薄い"],
      "note": "涙やけは目立ちません。目元を清潔に保つケアを続けましょう。" },
    { "key": "coat", "score": 78, "level": "watch", "confidence": 0.74,
      "observations": ["背中のツヤがやや不均一"],
      "note": "毛並みは季節で揺らぎがちです。ブラッシングと食事の見直しが一般的なケアです。" }
  ]
}
```

### 9.2 再撮影(暗所・ブレ)
```json
{
  "needs_retake": true,
  "retake_reason": "画像が暗くブレているため、体型と毛並みを推定できません。",
  "image_quality": { "brightness": 0.18, "sharpness": 0.22, "subject_detected": true, "framing": "partial" },
  "metrics": []
}
```
→ サーバは `status='retake'` を返し、UIは再撮影フローへ。**スコアは保存しない。**

---

## 10. 安全・コンプラ ガード(出力後チェック)

サーバ側で**機械的に**禁止語をスキャンし、混入時は `note` をテンプレ文へ置換:
- 禁止語(部分一致):`診断 / 病気 / 疾患 / 治療 / 治る / 効く / 処方 / がん / 腫瘍 …`
- `level === 'attention'` の `note` に「気になる場合は獣医師にご相談ください」が無ければ付与。
- わんにゃんエクラ等の商品提案は**効能を断定しない**「ケアの一例」表現のみ([[わんにゃんエクラ連携]]の自然導線方針)。

---

## 11. 将来拡張(段階リリース)
| 項目 | 追加で必要なこと |
|---|---|
| ACTIVITY INDEX | 写真単体では困難。歩数/動画/手入力の補助入力を併用 |
| JOINT | 姿勢・歩様は静止画で限界。動画フレーム解析を検討 |
| DENTAL | 口腔内クローズアップ撮影ガイドが前提 |
| GUT(腸内環境予測) | 直接推定不可。便写真 or 問診ベースの別モデルに分離 |

精度が担保できない項目は**出さない**(信用毀損の回避)。MVPは body/tear/coat の3項目に集中する。
```

---

## 関連
- 画面・演出: `index.html`(プロトタイプ)、`README.md`
- スコア配色・グレード: 本デモの `THEMES` / `gradeOf()` と整合
