<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';

  const fonts = [
    {
      name: 'Inter',
      designer: 'Rasmus Andersson',
      classification: 'Neo-grotesque Sans-Serif',
      sample: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789',
      usage: 'Primary user interface, body copy, and layout text',
      fontFamily: '"Inter", sans-serif',
      weights: '400, 500, 600, 700'
    },
    {
      name: 'Instrument Serif',
      designer: 'Instrument & Jordan Bell',
      classification: 'Modern Editorial Serif',
      sample: 'There are cathedrals in construction everywhere.',
      usage: 'Headings, hero titles, essay headers, and prominent quotes',
      fontFamily: '"Instrument Serif", Georgia, serif',
      weights: '400, Italic'
    },
    {
      name: 'IBM Plex Mono',
      designer: 'Mike Abbink & Bold Monday',
      classification: 'Engineered Monospace',
      sample: 'const phi = (1 + Math.sqrt(5)) / 2; // 1.6180339887',
      usage: 'Code snippets, timestamps, metadata, navigation labels, and UI coordinates',
      fontFamily: '"IBM Plex Mono", monospace',
      weights: '300, 400'
    },
    {
      name: 'PT Sans Narrow',
      designer: 'ParaType',
      classification: 'Condensed Humanist Sans',
      sample: 'COMPACT DISPLAY HEADINGS & CONDENSED DATA LABELS',
      usage: 'High-density cards, media badges, and compact tabular data',
      fontFamily: '"PT Sans Narrow", sans-serif',
      weights: '400, 700'
    },
    {
      name: 'Datatype',
      designer: 'Morgan Knebel',
      classification: 'Bitmap / Terminal Monospace',
      sample: 'QUESTIONS::: PUZZLES & UNSOLVED CURIOSITIES',
      usage: 'Questions page, terminal aesthetic sections, and raw computing artifacts',
      fontFamily: '"Datatype", ui-monospace, monospace',
      weights: '400'
    }
  ];

  const techStack = [
    {
      category: 'Framework & Core',
      items: [
        { name: 'SvelteKit 2', desc: 'Full-stack meta-framework generating static assets via adapter-static' },
        { name: 'Svelte 5', desc: 'Fine-grained reactive primitives via modern Runes ($state, $derived, $effect)' },
        { name: 'TypeScript', desc: 'Strict static type safety across data collections and components' },
        { name: 'Bun', desc: 'Ultra-fast JavaScript runtime and package manager used for dev and builds' }
      ]
    },
    {
      category: 'Styling & Design',
      items: [
        { name: 'Tailwind CSS v4', desc: 'Utility-first CSS engine utilizing native @theme configuration' },
        { name: 'OKLCH Color Space', desc: 'Perceptually uniform color palettes for crisp dark-mode contrast' },
        { name: 'CSS Grid Layout', desc: 'Viewport-locked responsive layout with frame boundaries and scanlines' },
        { name: 'Self-Hosted Fonts', desc: 'Zero third-party CDN requests; all typography loaded via @fontsource' }
      ]
    },
    {
      category: 'Content & Visuals',
      items: [
        { name: 'Velite', desc: 'Type-safe content collection pipeline converting Markdown into Zod-validated JSON' },
        { name: 'OGL & Shaders', desc: 'Minimal WebGL library powering the 3D Thomas Attractor and halftone shaders' },
        { name: 'ASCII Canvas', desc: 'Procedural character-matrix noise rendered dynamically via requestAnimationFrame' },
        { name: 'AT Protocol / XRPC', desc: 'Direct client integration with Bluesky API for the live microblog stream' }
      ]
    },
    {
      category: 'Tooling & Ops',
      items: [
        { name: 'Tauri 2 & Rust', desc: 'Local desktop administration app for content authoring and media tracking' },
        { name: 'neverthrow', desc: 'Type-safe functional error handling ResultAsync pipelines across admin app' },
        { name: 'Feed & Sitemap', desc: 'Automated Atom 1.0 feed (feed.xml), XML sitemap, and machine-readable llms.txt' },
        { name: 'GitHub Pages', desc: 'Hosted statically on GitHub Pages edge servers with custom domain sqrt.fyi' }
      ]
    }
  ];
</script>

<Seo
  title="Colophon — Ark Malhotra"
  description="How this site is built: the technical architecture, typography, tools, and inspirations behind sqrt.fyi."
  path="/colophon"
/>

<div class="colophon-container">
  <!-- Page Header -->
  <header class="colophon-header">
    <div class="header-tag">
      <span class="tag-accent">//</span>
      <span class="tag-title">SITE ARCHITECTURE & SPECIFICATION</span>
    </div>
    <h1 class="colophon-title">colophon</h1>
    <p class="colophon-lead">
      This colophon details the craftsmanship, technical foundation, typography, and design ethos behind <strong>sqrt.fyi</strong>. Designed and built from scratch by Ark Malhotra.
    </p>
  </header>

  <!-- Principles Section -->
  <section class="section-block" aria-labelledby="principles-heading">
    <div class="section-header">
      <span class="section-index">01</span>
      <h2 id="principles-heading" class="section-title">Design Philosophy</h2>
    </div>

    <div class="principles-grid">
      <div class="principle-card">
        <h3 class="principle-name">Tactile Brutalism</h3>
        <p class="principle-desc">
          Inspired by early computing aesthetics, oscilloscope phosphor screens, and terminal interfaces. High-contrast monochromatic typography paired with subtle procedural noise and CRT scanline textures.
        </p>
      </div>

      <div class="principle-card">
        <h3 class="principle-name">Static & Instantaneous</h3>
        <p class="principle-desc">
          Every route on the site is fully prerendered at build time. Zero runtime database waterfalls, zero hydration overhead for content reading, and instantaneous page navigation.
        </p>
      </div>

      <div class="principle-card">
        <h3 class="principle-name">Zero Trackers & Private</h3>
        <p class="principle-desc">
          No Google Analytics, no tracking pixels, no advertising scripts, and zero third-party font CDNs. All assets and dependencies are self-hosted to respect visitor privacy.
        </p>
      </div>

      <div class="principle-card">
        <h3 class="principle-name">Accessibility First</h3>
        <p class="principle-desc">
          Full compliance with <code class="code-inline">prefers-reduced-motion</code> across all CSS transitions and WebGL shaders. Keyboard navigable command palette menu, semantic landmarks, and skip-to-content links.
        </p>
      </div>
    </div>
  </section>

  <!-- Typography Section -->
  <section class="section-block" aria-labelledby="typography-heading">
    <div class="section-header">
      <span class="section-index">02</span>
      <h2 id="typography-heading" class="section-title">Typography & Font Specimens</h2>
    </div>
    <p class="section-intro">
      Typography is the backbone of this site's identity. Every typeface is bundled locally via <code class="code-inline">@fontsource</code> to eliminate third-party dependencies and optimize font loading performance.
    </p>

    <div class="fonts-stack">
      {#each fonts as font (font.name)}
        <div class="font-card">
          <div class="font-meta">
            <div class="font-name-wrap">
              <span class="font-name" style="font-family: {font.fontFamily};">{font.name}</span>
              <span class="font-designer">Designed by {font.designer}</span>
            </div>
            <div class="font-tags">
              <span class="font-pill">{font.classification}</span>
              <span class="font-pill font-mono-pill">{font.weights}</span>
            </div>
          </div>

          <div
            class="font-specimen"
            style="font-family: {font.fontFamily};"
            aria-label="{font.name} sample text"
          >
            {font.sample}
          </div>

          <p class="font-usage">
            <span class="usage-label">Application:</span> {font.usage}
          </p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Technical Architecture -->
  <section class="section-block" aria-labelledby="tech-heading">
    <div class="section-header">
      <span class="section-index">03</span>
      <h2 id="tech-heading" class="section-title">Technical Stack</h2>
    </div>

    <div class="tech-grid">
      {#each techStack as group (group.category)}
        <div class="tech-category-card">
          <h3 class="tech-category-title">{group.category}</h3>
          <ul class="tech-items-list">
            {#each group.items as item (item.name)}
              <li class="tech-item">
                <span class="tech-item-name">{item.name}</span>
                <span class="tech-item-desc">{item.desc}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </section>

  <!-- Syndication & Machine Readability -->
  <section class="section-block" aria-labelledby="syndication-heading">
    <div class="section-header">
      <span class="section-index">04</span>
      <h2 id="syndication-heading" class="section-title">Open Web & Syndication</h2>
    </div>

    <div class="syndication-grid">
      <div class="syndication-item">
        <div class="syndication-top">
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href="/feed.xml" class="syndication-link" target="_blank" rel="noopener noreferrer">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.18 15.64a2.18 2.18 0 1 1-4.36 0 2.18 2.18 0 0 1 4.36 0zm-4.36-9.82v3.08a11.1 11.1 0 0 1 11.1 11.1h3.08A14.18 14.18 0 0 0 1.82 5.82zm0-4v3.08A18.28 18.28 0 0 1 20.1 20.1h3.08A21.36 21.36 0 0 0 1.82 1.82z" />
            </svg>
            <span>/feed.xml</span>
          </a>
          <span class="syndication-badge">Atom 1.0</span>
        </div>
        <p class="syndication-desc">
          Full Atom feed generated during build for RSS readers, containing the full HTML body of all public essays.
        </p>
      </div>

      <div class="syndication-item">
        <div class="syndication-top">
          <a href="/llms.txt" class="syndication-link" target="_blank" rel="noopener noreferrer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>/llms.txt</span>
          </a>
          <span class="syndication-badge">LLMs Index</span>
        </div>
        <p class="syndication-desc">
          Structured markdown index providing LLM agents and AI crawlers with clean site context and concise links.
        </p>
      </div>

      <div class="syndication-item">
        <div class="syndication-top">
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href="/sitemap.xml" class="syndication-link" target="_blank" rel="noopener noreferrer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>/sitemap.xml</span>
          </a>
          <span class="syndication-badge">XML Sitemap</span>
        </div>
        <p class="syndication-desc">
          Automatically compiled sitemap mapping all standard routes, blog articles, and individual daily now logs.
        </p>
      </div>

      <div class="syndication-item">
        <div class="syndication-top">
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href="/microblog" class="syndication-link">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
            </svg>
            <span>/microblog</span>
          </a>
          <span class="syndication-badge">AT Protocol</span>
        </div>
        <p class="syndication-desc">
          Live stream connected directly to Bluesky (@sqrt-1.bsky.social) via decentralized AT Protocol XRPC calls.
        </p>
      </div>
    </div>
  </section>

  <!-- Colophon Footer Note -->
  <footer class="colophon-footer">
    <div class="footer-meta">
      <span class="footer-tag">sqrt.fyi colophon</span>
      <span class="footer-dot">•</span>
      <span>Engineered in New Delhi, India</span>
      <span class="footer-dot">•</span>
      <a
        href="https://github.com/SqrtNegativOne/sqrtnegativone.github.io"
        target="_blank"
        rel="noopener noreferrer"
        class="github-source-link"
      >
        View Source on GitHub
      </a>
    </div>
  </footer>
</div>

<style>
  .colophon-container {
    max-width: 54rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding-bottom: 3.5rem;
    width: 100%;
  }

  /* Header */
  .colophon-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    padding-bottom: 2rem;
  }

  .header-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    color: var(--text-secondary);
  }

  .tag-accent {
    color: oklch(0.8 0.15 220);
    font-weight: bold;
  }

  .colophon-title {
    font-weight: 500;
    font-size: 3.5rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--text);
    margin: 0.25rem 0;
  }

  .colophon-lead {
    font-size: 1.15rem;
    line-height: 1.6;
    color: var(--text-secondary);
    max-width: 44rem;
  }

  .colophon-lead strong {
    color: var(--text);
    font-weight: 600;
  }

  /* Section blocks */
  .section-block {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    padding-bottom: 0.75rem;
  }

  .section-index {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: oklch(0.8 0.15 220);
    letter-spacing: 0.1em;
  }

  .section-title {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.95rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text);
    font-weight: 600;
    margin: 0;
  }

  .section-intro {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
  }

  .code-inline {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85em;
    background: oklch(1 0 0 / 0.07);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    color: var(--text);
  }

  /* Principles Grid */
  .principles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .principle-card {
    padding: 1.25rem;
    background: oklch(0.12 0 0 / 0.6);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .principle-name {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }

  .principle-desc {
    font-size: 0.88rem;
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0;
  }

  /* Typography Specimens */
  .fonts-stack {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .font-card {
    padding: 1.5rem;
    background: oklch(0.12 0 0 / 0.6);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .font-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .font-name-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .font-name {
    font-size: 1.5rem;
    color: var(--text);
    line-height: 1.2;
  }

  .font-designer {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    color: var(--text-secondary);
  }

  .font-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .font-pill {
    font-size: 0.72rem;
    padding: 0.2rem 0.55rem;
    border-radius: 9999px;
    background: oklch(1 0 0 / 0.05);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.1));
    color: var(--text-secondary);
  }

  .font-mono-pill {
    font-family: "IBM Plex Mono", monospace;
  }

  .font-specimen {
    font-size: 1.6rem;
    line-height: 1.35;
    color: var(--text);
    padding: 1rem 0;
    border-top: 1px solid var(--glass-border, oklch(1 0 0 / 0.06));
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.06));
    word-break: break-word;
  }

  .font-usage {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.45;
  }

  .usage-label {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text);
    letter-spacing: 0.05em;
  }

  /* Technical Stack Grid */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.25rem;
  }

  .tech-category-card {
    padding: 1.25rem;
    background: oklch(0.12 0 0 / 0.6);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tech-category-title {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: oklch(0.8 0.15 220);
    margin: 0;
    font-weight: 600;
  }

  .tech-items-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .tech-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .tech-item-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
  }

  .tech-item-desc {
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--text-secondary);
  }

  /* Syndication Grid */
  .syndication-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .syndication-item {
    padding: 1.25rem;
    background: oklch(0.12 0 0 / 0.6);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .syndication-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .syndication-link {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
    color: var(--text);
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .syndication-link:hover {
    color: oklch(0.8 0.15 220);
    text-decoration: underline;
  }

  .syndication-badge {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.65rem;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    background: oklch(1 0 0 / 0.05);
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .syndication-desc {
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0;
  }

  /* Footer */
  .colophon-footer {
    border-top: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    padding-top: 1.5rem;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .footer-tag {
    color: var(--text);
    font-weight: 500;
  }

  .footer-dot {
    opacity: 0.4;
  }

  .github-source-link {
    color: var(--text-secondary);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .github-source-link:hover {
    color: var(--text);
  }

  @media (max-width: 640px) {
    .colophon-title {
      font-size: 2.5rem;
    }
    .font-specimen {
      font-size: 1.25rem;
    }
  }
</style>
