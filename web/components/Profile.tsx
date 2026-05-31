"use client";
import { useMemo, useState } from "react";
import { Pet, Species, BREEDS } from "@/lib/scan";
import { buzz } from "@/lib/sound";

export default function Profile({
  active,
  pet,
  onBack,
  onSubmit,
}: {
  active: boolean;
  pet: Pet;
  onBack: () => void;
  onSubmit: (p: Pet) => void;
}) {
  const [species, setSpecies] = useState<Species>(pet.species);
  const [name, setName] = useState(pet.name);
  const [year, setYear] = useState(pet.birthY);
  const [month, setMonth] = useState(pet.birthM);
  const [breed, setBreed] = useState(pet.breed);
  const [weight, setWeight] = useState(String(pet.weight));
  const [photo, setPhoto] = useState<string | null>(pet.photo);
  const [errName, setErrName] = useState(false);
  const [errW, setErrW] = useState(false);
  const [shake, setShake] = useState(0); // 失敗のたびに増やしてアニメ再生

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 23 }, (_, i) => now - i);
  }, []);
  const breeds = BREEDS[species];

  function pickSpecies(s: Species) {
    setSpecies(s);
    if (!BREEDS[s].includes(breed)) setBreed(BREEDS[s][0]);
  }
  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPhoto(URL.createObjectURL(f));
  }
  function submit() {
    const nm = name.trim();
    const w = parseFloat(weight);
    const bad: string[] = [];
    if (!nm) bad.push("name");
    if (!(w > 0 && w < 120)) bad.push("weight");
    setErrName(bad.includes("name"));
    setErrW(bad.includes("weight"));
    if (bad.length) {
      setShake((n) => n + 1);
      buzz([40, 60, 40]);
      return;
    }
    onSubmit({ species, name: nm, breed, birthY: year, birthM: month, weight: w, photo });
  }

  return (
    <section id="profile" className={"screen" + (active ? " active" : "")}>
      <div className="p-head">
        <button className="back" onClick={onBack}>
          ‹
        </button>
        <div className="p-title">
          この子のことを
          <br />
          教えてください
        </div>
      </div>

      <div className="species">
        <div className={"opt" + (species === "dog" ? " sel" : "")} onClick={() => pickSpecies("dog")}>
          <div className="emoji">🐶</div>
          <div className="lbl">いぬ</div>
        </div>
        <div className={"opt" + (species === "cat" ? " sel" : "")} onClick={() => pickSpecies("cat")}>
          <div className="emoji">🐱</div>
          <div className="lbl">ねこ</div>
        </div>
      </div>

      <label className="photo-field">
        <span className="photo-prev">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="preview" />
          ) : species === "cat" ? (
            "🐱"
          ) : (
            "🐶"
          )}
        </span>
        <span className="photo-txt">
          写真を追加<small>（任意）</small>
        </span>
        <input type="file" accept="image/*" onChange={onPhoto} hidden />
      </label>

      <div className={"field" + (errName ? " err shake" : "")} key={`name-${shake}`}>
        <label>なまえ</label>
        <input type="text" placeholder="例：モカ" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} />
        <span className="errmsg">なまえを入力してください</span>
      </div>

      <div className="row">
        <div className="field">
          <label>たんじょうび（年）</label>
          <select value={year} onChange={(e) => setYear(+e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>月</label>
          <select value={month} onChange={(e) => setMonth(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label>犬種・猫種</label>
        <select value={breed} onChange={(e) => setBreed(e.target.value)}>
          {breeds.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className={"field" + (errW ? " err shake" : "")} key={`w-${shake}`}>
        <label>いまの体重（kg）</label>
        <input
          type="number"
          step="0.1"
          min="0"
          placeholder="例：4.2"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <span className="errmsg">正しい体重を入力してください</span>
      </div>

      <button className="cta-lg" onClick={submit}>
        登録してスキャンへ <span>→</span>
      </button>
    </section>
  );
}
