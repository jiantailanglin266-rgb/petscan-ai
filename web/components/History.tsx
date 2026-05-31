"use client";
import { useState } from "react";
import { Pet } from "@/lib/scan";

type Range = "week" | "month" | "year";
const RANGE_LABEL: Record<Range, string> = { week: "WEEKLY", month: "MONTHLY", year: "YEARLY" };

const W = 320, H = 180, PL = 16, PR = 16, PT = 18, PB = 22;

function chart(data: number[]) {
  const n = data.length;
  const min = Math.min(...data) - 6, max = Math.max(...data) + 4;
  const xs = (i: number) => PL + (W - PL - PR) * (n === 1 ? 0.5 : i / (n - 1));
  const ys = (v: number) => PT + (H - PT - PB) * (1 - (v - min) / (max - min || 1));
  let line = "";
  data.forEach((v, i) => (line += (i ? "L" : "M") + xs(i).toFixed(1) + " " + ys(v).toFixed(1) + " "));
  const area = line + `L${xs(n - 1).toFixed(1)} ${H - PB} L${xs(0).toFixed(1)} ${H - PB} Z`;
  const dots = data.map((v, i) => ({ x: xs(i), y: ys(v), last: i === n - 1 }));
  const grid = [0, 1, 2, 3].map((g) => PT + ((H - PT - PB) * g) / 3);
  return { line, area, dots, grid };
}

export default function History({
  active,
  pet,
  data,
  onBack,
  onScan,
}: {
  active: boolean;
  pet: Pet;
  data: Record<Range, number[]>;
  onBack: () => void;
  onScan: () => void;
}) {
  const [range, setRange] = useState<Range>("week");
  const d = data[range];
  const { line, area, dots, grid } = chart(d);

  return (
    <section id="history" className={"screen" + (active ? " active" : "")}>
      <div className="h-head">
        <button className="back" onClick={onBack}>‹</button>
        <div className="h-title">
          {pet.name} の健康推移 <small>HEALTH TREND</small>
        </div>
      </div>

      <div className="range">
        {(["week", "month", "year"] as Range[]).map((r) => (
          <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>
            {r === "week" ? "週" : r === "month" ? "月" : "年"}
          </button>
        ))}
      </div>

      <div className="chart-card">
        <div className="cur">
          <b>{d[d.length - 1]}</b>
          <span>{RANGE_LABEL[range]} · LATEST</span>
        </div>
        <svg viewBox="0 0 320 180" width="100%" height={180} preserveAspectRatio="none">
          <defs>
            <linearGradient id="harea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(39,225,255,.32)" />
              <stop offset="1" stopColor="rgba(39,225,255,0)" />
            </linearGradient>
          </defs>
          {grid.map((y, i) => (
            <line key={i} x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(255,255,255,.06)" />
          ))}
          <path d={area} fill="url(#harea)" />
          <path
            d={line}
            fill="none"
            stroke="#27E1FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(39,225,255,.6))" }}
          />
          {dots.map((p, i) => (
            <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.last ? 4.2 : 2.6} fill={p.last ? "#36F1B3" : "#27E1FF"} />
          ))}
        </svg>
      </div>

      <div className="sec-title">獲得バッジ</div>
      <div className="badges">
        <div className="bdg"><span className="m">🔥</span>7日連続スキャン</div>
        <div className="bdg"><span className="m">🏅</span>スコア90超</div>
        <div className="bdg"><span className="m">⭐</span>ヘルスLv.4</div>
      </div>

      <button className="cta-lg" style={{ alignSelf: "center" }} onClick={onScan}>
        スキャンする <span>→</span>
      </button>
    </section>
  );
}
