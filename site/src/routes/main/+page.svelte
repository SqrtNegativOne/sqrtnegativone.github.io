<script>
  import "@fontsource/silkscreen/400.css";
  import "@fontsource/vt323/400.css";
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>main — Ark Malhotra</title>
</svelte:head>

<main id="main-content" tabindex="-1" class="plain-main">
  <h1 class="title">sqrt.fyi</h1>

  <nav aria-label="Pages">
    <ul class="links">
      <li><a href="/blog">blog</a></li>
      <li><a href="/now">now</a></li>
      <li><a href="/microblog">microblog</a></li>
      <li><a href="/media-library">media library</a></li>
      <li><a href="/questions">questions</a></li>
      <li><a href="/colophon">colophon</a></li>
    </ul>
  </nav>

  <p class="elsewhere">
    <a href="https://cv.sqrt.fyi/">cv.sqrt.fyi</a>
  </p>
</main>

<style>
  .plain-main {
    min-height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding: clamp(1.5rem, 6vw, 5rem);
    font-family: "VT323", "Courier New", monospace;
    font-size: 1.4rem;
    line-height: 1.35;
  }

  .title {
    margin: 0;
    font-family: "Silkscreen", "VT323", monospace;
    font-size: clamp(1.75rem, 6vw, 3.25rem);
    letter-spacing: 0.02em;
    color: var(--text);
  }

  .links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .links a,
  .elsewhere a {
    color: var(--text-secondary);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .links a::before {
    content: "> ";
    color: var(--text);
  }

  .links a:hover,
  .links a:focus-visible,
  .elsewhere a:hover,
  .elsewhere a:focus-visible {
    color: var(--text);
    border-bottom-color: var(--text);
    outline: none;
  }

  .elsewhere {
    margin: 0;
    padding-top: 1rem;
    font-size: 1.15rem;
  }
</style>
