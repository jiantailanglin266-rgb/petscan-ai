"use client";
import { useEffect, useRef, useState } from "react";
import { Pet, ScanResult, gradeOf, rollScores, imgOf, emojiOf } from "@/lib/scan";
import { se, buzz } from "@/lib/sound";

const reduce = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ScanOverlay({
  active,
  runId,
  quick,
  pet,
  onComplete,
}: {
  active: boolean;
  runId: number;
  quick: boolean;
  pet: Pet;
  onComplete: (r: ScanResult) => void;
}) {
  const [broken, setBroken] = useState(false);
  const subjectRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const crystalRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);
  const progFillRef = useRef<HTMLDivElement>(null);
  const progLabelRef = useRef<HTMLDivElement>(null);
  const beamRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const nodeRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const nvRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    if (runId === 0) return; // 初期マウントでは走らせない
    const timers: number[] = [];
    const intervals: number[] = [];
    const rafs: number[] = [];
    const T = reduce() ? 0.35 : quick ? 0.6 : 1;
    const result = rollScores();
    const theme = gradeOf(result.overall).t;
    const targets = [result.body, result.tear, result.coat];

    const subj = subjectRef.current!;
    const grid = gridRef.current!;
    const ring = ringRef.current!;
    const crystal = crystalRef.current!;
    const beams = beamRefs.map((r) => r.current!);
    const nodes = nodeRefs.map((r) => r.current!);
    const nvs = nvRefs.map((r) => r.current!);
    const setPhase = (t: string) => phaseRef.current && (phaseRef.current.textContent = t);
    const setLabel = (t: string) => progLabelRef.current && (progLabelRef.current.textContent = t);

    // reset
    subj.classList.remove("in", "trace");
    beams.forEach((b) => b.classList.remove("run"));
    grid.classList.remove("show");
    ring.classList.remove("show");
    crystal.classList.remove("show");
    nodes.forEach((n) => n.classList.remove("pop"));
    nvs.forEach((nv) => (nv.textContent = "--"));
    setPhase("");
    setLabel("INITIALIZING");
    if (progFillRef.current) progFillRef.current.style.width = "0%";
    crystal.style.color = theme.c;
    crystal.style.textShadow = theme.glow;
    crystal.textContent = "0";

    const step = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms * T));
    const ramp = (from: number, to: number, dur: number) => {
      const t0 = performance.now();
      const f = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        if (progFillRef.current) progFillRef.current.style.width = (from + (to - from) * k) + "%";
        if (k < 1) rafs.push(requestAnimationFrame(f));
      };
      rafs.push(requestAnimationFrame(f));
    };
    const countUp = (el: HTMLElement, to: number, dur: number) => {
      const t0 = performance.now();
      const f = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        el.textContent = String(Math.round(to * k));
        if (k < 1) rafs.push(requestAnimationFrame(f));
      };
      rafs.push(requestAnimationFrame(f));
    };
    const rollNodes = () => {
      nvs.forEach((el, idx) => {
        let i = 0;
        const iv = window.setInterval(() => {
          el.textContent = String(Math.floor(Math.random() * 100));
          if (++i > 14) {
            window.clearInterval(iv);
            el.textContent = String(targets[idx]);
          }
        }, 70);
        intervals.push(iv);
      });
    };
    const pop = (i: number, delay: number) => timers.push(window.setTimeout(() => nodes[i].classList.add("pop"), delay));

    // ① 起動・吸い込み
    step(() => { subj.classList.add("in"); buzz(20); se.hum(); }, 60);
    // ② 走査 SCANNING
    step(() => { setPhase("SCANNING…"); setLabel("SURFACE SCAN"); beams.forEach((b) => b.classList.add("run")); grid.classList.add("show"); subj.classList.add("trace"); ramp(8, 46, 1500 * T); buzz([15, 120, 15, 120, 15]); se.sweep(1500 * T); }, 600);
    // ③ 解析 ANALYZING
    step(() => { setPhase("ANALYZING…"); setLabel("AI VISION MODEL"); ring.classList.add("show"); pop(0, 0); pop(1, 180); pop(2, 360); rollNodes(); ramp(46, 90, 1400 * T); se.analyze(900 * T); }, 2200);
    step(() => setPhase("HEALTH INDEX CALCULATED"), 3300);
    // ④ 結晶化 COMPLETE
    step(() => { setPhase("SCAN COMPLETE"); setLabel("DONE"); crystal.classList.add("show"); countUp(crystal, result.overall, 900 * T); ramp(90, 100, 600 * T); buzz(40); se.complete(); }, 3600);
    // ⑤ 着地
    step(() => onComplete(result), 4900);

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      rafs.forEach(cancelAnimationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const src = imgOf(pet, "scan");
  return (
    <section id="scan" className={"screen" + (active ? " active" : "")}>
      <div className="stage">
        <div className="ana-ring" ref={ringRef}>
          <i />
          <i />
        </div>
        <div className="subject" ref={subjectRef}>
          {!broken && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" onError={() => setBroken(true)} />
          )}
          {broken && <div className="fb">{emojiOf(pet.species)}</div>}
          <div className="grid" ref={gridRef} />
          <div className="edge" />
          <div className="beam ghost g3" ref={beamRefs[3]} />
          <div className="beam ghost g2" ref={beamRefs[2]} />
          <div className="beam ghost g1" ref={beamRefs[1]} />
          <div className="beam" ref={beamRefs[0]} />
        </div>
        <div className="node top" ref={nodeRefs[0]}>
          <div className="dot" />
          <div className="nm">BODY</div>
          <div className="nv" ref={nvRefs[0]}>--</div>
        </div>
        <div className="node left" ref={nodeRefs[1]}>
          <div className="dot" />
          <div className="nm">TEAR</div>
          <div className="nv" ref={nvRefs[1]}>--</div>
        </div>
        <div className="node right" ref={nodeRefs[2]}>
          <div className="dot" />
          <div className="nm">COAT</div>
          <div className="nv" ref={nvRefs[2]}>--</div>
        </div>
        <div className="crystal" ref={crystalRef}>0</div>
      </div>
      <div className="phase-text">
        <div className="pt" ref={phaseRef} />
        <div className="progressbar">
          <i ref={progFillRef} />
        </div>
        <div className="progresslabel" ref={progLabelRef}>INITIALIZING</div>
      </div>
    </section>
  );
}
