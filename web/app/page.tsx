"use client";
import { useState } from "react";
import { Pet, ScanResult, gradeOf } from "@/lib/scan";
import { se } from "@/lib/sound";
import SoundToggle from "@/components/SoundToggle";
import Splash from "@/components/Splash";
import Profile from "@/components/Profile";
import Home from "@/components/Home";
import ScanOverlay from "@/components/ScanOverlay";
import Result from "@/components/Result";
import History from "@/components/History";

type Screen = "splash" | "profile" | "home" | "scan" | "result" | "history";

const DEFAULT_PET: Pet = {
  species: "dog",
  name: "モカ",
  breed: "トイプードル",
  birthY: 2019,
  birthM: 4,
  weight: 4.2,
  photo: null,
};

export default function Page() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [pet, setPet] = useState<Pet>(DEFAULT_PET);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [runId, setRunId] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [last, setLast] = useState({ score: 92, grade: "A+" });
  const [week, setWeek] = useState<number[]>([78, 82, 80, 85, 88, 84, 90, 92]);

  const histData = {
    week,
    month: [74, 79, 83, 86, 88, 90, 92],
    year: [68, 71, 73, 77, 80, 82, 84, 86, 88, 90, 91, 92],
  };

  function submitProfile(p: Pet) {
    setPet(p);
    setScreen("home");
  }
  function startScan() {
    se.resume();
    setRunId((n) => n + 1);
    setScanCount((n) => n + 1);
    setScreen("scan");
  }
  function onScanComplete(r: ScanResult) {
    setResult(r);
    setLast({ score: r.overall, grade: gradeOf(r.overall).g });
    setWeek((w) => [...w, r.overall].slice(-9));
    setScreen("result");
  }

  return (
    <div id="app">
      <SoundToggle />
      <Splash active={screen === "splash"} species={pet.species} onStart={() => setScreen("profile")} />
      <Profile active={screen === "profile"} pet={pet} onBack={() => setScreen("splash")} onSubmit={submitProfile} />
      <Home
        active={screen === "home"}
        pet={pet}
        last={last.score}
        lastGrade={last.grade}
        onScan={startScan}
        onHistory={() => setScreen("history")}
      />
      <ScanOverlay active={screen === "scan"} runId={runId} quick={scanCount > 1} pet={pet} onComplete={onScanComplete} />
      {result && (
        <Result
          key={runId}
          active={screen === "result"}
          result={result}
          pet={pet}
          onScan={startScan}
          onHistory={() => setScreen("history")}
        />
      )}
      <History active={screen === "history"} pet={pet} data={histData} onBack={() => setScreen("home")} onScan={startScan} />
    </div>
  );
}
