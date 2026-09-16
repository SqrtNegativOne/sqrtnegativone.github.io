/**
 * Label for an 88x31 button, derived from its URL's hostname (minus a leading
 * `www.`). Used as the link's `aria-label` and the image's `alt` text.
 */
export function buttonLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
