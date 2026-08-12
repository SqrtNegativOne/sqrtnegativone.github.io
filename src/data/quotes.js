// Fetches quotes from /quotes/quotes.json.
export async function getRandomQuote() {
  const res = await fetch("/quotes/quotes.json");
  const quotes = await res.json();
  if (!quotes || quotes.length === 0) return "";
  const item = quotes[Math.floor(Math.random() * quotes.length)];
  return item.quote;
}
