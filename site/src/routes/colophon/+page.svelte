<script lang="ts">
  import Seo from '$shared/components/Seo.svelte';

  import '@fontsource/silkscreen/400.css';
  import '@fontsource/vt323/400.css';
</script>

<Seo
  title="Colophon — Ark Malhotra"
  description="How sqrt.fyi is built: the type, the stack, and the choices behind it."
  path="/colophon"
/>

<main class="colophon">
  <h1 class="title">colophon</h1>

  <p class="lede">
    sqrt.fyi is a personal site by Ark Malhotra. A blog, a media log, and
    assorted things. Built from scratch and kept deliberately small.
  </p>

  <section>
    <h2>design</h2>
    <p>
      Plain text, high contrast, dark. Nothing loads unless it earns its
      place. Pages are prerendered at build time, so navigation is instant
      and there is no database behind any of it. Motion is kept quiet and
      turned off entirely when your system asks for reduced motion.
    </p>
    <p>
      No analytics, no trackers, no ads, no third-party requests. Fonts and
      assets are self-hosted.
    </p>
  </section>

  <section>
    <h2>type</h2>
    <p>
      The pixel fonts you are reading now, Silkscreen and VT323, set the tone
      on this page and on the unlisted <a href="/main">/main</a> index. The
      rest of the site uses Inter, Instrument Serif, IBM Plex Mono, and PT
      Sans Narrow, all bundled locally.
    </p>
  </section>

  <section>
    <h2>stack</h2>
    <p>
      SvelteKit and Svelte 5 with TypeScript, styled with Tailwind CSS v4 and
      built with Bun. Posts are Markdown run through Velite. The whole thing
      is served as static assets from a Cloudflare Worker. The media library
      is tracked in a local Tauri app.
    </p>
  </section>

  <section>
    <h2>feeds &amp; files</h2>
    <ul class="links">
      <li><a href="/feed.xml">/feed.xml</a> — Atom 1.0 feed</li>
      <li><a href="/sitemap.xml">/sitemap.xml</a> — XML sitemap</li>
      <li><a href="/llms.txt">/llms.txt</a> — plain-text index for language models</li>
    </ul>
  </section>

  <section>
    <h2>source</h2>
    <p>
      <a
        href="https://github.com/SqrtNegativOne/sqrtnegativone.github.io"
        target="_blank"
        rel="noopener noreferrer">github.com/SqrtNegativOne/sqrtnegativone.github.io</a
      >
    </p>
  </section>

  <footer>
    <p>Engineered in New Delhi, India.</p>
    <p>&copy; Ark Malhotra</p>
  </footer>
</main>

<style>
  .colophon {
    max-width: 42rem;
    font-family: "VT323", "Courier New", monospace;
    font-size: 1.3rem;
    line-height: 1.5;
    color: var(--text);
  }

  .title {
    margin: 0 0 1rem;
    font-family: "Silkscreen", "VT323", monospace;
    font-size: clamp(1.75rem, 6vw, 3rem);
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .lede {
    margin: 0 0 2.5rem;
    color: var(--text-secondary);
  }

  section {
    margin-bottom: 2.25rem;
  }

  h2 {
    margin: 0 0 0.35rem;
    font-family: "Silkscreen", "VT323", monospace;
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text);
  }

  h2::before {
    content: "> ";
    color: var(--text-secondary);
  }

  p {
    margin: 0 0 0.75rem;
  }

  .links {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  a {
    color: var(--text-secondary);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  a:hover,
  a:focus-visible {
    color: var(--text);
    border-bottom-color: var(--text);
    outline: none;
  }

  footer {
    margin-top: 3.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--glass-border, oklch(1 0 0 / 0.15));
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  footer p {
    margin: 0 0 0.25rem;
  }
</style>
