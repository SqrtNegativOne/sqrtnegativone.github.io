import { convertFileSrc, isTauri } from '@tauri-apps/api/core';
import { getRepoRoot } from './db';

// URL prefixes whose assets live in the cv app. Everything else (media,
// blog-images, velite, fonts, icons) is served from the site app.
const CV_ASSET_PREFIXES = ['/portraits/', '/projects/', '/quotes/', '/logos/'];

class AssetState {
    repoRoot = $state('');

    constructor() {
        if (typeof window !== 'undefined' && isTauri()) {
            getRepoRoot().then(root => {
                this.repoRoot = root;
            });
        }
    }

    resolve(url: string) {
        if (!url || !this.repoRoot) return url;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (url.startsWith('/')) {
            const root = this.repoRoot.replace(/\\/g, '/');
            const app = CV_ASSET_PREFIXES.some((prefix) => url.startsWith(prefix)) ? 'cv' : 'site';
            return convertFileSrc(`${root}/${app}/static${url}`);
        }
        return url;
    }
}

export const assetState = new AssetState();
