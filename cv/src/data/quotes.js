// Fetches quotes from /quotes/quotes.json.
export async function getRandomQuote() {
  const res = await fetch("/quotes/quotes.json");
  const allQuotes = await res.json();
  if (!allQuotes || allQuotes.length === 0) return "";
  
  const safeQuotes = allQuotes.filter(q => !q.tags?.includes("afterdark"));
  if (safeQuotes.length === 0) return "";

  const item = safeQuotes[Math.floor(Math.random() * safeQuotes.length)];
  return item.quote;
}
