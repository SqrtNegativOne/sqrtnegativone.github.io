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
  - All site data files are registered in `COLLECTIONS` in `$lib/db.ts` (`projects`, `skills`, `socials`, `quotes`, `media`, `mediaPrivate`, `mediaProperties`).
  - **Adding a new content page (e.g. `/now`)**:
    1. Store its data in `src/data/<page>.json` (e.g. `src/data/now.json`).
    2. Register it in `COLLECTIONS` in `admin/src/lib/db.ts` (e.g. `now: 'src/data/now.json'`).
    3. Use `readData('now')` and `writeData('now', items)` in your admin routes.
    4. The backend automatically detects `src/data/*.json` as content, generates `content(now): update now`, and commits/publishes it seamlessly without any manual git steps.

