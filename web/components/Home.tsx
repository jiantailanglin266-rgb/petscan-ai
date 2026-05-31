"use client";
import { useState } from "react";
import { Pet, imgOf, emojiOf } from "@/lib/scan";

export default function Home({
  active,
  pet,
  last,
  lastGrade,
  onScan,
  onHistory,
}: {
  active: boolean;
  pet: Pet;
  last: number;
  lastGrade: string;
  onScan: () => void;
  onHistory: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const src = imgOf(pet, "home");

  return (
    <section id="home" className={"screen" + (active ? " active" : "")}>
      <div className="brand">
        <i className="ring" />
        <b>
          PETSCAN <span>AI</span>
        </b>
      </div>
      <div className="hero">
        {!broken && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={pet.name} onError={() => setBroken(true)} />
        )}
        {broken && <div className="fallback">{emojiOf(pet.species)}</div>}
        <div className="cap">{pet.name} の健康を、今日も。</div>
      </div>
      <div className="scan-wrap">
        <button className="scanbtn" onClick={onScan}>
          SCAN
          <br />
          NOW<small>TAP TO SCAN</small>
        </button>
        <div className="statbar" style={{ cursor: "pointer" }} onClick={onHistory}>
          <div className="stat">
            <span className="label">前回スコア</span>
            <span className="v">
              {last} <small style={{ fontSize: 12 }}>{lastGrade}</small>
            </span>
          </div>
          <div className="stat">
            <span className="label">健康推移</span>
            <span className="v cyan">📈 ›</span>
          </div>
        </div>
      </div>
    </section>
  );
}
