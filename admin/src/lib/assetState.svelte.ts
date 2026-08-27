import { convertFileSrc } from '@tauri-apps/api/core';
import { getRepoRoot } from './db';

class AssetState {
    repoRoot = $state('');

    constructor() {
        if (typeof window !== 'undefined' && '__TAURI__' in window) {
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
            return convertFileSrc(`${root}/static${url}`);
        }
        return url;
    }
}

export const assetState = new AssetState();
