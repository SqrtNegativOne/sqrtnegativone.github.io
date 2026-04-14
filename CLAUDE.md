# Project: Ark Malhotra — Personal Website

## Stack

- **Frontend (SPA):** React 19 + Vite — handles `/`, `/skills`, `/projects`, `/contact`
- **Blog:** 11ty (Eleventy) v3 — generates static HTML for `/blog/`, `/blog/afterdark/`, individual posts
- **Styling:** Plain CSS (no Tailwind, no CSS-in-JS). CSS variables for theming.
- **Fonts:** Instrument Serif (name heading, blog title), Inter (body), IBM Plex Mono (UI labels, toggle), IBM Plex Sans (commented-out carousel option)

## Project Structure

```
src/                    # React SPA source
  main.jsx              # Entry point, BrowserRouter
  App.jsx               # Layout shell: grid, routing, portrait visibility
  App.css               # Page layout, grid, responsive breakpoints
  index.css             # Reset, theme vars, cursor, border frame, toggle
  components/
    Navbar.jsx/css       # Top-right pill nav (no Blog link)
    HeroName.jsx         # Name display (font carousel commented out)
    Bio.jsx              # About page
    Skills.jsx/css       # Skills grid (no intro text, no portrait)
    Projects.jsx/css     # Projects (no portrait)
    Contact.jsx/css      # Contact info
    Quote.jsx            # Rotating quote component
    ThemeToggle.jsx      # Light/dark toggle on left border
    Cursor.jsx           # Custom inverted-circle cursor
    Blog.jsx/css         # UNUSED — blog now handled by 11ty
    DitheredImage.jsx    # Canvas Bayer dithering utility

blog/                   # 11ty source (input)
  _includes/
    base.njk             # Full HTML layout with "the BLOG" split design
    post.njk             # Single post layout (extends base)
  posts/
    posts.json           # Directory data: layout, tags, permalink
    *.md                 # Published blog posts
  afterdark/
    afterdark.json       # Directory data for draft/unpublic posts
    index.njk            # Afterdark listing page
    *.md                 # Draft posts
  index.njk              # Blog listing page

public/blog/            # 11ty output (gitignored, built artifact)
eleventy.config.js      # 11ty config
```

## Commands

- `npm run dev` — builds blog then starts Vite dev server
- `npm run build` — builds blog then runs Vite production build
- `npm run blog:build` — runs 11ty only
- `npm run blog:watch` — runs 11ty in watch mode (for blog-only dev)

## Design Conventions

- Dark theme by default (`data-theme="dark"` on `<html>`)
- Decorative border frame via `body::before` (`inset: 40px`, `16px` on mobile)
- Portrait is hidden on `/skills` and `/projects` routes
- Blog has its own full-page layout (no React shell): "the BLOG" on left, vertical divider, content on right
- Custom cursor: inverted circle (`mix-blend-mode: difference`), expands on interactive elements, hidden on touch devices

## Important Notes

- `public/blog/` is gitignored — always run `npm run blog:build` after editing blog posts
- Blog posts are Markdown files in `blog/posts/`. Afterdark drafts go in `blog/afterdark/`.
- The Blog React component (`src/components/Blog.jsx`) is no longer used — blog is served as static 11ty HTML
- Font carousel in HeroName is commented out but preserved for future re-enablement
