"use client";
import { useState } from "react";
import { se } from "@/lib/sound";

export default function SoundToggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      className={"sound-toggle" + (on ? "" : " off")}
      aria-label="サウンド切替"
      onClick={() => setOn(se.toggle())}
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}
