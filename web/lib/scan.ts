// PETSCAN AI — スコア/グレード/テーマのドメインロジック

export type Species = "dog" | "cat";

export interface Pet {
  species: Species;
  name: string;
  breed: string;
  birthY: number;
  birthM: number;
  weight: number;
  photo: string | null;
}

export interface Theme {
  c: string;
  c2: string;
  glow: string;
}
export interface Grade {
  g: string;
  t: Theme;
  cond: string;
}
export interface ScanResult {
  body: number;
  tear: number;
  coat: number;
  overall: number;
}

export const THEMES: Record<"green" | "cyan" | "amber" | "red", Theme> = {
  green: { c: "#36F1B3", c2: "#27E1FF", glow: "0 0 24px rgba(54,241,179,.55), 0 0 64px rgba(54,241,179,.22)" },
  cyan:  { c: "#27E1FF", c2: "#36F1B3", glow: "0 0 24px rgba(39,225,255,.55), 0 0 64px rgba(39,225,255,.25)" },
  amber: { c: "#FFC857", c2: "#FFE29A", glow: "0 0 24px rgba(255,200,87,.5), 0 0 60px rgba(255,200,87,.2)" },
  red:   { c: "#FF4D6D", c2: "#FF8AA0", glow: "0 0 22px rgba(255,77,109,.5), 0 0 56px rgba(255,77,109,.18)" },
};

export function gradeOf(score: number): Grade {
  if (score >= 90) return { g: "A+", t: THEMES.green, cond: "Excellent Condition" };
  if (score >= 80) return { g: "A",  t: THEMES.cyan,  cond: "Great Condition" };
  if (score >= 70) return { g: "B",  t: THEMES.cyan,  cond: "Good Condition" };
  if (score >= 60) return { g: "C",  t: THEMES.amber, cond: "Fair Condition" };
  return            { g: "D",  t: THEMES.red,   cond: "Needs Care" };
}

export type Level = "good" | "watch" | "attention";
export function metricLevel(s: number): [Level, string] {
  return s >= 85 ? ["good", "GOOD"] : s >= 70 ? ["watch", "WATCH"] : ["attention", "ATTENTION"];
}

export const rand = (a: number, b: number) => Math.round(a + Math.random() * (b - a));

export function rollScores(): ScanResult {
  const body = rand(64, 98), tear = rand(62, 96), coat = rand(58, 95);
  const overall = Math.round(body * 0.5 + tear * 0.25 + coat * 0.25);
  return { body, tear, coat, overall };
}

export const BREEDS: Record<Species, string[]> = {
  dog: ["トイプードル", "チワワ", "柴犬", "ミニチュアダックス", "ポメラニアン", "フレンチブルドッグ", "ゴールデンレトリバー", "ミックス", "その他"],
  cat: ["スコティッシュフォールド", "マンチカン", "アメリカンショートヘア", "ノルウェージャンフォレスト", "ラグドール", "ブリティッシュショートヘア", "雑種(MIX)", "その他"],
};

export const DEMO_IMG: Record<Species, { home: string; scan: string }> = {
  dog: { home: "https://place.dog/600/700", scan: "https://place.dog/400/400" },
  cat: { home: "https://cataas.com/cat?width=600&height=700", scan: "https://cataas.com/cat?width=440&height=440" },
};

export function petAge(pet: Pet): number {
  const now = new Date();
  const age = now.getFullYear() - pet.birthY + (now.getMonth() + 1 - pet.birthM) / 12;
  return Math.max(0.1, age);
}

export function healthAge(overall: number): number {
  return Math.max(0.1, 7 - (overall - 50) / 14);
}

export const emojiOf = (s: Species) => (s === "cat" ? "🐈" : "🐕");
export const imgOf = (pet: Pet, kind: "home" | "scan") => pet.photo || DEMO_IMG[pet.species][kind];
