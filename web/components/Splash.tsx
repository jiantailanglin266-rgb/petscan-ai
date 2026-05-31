"use client";
import { Species } from "@/lib/scan";

export default function Splash({
  active,
  species,
  onStart,
}: {
  active: boolean;
  species: Species;
  onStart: () => void;
}) {
  return (
    <section id="splash" className={"screen" + (active ? " active" : "")}>
      <div className="jacket">
        <div className="radar">
          <span className="pulsering" />
          <span className="pulsering d2" />
          <span className="sweep" />
          <span className="glyph">{species === "cat" ? "🐈" : "🐾"}</span>
        </div>
        <div className="title">
          PETSCAN <span>AI</span>
        </div>
        <div className="tag">愛を、テクノロジーで可視化する。</div>
        <div className="sub">
          スマホで撮るだけ。AIがこの子を
          <br />
          スキャンし、健康を可視化する。
        </div>
        <button className="cta-lg" onClick={onStart}>
          はじめる <span>→</span>
        </button>
        <div className="splash-note">
          ※本サービスは健康管理のための情報提供です。獣医療・診断ではありません。
        </div>
      </div>
    </section>
  );
}
