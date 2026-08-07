## Tech Stack Overview
- **Main Website**: Built with [SvelteKit](https://svelte.dev/) (Svelte 5) and styled using [Tailwind CSS v4](https://tailwindcss.com/).
- **Blog Engine**: The blog is statically generated using [Eleventy (11ty)](https://www.11ty.dev/). Markdown files are in the `blog/` directory and compiled into the `static/` folder where SvelteKit serves them.
- **Admin Dashboard**: A separate SvelteKit application located in the `admin/` directory.
- **Package Manager**: **Bun**. Don't use npm.

## Repository Structure
- `src/` - The main SvelteKit application source (components, routes, styles).
- `blog/` - Markdown files (`*.md`) for blog posts.
- `static/` - Static assets. Eleventy outputs the compiled blog HTML here.
- `admin/` - The admin dashboard (a distinct SvelteKit app for managing data/media).
- `eleventy.config.js` - Configuration for the Eleventy blog engine.
- `admin.bat` / `dev.bat` - Scripts for running local dev servers.

## Development Commands
All commands should be run using `bun`. 

**Main Site Commands (Run in Root):**
- `bun run dev` - Builds the eleventy blog and starts the Vite dev server for the main site.
- `bun run build` - Builds both eleventy and the main site for production.
- `bun run lint` - Runs `oxlint` for fast linting.
- `bun run check` - Runs SvelteKit sync and `svelte-check` for type-checking and accessibility (a11y) checks.

**Admin App Commands (Run inside `admin/`):**
- `bun run dev` - Starts the admin Vite dev server.

## Coding Guidelines & Rules
- **Svelte 5 Syntax**: This project uses Svelte 5. Use runes (`$state`, `$derived`, `$props`, `$effect`) instead of the legacy Svelte 4 `export let` or reactive statements (`$: `).
- **Tailwind v4**: We use TailwindCSS v4. Stick to utility classes and utilize `@theme` in your CSS if necessary instead of relying on a `tailwind.config.js` file.
- **Accessibility (a11y)**: Svelte's a11y checks are enforced. Ensure `<button>` elements have text or `aria-label`s, `<label>` elements correctly wrap or point to inputs (`for="..."`/`id="..."`), and interactive elements have appropriate keyboard event handlers or roles.
- **Component Scoped Styling**: For dynamically injected HTML (like the eleventy blog posts via `{@html ...}`), use `:global(.class)` in Svelte `<style>` blocks to avoid unused CSS warnings and properly style the injected markup.