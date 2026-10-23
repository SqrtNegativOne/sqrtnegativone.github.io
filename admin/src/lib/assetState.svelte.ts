import { convertFileSrc, isTauri } from '@tauri-apps/api/core';
import { getRepoRoot } from './db';

// URL prefixes whose assets live in the cv app. Everything else (media,
// blog-images, velite, fonts, icons) is served from the site app.
const CV_ASSET_PREFIXES = ['/portraits/', '/projects/', '/quotes/', '/logos/'];

class AssetState {
    repoRoot = $state('');
    private versions = $state<Record<string, number>>({});

    constructor() {
        if (typeof window !== 'undefined' && isTauri()) {
            getRepoRoot().then(root => {
                this.repoRoot = root;
            });
            try {
                const stored = localStorage.getItem('admin_asset_versions');
                if (stored) {
                    this.versions = JSON.parse(stored);
                }
            } catch {
                // Ignore localStorage errors
            }
            // Seed recently modified posters so existing session caches are busted
            const seedPosters = ['book_the_handmaid_s_tale', 'book_there_is_no_antimemetics_division'];
            for (const id of seedPosters) {
                if (!this.versions[id]) {
                    this.bust(id);
                }
            }
        }
    }

    bust(url: string) {
        if (!url) return;
        const clean = url.split('?')[0];
        const now = Date.now();
        this.versions[clean] = now;
        if (!clean.startsWith('/')) {
            this.versions[`/media/media-posters/${clean}.avif`] = now;
        } else if (clean.startsWith('/media/media-posters/') && clean.endsWith('.avif')) {
            const base = clean.slice('/media/media-posters/'.length, -'.avif'.length);
            this.versions[base] = now;
        }
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('admin_asset_versions', JSON.stringify(this.versions));
            } catch {
                // Ignore localStorage errors
            }
        }
    }

    resolve(url: string) {
        if (!url || !this.repoRoot) return url;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (url.startsWith('/')) {
            const root = this.repoRoot.replace(/\\/g, '/');
            const app = CV_ASSET_PREFIXES.some((prefix) => url.startsWith(prefix)) ? 'cv' : 'site';
            const fileSrc = convertFileSrc(`${root}/${app}/static${url}`);
            const clean = url.split('?')[0];
            const v = this.versions[clean];
            return v ? `${fileSrc}${fileSrc.includes('?') ? '&' : '?'}v=${v}` : fileSrc;
        }
        return url;
    }
}

export const assetState = new AssetState();
