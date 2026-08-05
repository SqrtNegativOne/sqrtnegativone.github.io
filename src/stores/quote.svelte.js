import { browser } from '$app/environment';
import { getRandomQuote } from "../data/quotes";

const TYPE_MS = 28;
const DELETE_MS = 12;

export function createQuoteStore() {
  let displayed = $state("");
  let fullText = $state("");
  let phase = $state("idle"); // "idle", "typing", "deleting"
  let nextText = $state(null);

  let typeTimer;

  function init() {
    if (!browser) return;
    getRandomQuote().then(text => {
      fullText = text;
      phase = "typing";
      startTyping();
    });
  }

  function startTyping() {
    if (phase !== "typing") return;
    if (displayed.length < fullText.length) {
      typeTimer = setTimeout(() => {
        displayed = fullText.slice(0, displayed.length + 1);
        startTyping();
      }, TYPE_MS);
    } else {
      phase = "idle";
    }
  }

  function startDeleting() {
    if (phase !== "deleting") return;
    if (displayed.length > 0) {
      setTimeout(() => {
        displayed = displayed.slice(0, -1);
        startDeleting();
      }, DELETE_MS);
    } else if (nextText !== null) {
      fullText = nextText;
      nextText = null;
      phase = "typing";
      startTyping();
    }
  }

  // Start on store creation
  init();

  return {
    get displayed() { return displayed; },
    get phase() { return phase; },
    cycleQuote() {
      if (phase === "deleting") return;
      getRandomQuote().then(text => {
        nextText = text;
        phase = "deleting";
        clearTimeout(typeTimer);
        startDeleting();
      });
    }
  };
}

export const quoteStore = createQuoteStore();
