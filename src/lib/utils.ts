export function getPosterUrl(posterUrl?: string | null): string {
    if (!posterUrl) return '';
    if (posterUrl.startsWith('http') || posterUrl.startsWith('/')) {
        return posterUrl;
    }
    return `/media-posters/${posterUrl}.avif`;
}
