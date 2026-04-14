// Fetches quotes from /quotes.txt (one quote per block, separated by blank lines).
export async function getRandomQuote() {
  const res = await fetch("/quotes.txt");
  const text = await res.text();
  const quotes = text.split(/\n\s*\n/).map(q => q.trim()).filter(Boolean);
  return quotes[Math.floor(Math.random() * quotes.length)];
}
