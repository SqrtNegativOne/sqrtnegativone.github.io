# sqrt.fyi

Two static SvelteKit apps in one repo:

- `site/` — deployed to **sqrt.fyi** (blog, feed, microblog, now, minis, questions, media library, colophon).
- `cv/` — deployed to **cv.sqrt.fyi** (home, about, projects, skills).
- `shared/` — cross-app components, imported via the `$shared` alias.
- `admin/` — Tauri desktop dashboard for managing content.

Built with SvelteKit (Svelte 5), Tailwind CSS v4, and Velite (site blog only). Hosted on Cloudflare Workers. Package manager is **Bun** — run `bun install`, `bun run dev`, `bun run build`, and `bun run check` from inside `site/` or `cv/`.

See `AGENTS.md` for the full layout, conventions, and deploy notes.
