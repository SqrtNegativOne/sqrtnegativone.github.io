## Tech Stack Overview (Admin)
- **Admin Dashboard**: A SvelteKit + Tauri desktop application used for managing data/media.
- **Package Manager**: **Bun**. Don't use npm.

## Development Commands
All commands should be run using `bun`. 
- Run `admin.bat` in the repository root folder, which executes `bun run tauri dev` inside this `admin/` directory to start the Tauri desktop app.
- `admin.bat` launches the compiled release app when it is fresh; otherwise it falls back to `bun run tauri dev`.
- The debug log plugin has been removed (both `tauri-plugin-log`/`log` dependencies and setup). It previously panicked while opening its default file target on Windows. Don't reintroduce it just for logging without testing that path.
- If the Tauri window never appears even though `app.exe` is running, check `Microsoft-Windows-CodeIntegrity/Operational`: a tool that injects into every process (Windhawk in particular) can be blocked from loading its DLL into `msedgewebview2.exe`, which kills WebView2 and leaves Tauri with no renderable window. This is usually triggered by a **WebView2 runtime update**, not a Windhawk update (seen Oct 2026 after WebView2 155.0.4283.60 landed; Windhawk 1.7.3 had been unchanged since Dec 2025). Fix it by excluding `msedgewebview2.exe` from that tool's injection list; do **not** disable Memory Integrity, because WebView2’s own code-integrity guard is always enabled in current versions. This is a machine configuration issue, not app code.
- The frontend is Tauri-only. `isTauri()` in `src/lib/utils.ts` guards `safeInvoke`; opening the Vite URL in a normal browser shows a “Browser preview” banner and disables backend actions instead of throwing `window.__TAURI_INTERNALS__ is undefined`.
- **WebView2 data-folder integrity**: WebView2 155 requires `%LOCALAPPDATA%\com.sqrtnegativone.admin` to be **Low Mandatory Level**. Tauri creates it as Medium, which leaves the main window created but WebView2 unable to start (`ERROR_BUSY` / `FailedToReceiveMessage` / no `msedgewebview2.exe` children). `admin.bat` creates the folder and runs `icacls "%ADMIN_APP_DATA%" /setintegritylevel "(OI)(CI)Low"` before launching. If launching `target\debug\app.exe` or `target\release\app.exe` directly, run that command first. This is separate from the Windhawk/Code Integrity issue above.
- `EmptyState.svelte` wraps its action callback (`onclick={() => onaction?.()}`) so a `PointerEvent` is never passed as a title/name argument. Keep that wrapper.

## Coding Guidelines & Rules (Admin)
- **Svelte 5 Syntax**: This project uses Svelte 5. Use runes (`$state`, `$derived`, `$props`, `$effect`) instead of the legacy Svelte 4 `export let` or reactive statements (`$: `).
- **Tailwind v4**: We use TailwindCSS v4. Stick to utility classes and utilize `@theme` in your CSS if necessary instead of relying on a `tailwind.config.js` file.
- **Error Handling**: Use neverthrow over try and catch statements. When working in the admin app, always utilize the centralized `neverthrow` wrappers (`safeInvoke`, `safeJsonParse`, `safeUrlParse`, etc.) exported from `src/lib/utils.ts` to maintain clean, functional `ResultAsync` pipelines.
- **Data Collections & Publishing**:
  - Always use `readData` and `writeData` from `$lib/db`. Never write raw Tauri `read_file` / `write_file` calls for content collections (this ensures `gitState.refresh()` runs automatically and the path mapping stays consistent).
  - All site data files are registered in `COLLECTIONS` in `$lib/db.ts` (`projects`, `skills`, `socials`, `quotes`, `media`, `mediaPrivate`, `mediaProperties`, `now`, `buttons`). Paths point into the owning app: CV content lives under `cv/`, site content under `site/`, and cross-app content under `shared/`. `socials` is shared (`shared/data/socials.json`) because both apps render it, filtered by each entry's `audience` (`personal` | `professional` | `both`). `now` is shared too (`shared/data/now.json`); each arc has an `audience` **array** (`['professional']`, `['personal']`, or both) instead of the single socials value. For markdown/raw content documents (e.g. `site/src/data/questions.md`), use `readQuestions()` / `writeQuestions()` or `readTextFile()` / `writeTextFile()` from `$lib/db.ts` to ensure git tracking refreshes automatically.
  - **Adding a new content page**:
    1. Store its data in the owning app's data dir, `site/src/data/<page>.json` or `cv/src/data/<page>.json`, the equivalent `<page>.md`, or `shared/data/<page>.json` if both apps render it.
    2. Register it in `COLLECTIONS` in `admin/src/lib/db.ts` (e.g. `now: 'shared/data/now.json'`).
    3. Use `readData('<page>')` and `writeData('<page>', items)` in your admin routes.
    4. The backend automatically detects `site/src/data/*.json`, `cv/src/data/*.json`, `shared/data/*.json` (and their `.md` siblings) as content, generates `content(<page>): update <page>`, and commits/publishes it seamlessly without any manual git steps.

## Arcs (`/now`)
- The `/now` admin page edits `shared/data/now.json` as `NowArc[]`: `id`, `title`, `startDate`, optional `endDate` (`YYYY-MM-DD`), `audience` (`ArcAudience[]`), Markdown `description`, optional `updatedAt`.
- Validation: valid start date; if an end date is provided it must be valid and `endDate >= startDate`; at least one audience; non-empty description. **A blank end date is valid and means the arc is open-ended/ongoing.** New ids come from `uniqueSlug(title, …, 'arc')`; editing keeps the existing id.
- The list shows derived status (`ongoing`/`upcoming`/`past`/`invalid`) and audience chips; only **ongoing** arcs reach either public `/now` page. Changing dates can therefore remove an arc from a deployed page after the next build.
- The admin nav labels the route **Now** (not “Arcs”; that’s the data model). The keyboard cheat sheet calls it “Save the current entry”. The CV site deliberately never uses the word “arc” in visible copy (it says “focus areas”), so do not leak that label into CV-facing data or UI.
- `shared/data` is included in `is_content_path()` and `CONTENT_ROOTS` in `admin/src-tauri/src/lib.rs`, so changes to `shared/data/now.json` and `shared/data/socials.json` are visible as content and staged by `git_commit_content`. Default commit messages map them to `content(arcs): update arcs` and `content(socials): update socials`. Add any new shared data file/directory to both Rust lists as well as `COLLECTIONS`.

## Messages (Remote D1)
- The `/messages` page is the one admin route that does **not** read local repo files; it reads the live Cloudflare **D1** database behind the site's contact form.
- It talks to the `d1_query` Tauri command (`admin/src-tauri/src/lib.rs`), which shells out to `bun x wrangler d1 execute sqrt-fyi-messages --remote --json` from `site/`. This deliberately reuses the developer's existing `wrangler login` instead of storing a Cloudflare API token in the app.
- Use the helpers in `$lib/d1.ts` (`listMessages`, `deleteMessage`, `d1Query`) rather than calling `d1_query` directly. Wrangler/Bun must be on `PATH`; if not, the page reports a backend error.
- **Unread badge**: D1 has no per-message read flag, so `$lib/messageReadState.svelte.ts` keeps a local watermark (highest seen message id) in `localStorage` under `admin.messages.lastReadId` and asks D1 for `COUNT(*) WHERE id > watermark`. The layout refreshes it on mount/window focus (throttled, silent on failure) and renders a rose count pill next to the Messages nav item (desktop sidebar + mobile drawer, plus the dashboard card); opening `/messages` calls `markRead()` with the newest id, which clears the badge. Clearing the `messages` table also requires clearing that key (AUTOINCREMENT would restart ids below the watermark).
- Schema lives in `site/migrations/`; see the root `AGENTS.md` for the D1 binding and migration commands.
- **Reply details**: senders can pick a channel (`email`, `whatsapp`, `phone`, `sms`, `discord`, `linkedin`, `steam` — see `shared/data/contactMethods.ts`) and leave a handle. `listMessages` selects `*` so the page still works before `0002_add_contact_details.sql` is applied remotely, and `MessageCard` renders a rose chip with the method icon, a link when the handle is linkable, and the raw handle otherwise.

