import { useState, useEffect, useRef } from "react";

// ── Font carousel (commented out for now) ──────────────────────────
// const fonts = [
//   { family: '"IBM Plex Sans", sans-serif', weight: 100 },
//   { family: '"Instrument Serif", serif', weight: 300 },
// ];
// ────────────────────────────────────────────────────────────────────

const FULL  = "Ark Malhotra.";
const SHORT = "Ark.";

// Renders text as individual character spans so each can be animated separately.
// phase: "idle" | "out" | "in"
// --i is a CSS custom property used by charOut/charIn to stagger animation-delay per char.
function SplitText({ text, phase }) {
  return text.split("").map((char, i) => (
    <span
      key={i}
      className={phase !== "idle" ? `char char-${phase}` : "char"}
      style={{ "--i": i }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export default function HeroName() {
  // ── Font carousel logic (commented out) ──────────────────────────
  // const [fontIndex, setFontIndex] = useState(null);
  // const [phase, setPhase]         = useState("idle");
  // const animating = useRef(false);
  // const timers    = useRef([]);
  //
  // useEffect(() => {
  //   fonts.forEach(({ family, weight }) => {
  //     const name = family.split(",")[0].replace(/['"]/g, "").trim();
  //     document.fonts.load(`${weight} 1em "${name}"`);
  //   });
  //   return () => timers.current.forEach(clearTimeout);
  // }, []);
  //
  // const handleMouseEnter = () => {
  //   if (animating.current) return;
  //   animating.current = true;
  //   const nextIndex   = fontIndex === null ? 0 : (fontIndex + 1) % fonts.length;
  //   const n           = FULL.length;
  //   const stagger     = 22;
  //   const charDur     = 55;
  //   const outComplete = (n - 1) * stagger + charDur;
  //   const hold        = 30;
  //   setPhase("out");
  //   const t1 = setTimeout(() => {
  //     setFontIndex(nextIndex);
  //     setPhase("in");
  //   }, outComplete + hold);
  //   const t2 = setTimeout(() => {
  //     setPhase("idle");
  //     animating.current = false;
  //   }, outComplete + hold + outComplete + 80);
  //   timers.current = [t1, t2];
  // };
  //
  // const fontStyle = fontIndex !== null
  //   ? { fontFamily: fonts[fontIndex].family, fontWeight: fonts[fontIndex].weight }
  //   : {};
  // ──────────────────────────────────────────────────────────────────

  const [phase] = useState("idle");

  return (
    <div className="name-wrapper">
      <h1 className="name">
        <span className="name-full">
          <SplitText text={FULL}  phase={phase} />
        </span>
        <span className="name-short">
          <SplitText text={SHORT} phase={phase} />
        </span>
      </h1>
    </div>
  );
}
