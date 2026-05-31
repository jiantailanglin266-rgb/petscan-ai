"use client";
import { useEffect, useRef, useState } from "react";
import { Pet, ScanResult, gradeOf, metricLevel, petAge, healthAge } from "@/lib/scan";
import { buzz } from "@/lib/sound";

const CIRC = 553;
const META = [
  { key: "body" as const, ic: "⚖️", t: "BODY CONDITION", s: "適正体型・肥満リスク" },
  { key: "tear" as const, ic: "👁️", t: "TEAR STAIN", s: "涙やけ・目周りの着色" },
  { key: "coat" as const, ic: "✨", t: "COAT CONDITION", s: "毛並み・ツヤ" },
];

export default function Result({
  active,
  result,
  pet,
  onScan,
  onHistory,
}: {
  active: boolean;
  result: ScanResult;
  pet: Pet;
  onScan: () => void;
  onHistory: () => void;
}) {
  const gr = gradeOf(result.overall);
  const th = gr.t;
  const [offset, setOffset] = useState(CIRC);
  const [score, setScore] = useState(0);
  const burstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ゲージ充填
    const id = window.setTimeout(() => setOffset(CIRC * (1 - result.overall / 100)), 30);
    // スコア カウントアップ
    const t0 = performance.now();
    let raf = 0;
    const f = (now: number) => {
      const k = Math.min(1, (now - t0) / 1000);
      setScore(Math.round(result.overall * k));
      if (k < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    // パーティクルバースト
    const host = burstRef.current;
    const removers: number[] = [];
    if (host && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let i = 0; i < 28; i++) {
        const p = document.createElement("span");
        p.className = "particle";
        const col = i % 2 ? th.c : th.c2;
        p.style.background = col;
        p.style.boxShadow = "0 0 8px " + col;
        host.appendChild(p);
        const a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 130, dly = Math.random() * 120;
        removers.push(window.setTimeout(() => {
          p.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(0)`;
          p.style.opacity = "0";
        }, dly));
        removers.push(window.setTimeout(() => p.remove(), 1000 + dly));
      }
    }
    buzz([30, 60, 30]);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf);
      removers.forEach(clearTimeout);
      if (host) host.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="result" className={"screen reveal" + (active ? " active" : "")}>
      <div className="r-head">
        <div className={"gauge" + (gr.g === "D" ? " warn" : "")}>
          <svg width="200" height="200">
            <circle cx="100" cy="100" r="88" stroke="rgba(255,255,255,.07)" strokeWidth="10" fill="none" />
            <circle
              cx="100" cy="100" r="88" strokeWidth="10" fill="none" strokeLinecap="round"
              stroke={th.c} strokeDasharray={CIRC} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease, stroke .5s ease" }}
            />
          </svg>
          <div className="center">
            <div className="score" style={{ color: th.c, textShadow: th.glow }}>{score}</div>
            <div className="grade" style={{ color: th.c, textShadow: th.glow }}>{gr.g}</div>
          </div>
          <div className="burst" ref={burstRef} />
        </div>
        <div className="cond" style={{ color: th.c }}>{gr.cond}</div>
      </div>

      <div className="agecard">
        <div className="blk">
          <div className="t">実年齢</div>
          <div className="n">{petAge(pet).toFixed(1)}歳</div>
        </div>
        <div className="arrow">→</div>
        <div className="blk">
          <div className="t">健康年齢</div>
          <div className="n green">{healthAge(result.overall).toFixed(1)}歳 ✨</div>
        </div>
      </div>

      <div>
        <div className="sec-title">Scan Results</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {META.map((m) => {
            const v = result[m.key];
            const [cls, txt] = metricLevel(v);
            const col = cls === "good" ? "var(--neon-green)" : cls === "watch" ? "var(--neon-amber)" : "var(--neon-red)";
            return (
              <div className="metric" key={m.key}>
                <div className="ic">{m.ic}</div>
                <div className="body">
                  <div className="mt">{m.t}</div>
                  <div className="ms">{m.s}</div>
                </div>
                <div className="sc" style={{ color: col }}>{v}</div>
                <div className={"lv " + cls}>{txt}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="vet">
        <div className="h">💬 獣医師監修コメント</div>
        <p>
          毛並みは季節で揺らぎがちです。日々のブラッシングと食事の見直しが一般的なケアです。気になる状態が続く場合は獣医師にご相談ください。
        </p>
      </div>

      <div className="care">
        <div className="t">毛並みが気になる時に。</div>
        <div className="l">
          わんにゃんエクラ <span>›</span>
        </div>
      </div>

      <div className="r-actions">
        <button className="btn" onClick={onHistory}>履歴を見る</button>
        <button className="btn primary" onClick={onScan}>もう一度スキャン</button>
      </div>
      <div className="disclaimer">
        ※本結果は健康管理のための目安です。獣医療・診断ではありません。気になる場合は獣医師にご相談ください。
      </div>
    </section>
  );
}
