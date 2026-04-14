export default function Quote({ displayed, phase, onCycle }) {
  if (phase === "idle" && !displayed) return null;

  return (
    <p className="quote" onClick={onCycle}>
      {displayed}
      {phase !== "idle" && <span className="quote-cursor">|</span>}
    </p>
  );
}
