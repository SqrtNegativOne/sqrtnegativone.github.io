# Plan: split the repo into two static SvelteKit apps (`site/` + `cv/`)

**Handoff doc — give this whole file to a fresh agent.** It contains all decisions already
made; do not re-litigate them. Execute the phases in order, committing after each phase.

---

## 0. Decisions already made (do not revisit)

- **Two independent SvelteKit apps in one repo**, no Bun workspace, no shared npm package.
  - `cv/`  → deployed to **`cv.sqrt.fyi`** — only: home (`/`), `/about`, `/projects`, `/skills`.
  - `site/` → deployed to **`sqrt.fyi`** — everything else: `/main` (intentionally ugly page),
    blog, blog-afterdark, microblog, now, minis, questions, media-library, colophon,
    `feed.xml`, `sitemap.xml`, `robots.txt`, `llms.txt`.
- **Hosting is Cloudflare Workers with static assets** (the repo already has this staged).
  Two Workers, two `wrangler.jsonc`, two custom domains. All pages stay **prerendered/static**.
- **`sqrt.fyi/` redirects to `cv.sqrt.fyi` via a client-side script** (no server redirect).
  This is intentional and compatible with static hosting. The `site/` app's `/` is a static
  redirect stub.
- **Root `shared/` stays** as the cross-app code location, imported via a `$shared` alias.
  Only genuinely-shared visual primitives live there. A *little* duplication is acceptable
  (per-app boilerplate + design-system static assets).
- **`blog/` content moves to `site/blog/`** (it belongs to the app that renders it).
- Stack rules from the repo's `AGENTS.md` still apply: Svelte 5 runes, Tailwind v4,
  a11y checks, `prefers-reduced-motion` gating, Bun only.

## 1. Target layout

```
/
  AGENTS.md                     # update to describe two apps
  shared/                       # cross-app code (existing + moved-in primitives)
    components/                 # FilterSort, LibraryRow, RatingChart, StatusBadge, TypeBadge,
                                #   Cursor, Seo, AsciiBackground, NotFound, MenuOverlay
    icons.ts  types.ts  utils/
  cv/                           # SvelteKit app -> cv.sqrt.fyi
    package.json  bun.lock  svelte.config.js  vite.config.js  tsconfig.json
    wrangler.jsonc
    src/{app.html, app.css, index.css, routes/, components/, lib/, data/, stores/}
    static/{fonts, vendor, fonts.css, portraits, projects, quotes, logos, icons*,
            favicon*, apple-touch-icon.png, manifest.webmanifest, robots.txt, .well-known}
  site/                         # SvelteKit app -> sqrt.fyi
    package.json  bun.lock  svelte.config.js  vite.config.js  tsconfig.json
    velite.config.ts  wrangler.jsonc
    blog/{posts,_data}
    src/{app.html, index.css, routes/, components/, lib/, data/}
    static/{blog-images, media, velite, fonts, vendor, fonts.css, icons*,
            favicon*, apple-touch-icon.png, manifest.webmanifest, robots.txt, llms.txt,
            .well-known}
  admin/                        # Tauri app; path assumptions updated (Phase 6)
  .github/workflows/deploy-site.yml  deploy-cv.yml
```

Each app owns its own `package.json`, `bun.lock`, `svelte.config.js`, `vite.config.js`,
`tsconfig.json`, `wrangler.jsonc`, `.svelte-kit/`, `build/`. Run `bun install` in each.

## 2. Ownership map (authoritative)

### Routes
| cv/ | site/ |
|---|---|
| `/`, `/about`, `/projects`, `/skills` | `/` (redirect stub), `/main`, `/blog`, `/blog-afterdark`, `/microblog`, `/now`, `/now/[date]`, `/minis`, `/questions`, `/questions.md`, `/media-library`, `/colophon`, `/feed.xml`, `/sitemap.xml` |

### Components
- **`shared/` (single copy):** `Cursor.svelte`, `Seo.svelte`, `AsciiBackground.svelte`,
  `NotFound.svelte`, `MenuOverlay.svelte`.
- **`cv/` only:** `PortfolioLayout.svelte`, `HalftoneImage.svelte`, `HeroName.svelte`,
  `Quote.svelte`, `ThomasAttractor.svelte`, `visualizations/`, `routes/SocialIcons.svelte`,
  `stores/quote.svelte.js`.
- **`site/` only:** `ComingSoon.svelte`, blog engine (`src/lib/blog.ts`, `src/lib/content/`),
  `src/lib/now.ts`, `media-library/` subtree.
- `DitheredImage.svelte` is unused — delete it during the move.
- `MenuOverlay.svelte` must be refactored to take an `items` prop (default `NAV_ITEMS`
  stays in each app). Do **not** duplicate it.
  - cv items: Home, Projects, About, Skills (+ optional external link back to `sqrt.fyi`).
  - site items: Blog, Now, Microblog, Minis, Media Library, Questions, Colophon
    (+ optional external link to `cv.sqrt.fyi`).

### Data
- **cv:** `projects.json`, `skills.json`, `socials.json`, `quotes.js`.
- **site:** `now.json`, `questions.md`.
- **Trace before deciding** (`quotes.js` is read by the CV quote store *and* the site's
  colophon page — if it truly crosses, move it to `shared/data/`):
  ```bash
  grep -rn "data/quotes\|data/now\|data/socials\|data/skills\|data/projects" cv site
  ```

### Static assets
- **cv:** `portraits/`, `projects/`, `quotes/`, `logos/`, `thomas-test.html`
- **site:** `blog-images/`, `media/` (13 MB — never copy to cv), `velite/`
- **both (duplicate, ≈0.9 MB):** `fonts/`, `fonts.css`, `vendor/`, `icons/`, `icons.svg`,
  `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `manifest.webmanifest`,
  `.well-known/security.txt`
- `CNAME` is GitHub Pages-specific → **delete**, Cloudflare handles domains.
- Verify no asset is orphaned after the split:
  ```bash
  grep -rn "portraits/\|/media/\|/blog-images\|/velite\|/projects/\|/quotes/\|/logos/\|/icons" \
    cv/src site/src | sort
  ```
- `robots.txt` differs per host: cv gets a minimal allow-list; site keeps the current file
  with its `Sitemap: https://sqrt.fyi/sitemap.xml`.

## 3. Phase-by-phase execution

### Phase 0 — branch + baseline
```bash
git checkout -b restructure-split
bun run check && bun run build     # confirm green before touching anything
```

### Phase 1 — move the current app into `site/`
Use `git mv` to preserve history. Move: `src/`, `static/`, `blog/`, `svelte.config.js`,
`vite.config.js`, `tsconfig.json`, `velite.config.ts`, and copy the lint/format configs
(`eslint.config.js`, `.oxlintrc.json`, `.oxlintignore`, `.prettierrc`) into `site/`.
Create `site/package.json` from the current root `package.json` with `"name": "site"`.
Then update `.gitignore` to ignore per-app artifacts:
`site/.svelte-kit/`, `site/.velite/`, `site/build/`, `site/.wrangler/`, and the `cv/`
equivalents. Remove stale generated dirs (`build/`, `.svelte-kit/`, `.velite/`, `.cache/`).

Note: `velite.config.ts` uses `root: 'blog/posts'` and `output.data: 'src/lib/content'`
relative to the app — these stay correct after both `blog/` and the config land in `site/`.

### Phase 2 — create `cv/`
1. Scaffold a minimal SvelteKit app at `cv/`: `package.json` (name `cv`, deps needed by the
   CV pages: `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte`, `@sveltejs/adapter-cloudflare`,
   `svelte`, `vite`, `tailwindcss`, `@tailwindcss/vite`, `gsap`, `ogl`, `mouse-follower`,
   `culori`, `sharp`, the `@fontsource/*` fonts, `wrangler`, `@cloudflare/workers-types`,
   `eslint` stack, `typescript`, `svelte-check`).
2. Copy from `site/`: the route dirs `about/`, `projects/`, `skills/`, the root
   `+page.svelte` (home), plus `+layout.js`, `+layout.svelte`, `+error.svelte` — then
   **prune** the layout logic down to CV-only routes.
3. Copy the cv-only components/data listed in §2.
4. Copy the cv static assets listed in §2.

### Phase 3 — extract `shared/`
Move these from `site/src/components/` into `shared/components/`: `Cursor.svelte`,
`Seo.svelte`, `AsciiBackground.svelte` (verify it doesn't import site-only data first —
it currently lives with the site, so check its imports), `NotFound.svelte`,
`MenuOverlay.svelte`.
- Refactor `MenuOverlay` to accept `items` (see §2).
- Refactor `Seo.svelte` to accept a `base` prop (or read a per-app constant) so cv outputs
  `https://cv.sqrt.fyi/...` and site outputs `https://sqrt.fyi/...`.
- Rewrite **all** existing relative `shared/` imports (currently
  `../../../../shared/...` in `site/src/routes/media-library/...` and
  `site/src/actions/clickOutside.js`) to `$shared/...`.

### Phase 4 — wire `$shared` in both apps
In each app's `svelte.config.js`:
```js
kit: {
  alias: { $shared: '../shared' },
  adapter: adapter({ platformProxy: { persist: true } }),
  prerender: { entries: ['*', '/sitemap.xml', '/feed.xml'], handleUnseenRoutes: 'ignore' }
}
```
- SvelteKit generates the matching TS path in `.svelte-kit/tsconfig.json`.
- In each `vite.config.js` add `server: { fs: { allow: ['..'] } }` so Vite can read files
  outside the app root. Keep the velite plugin only in `site/vite.config.js`.
- Because `prerender` is `true`, `handleUnseenRoutes: 'ignore'` prevents the old
  `adapter-static` strictness from breaking the build. Drop `adapter-static` from deps.

### Phase 5 — redirect stub + `/main` (site only)
- Replace `site/src/routes/+page.svelte` with the redirect stub:
  ```svelte
  <svelte:head>
    <meta name="robots" content="noindex" />
    <title>redirecting…</title>
    <script>
      location.replace("https://cv.sqrt.fyi/");
    </script>
  </svelte:head>
  <p>Redirecting to <a href="https://cv.sqrt.fyi/">cv.sqrt.fyi</a>…</p>
  ```
- Add `site/src/routes/main/+page.svelte` — minimal, deliberately crude, default browser
  styles, no fonts/menu/cursor. It MUST keep `id="main-content"` (skip-link/a11y rule) and
  carry `<meta name="robots" content="noindex" />`.
- In `site/src/routes/+layout.svelte` add a bare branch so `/main` renders without the
  global `MenuOverlay`/`Cursor`:
  ```js
  const BARE_ROUTES = ['/main'];
  let isBare = $derived(BARE_ROUTES.includes(currentPath));
  ```
  and skip `<Cursor />` when `isBare`.
- Exclude `/main` from `site/src/routes/sitemap.xml/+server.js` and from `site/static/llms.txt`.
- On the CV side, the existing `/` home stays; no redirect logic needed there.

### Phase 6 — blog move + admin fixes
- `git mv blog site/blog` (or it already moved in Phase 1).
- Update the Tauri admin app's hard-coded paths:
  - `admin/src/routes/blogs/+page.ts`: `${root}/blog/posts` → `${root}/site/blog/posts`;
    `${root}/blog/_data/fonts.json` → `${root}/site/blog/_data/fonts.json`.
  - `admin/src/routes/blogs/+page.svelte` and `admin/src/routes/blogs/BlogModal.svelte`:
    `${root}/blog/posts/${id}` → `${root}/site/blog/posts/${id}`.
  - `admin/src/lib/gitState.svelte.ts`: `f.startsWith('blog/')` → `f.startsWith('site/blog/')`;
    `f.startsWith('static/blog-images')` → `f.startsWith('site/static/blog-images')`;
    `f.startsWith('src/data/projects')` → `cv/src/data/projects`; `f.startsWith('static/projects')`
    → `cv/static/projects`; `f.startsWith('static/quotes')` → `cv/static/quotes`;
    `f.startsWith('static/media')` → `site/static/media`; `src/data/skills`/`socials` → `cv/src/data/…`.
  - Re-grep `admin/src` for `root}/` and bare `blog/`, `static/`, `src/data/` prefixes and fix
    every hit.

### Phase 7 — canonical / SEO / machine-readable files
- `site`: canonical base `https://sqrt.fyi`; `sitemap.xml` already globs route files, so it
  will now naturally contain only site routes — verify `/main` is excluded.
- `cv`: add a `sitemap.xml` endpoint for the four routes (or omit and rely on the site).
- Update `site/static/llms.txt`, `site/src/app.html`, JSON-LD blocks, and `Seo` call sites so
  CV content never points at `sqrt.fyi`.
- Add a minimal `cv/static/robots.txt`.

### Phase 8 — Cloudflare config + CI
`site/wrangler.jsonc`:
```jsonc
{
  "name": "sqrt-fyi",
  "main": ".svelte-kit/cloudflare/_worker.js",
  "compatibility_date": "2026-09-11",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "binding": "ASSETS", "directory": ".svelte-kit/cloudflare" },
  "d1_databases": [{ "binding": "DB", "database_name": "sqrt-fyi",
                     "database_id": "REPLACE_WITH_D1_DATABASE_ID" }],
  "routes": [
    { "pattern": "sqrt.fyi", "custom_domain": true },
    { "pattern": "www.sqrt.fyi", "custom_domain": true }
  ]
}
```
`cv/wrangler.jsonc`: same shape, `"name": "sqrt-fyi-cv"`, no D1, route
`{ "pattern": "cv.sqrt.fyi", "custom_domain": true }`.

CI: delete `.github/workflows/deploy.yml` and the old root `deploy-cloudflare.yml`, add:
- `deploy-site.yml` — `working-directory: site`, `bun install`, `bun run build`,
  `cloudflare/wrangler-action@v3` with `command: deploy` and the site working dir.
- `deploy-cv.yml` — same for `cv`.
Both trigger on `push: branches: [main]` with a `paths` filter (`site/**`, `shared/**` vs
`cv/**`, `shared/**`), plus `workflow_dispatch`. Pass `apiToken`/`accountId` from the
existing secrets.

### Phase 9 — owner-only manual steps (do not attempt from CI)
1. Move the `sqrt.fyi` zone onto Cloudflare nameservers; delete GitHub Pages A records and
   the old `cv`/`www` records.
2. Create the D1 database (`bunx wrangler d1 create sqrt-fyi`) and paste the real id into
   `site/wrangler.jsonc`.
3. Confirm repo secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
4. Disable GitHub Pages in repo settings.
Custom domains are created automatically on first `wrangler deploy`.

### Phase 10 — verification
```bash
(cd cv   && bun install && bun run check && bun run build && bunx wrangler dev)
(cd site && bun install && bun run check && bun run build && bunx wrangler dev)
```
Checklist:
- [ ] `cv/` build output contains only `/`, `/about`, `/projects`, `/skills` (+ assets).
- [ ] `site/` build output has no CV routes; `/` is the redirect stub; `/main` is ugly,
      bare (no menu/cursor), has `#main-content`, and is `noindex`.
- [ ] `bun run lint` passes in both; no `svelte-check` a11y errors.
- [ ] Skip link `#main-content` exists in every layout branch of both apps.
- [ ] JS-driven animations are gated on `prefers-reduced-motion` (cursor, ascii, gsap).
- [ ] `site/static/llms.txt` and `sitemap.xml` reflect the split; canonical URLs are correct
      per host.
- [ ] `grep -rn "sqrt.fyi" cv/src` shows only CV URLs; `grep -rn "cv.sqrt.fyi" site/src`
      shows only intentional links.
- [ ] Admin app still opens blog posts (verify paths after Phase 6).
- [ ] Update root `AGENTS.md` to document the two-app structure and new commands.

## 4. Known gotchas
1. **`adapter-cloudflare` serves prerendered assets straight from `env.ASSETS`, bypassing
   SvelteKit hooks** (`node_modules/@sveltejs/adapter-cloudflare/files/worker.js`). The
   client-side redirect avoids this entirely — do not "fix" it by making `/` dynamic.
2. **`shared/` is outside each app root.** Without `server.fs.allow: ['..']` dev may refuse to
   serve it; `kit.alias` alone isn't enough for Vite's file server.
3. **Never copy `site/static/media` (13 MB) into `cv/`.**
4. **Two lockfiles.** `bun install` separately in each app; the old root `bun.lock` goes away.
5. **Admin path coupling** is the easiest thing to forget — Phase 6 has the full list.
6. `settings`/`lastmod`: `sitemap.xml` reads post frontmatter dates; keep velite output path
   (`src/lib/content`) intact.
