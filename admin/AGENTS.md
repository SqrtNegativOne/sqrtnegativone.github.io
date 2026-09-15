## Tech Stack Overview (Admin)
- **Admin Dashboard**: A SvelteKit + Tauri desktop application used for managing data/media.
- **Package Manager**: **Bun**. Don't use npm.

## Development Commands
All commands should be run using `bun`. 
- Run `admin.bat` in the repository root folder, which executes `bun run tauri dev` inside this `admin/` directory to start the Tauri desktop app.

## Coding Guidelines & Rules (Admin)
- **Svelte 5 Syntax**: This project uses Svelte 5. Use runes (`$state`, `$derived`, `$props`, `$effect`) instead of the legacy Svelte 4 `export let` or reactive statements (`$: `).
- **Tailwind v4**: We use TailwindCSS v4. Stick to utility classes and utilize `@theme` in your CSS if necessary instead of relying on a `tailwind.config.js` file.
- **Error Handling**: Use neverthrow over try and catch statements. When working in the admin app, always utilize the centralized `neverthrow` wrappers (`safeInvoke`, `safeJsonParse`, `safeUrlParse`, etc.) exported from `src/lib/utils.ts` to maintain clean, functional `ResultAsync` pipelines.
- **Data Collections & Publishing**:
  - Always use `readData` and `writeData` from `$lib/db`. Never write raw Tauri `read_file` / `write_file` calls for content collections (this ensures `gitState.refresh()` runs automatically and the path mapping stays consistent).
  - All site data files are registered in `COLLECTIONS` in `$lib/db.ts` (`projects`, `skills`, `socials`, `quotes`, `media`, `mediaPrivate`, `mediaProperties`). Paths point into the owning app: CV content lives under `cv/`, site content under `site/`, and cross-app content under `shared/`. `socials` is shared (`shared/data/socials.json`) because both apps render it, filtered by each entry's `audience` (`personal` | `professional` | `both`). For markdown/raw content documents (e.g. `site/src/data/questions.md`), use `readQuestions()` / `writeQuestions()` or `readTextFile()` / `writeTextFile()` from `$lib/db.ts` to ensure git tracking refreshes automatically.
  - **Adding a new content page (e.g. `/now`)**:
    1. Store its data in the owning app's data dir, `site/src/data/<page>.json` or `cv/src/data/<page>.json` (e.g. `site/src/data/now.json`), or the equivalent `<page>.md`.
    2. Register it in `COLLECTIONS` in `admin/src/lib/db.ts` (e.g. `now: 'site/src/data/now.json'`).
    3. Use `readData('now')` and `writeData('now', items)` in your admin routes.
    4. The backend automatically detects `site/src/data/*.json`, `cv/src/data/*.json` (and their `.md` siblings) as content, generates `content(<page>): update <page>`, and commits/publishes it seamlessly without any manual git steps.

## Messages (Remote D1)
- The `/messages` page is the one admin route that does **not** read local repo files; it reads the live Cloudflare **D1** database behind the site's contact form.
- It talks to the `d1_query` Tauri command (`admin/src-tauri/src/lib.rs`), which shells out to `bun x wrangler d1 execute sqrt-fyi-messages --remote --json` from `site/`. This deliberately reuses the developer's existing `wrangler login` instead of storing a Cloudflare API token in the app.
- Use the helpers in `$lib/d1.ts` (`listMessages`, `deleteMessage`, `d1Query`) rather than calling `d1_query` directly. Wrangler/Bun must be on `PATH`; if not, the page reports a backend error.
- Schema lives in `site/migrations/`; see the root `AGENTS.md` for the D1 binding and migration commands.

