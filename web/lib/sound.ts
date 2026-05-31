// PETSCAN AI — Web Audio で生成する効果音エンジン(外部ファイル不要)
// クライアント専用。AudioContext はユーザー操作後に遅延生成する。

type Ctx = AudioContext | null;

class SoundEngine {
  private ctx: Ctx = null;
  on = true;

  private ac(): Ctx {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AC();
      } catch {
        /* noop */
      }
    }
    return this.ctx;
  }

  private tone(freq: number, t0: number, dur: number, type: OscillatorType = "sine", peak = 0.18) {
    const c = this.ac();
    if (!c || !this.on) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  toggle() {
    this.on = !this.on;
    if (this.on) this.resume();
    return this.on;
  }
  resume() {
    const c = this.ac();
    if (c && c.state === "suspended") c.resume();
  }

  hum() {
    const c = this.ac();
    if (!c || !this.on) return;
    const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70, t);
    o.frequency.linearRampToValueAtTime(130, t + 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.65);
  }
  sweep(durMs: number) {
    const c = this.ac();
    if (!c || !this.on) return;
    const t = c.currentTime, n = 5;
    for (let i = 0; i < n; i++) this.tone(900 + i * 60, t + (durMs / 1000) * (i / n), 0.08, "square", 0.1);
  }
  analyze(durMs: number) {
    const c = this.ac();
    if (!c || !this.on) return;
    const t = c.currentTime, n = 10;
    for (let i = 0; i < n; i++) this.tone(1400 + (i % 3) * 180, t + (durMs / 1000) * (i / n), 0.05, "triangle", 0.06);
  }
  complete() {
    const c = this.ac();
    if (!c || !this.on) return;
    const t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, t + i * 0.09, 0.5, "sine", 0.16));
    this.tone(1568, t + 0.36, 0.9, "sine", 0.08);
  }
}

export const se = new SoundEngine();
export const buzz = (p: number | number[]) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(p as any);
};
