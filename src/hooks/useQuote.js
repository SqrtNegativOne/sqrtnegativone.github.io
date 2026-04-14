import { useState, useEffect, useCallback } from "react";
import { getRandomQuote } from "../data/quotes";

const TYPE_MS   = 28;
const DELETE_MS = 12;

/**
 * Encapsulates all quote animation state so it can live at the App level,
 * persisting across route changes regardless of where <Quote> is rendered.
 */
export function useQuote() {
  const [displayed, setDisplayed] = useState("");
  const [fullText,  setFullText]  = useState("");
  const [phase,     setPhase]     = useState("idle");
  const [nextText,  setNextText]  = useState(null);

  useEffect(() => {
    getRandomQuote().then(text => {
      setFullText(text);
      setPhase("typing");
    });
  }, []);

  useEffect(() => {
    if (phase === "typing") {
      if (displayed.length < fullText.length) {
        const t = setTimeout(
          () => setDisplayed(fullText.slice(0, displayed.length + 1)),
          TYPE_MS
        );
        return () => clearTimeout(t);
      } else {
        setPhase("idle");
      }
    } else if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(
          () => setDisplayed(prev => prev.slice(0, -1)),
          DELETE_MS
        );
        return () => clearTimeout(t);
      } else if (nextText !== null) {
        setFullText(nextText);
        setNextText(null);
        setPhase("typing");
      }
    }
  }, [phase, displayed, fullText, nextText]);

  const cycleQuote = useCallback(() => {
    if (phase === "deleting") return;
    getRandomQuote().then(setNextText);
    setPhase("deleting");
  }, [phase]);

  return { displayed, phase, cycleQuote };
}
