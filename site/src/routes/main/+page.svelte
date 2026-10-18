<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import "@fontsource/silkscreen/400.css";
  import "@fontsource/dotgothic16/400.css";

  import NavSidebar from "$lib/components/NavSidebar.svelte";
  import { NAV_ITEMS } from "$lib/nav.js";
  import Intro from "./Intro.svelte";

  let open = $state(true);
  let sidebar = $state();

  function navDelay() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
  }

  onMount(() => {
    // Capture phase: SvelteKit's router listens on the app container, so a
    // bubble-phase listener would arrive too late and navigate immediately.
    window.addEventListener("click", handleContentClick, true);
    return () => window.removeEventListener("click", handleContentClick, true);
  });

  /**
   * The sidebar handles its own links. This catches links in the prose so the
   * pane still slides away before the next page takes over.
   */
  function handleContentClick(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.target.closest?.("a[href]");
    if (!link || link.closest("#site-sidebar") || link.hasAttribute("download")) return;

    const target = link.getAttribute("target");
    if (target && target !== "_self") return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    if (url.origin === location.origin) {
      event.preventDefault();
      event.stopPropagation();
      sidebar?.collapse();
      setTimeout(() => goto(url.pathname + url.search + url.hash), navDelay());
      return;
    }

    // External links open in a new tab; the current page stays put, so there
    // is no transition for the pinned pane to slide away for.
    event.preventDefault();
    event.stopPropagation();
    window.open(url.href, "_blank", "noopener,noreferrer");
  }
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>main — Sqrt-1</title>
</svelte:head>

<div class="main-shell">
  <NavSidebar
    bind:this={sidebar}
    bind:open
    items={NAV_ITEMS}
    path="/main"
    pinned
  />

  {#if !open}
    <button
      class="menu-tab"
      type="button"
      aria-label="Open menu"
      onclick={() => (open = true)}
    >
      menu
    </button>
  {/if}

  <main id="main-content" tabindex="-1" class="main-content">
    <article class="intro">
      <h1 class="title">sqrt.fyi</h1>
      <Intro />
    </article>
  </main>
</div>

<style>
  .main-shell {
    min-height: 100vh;
    min-height: 100dvh;
  }

  .main-content {
    min-height: 100vh;
    min-height: 100dvh;
    box-sizing: border-box;
    padding: clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 6vw, 6rem) clamp(4rem, 8vw, 8rem);
  }

  .intro {
    width: min(100%, 72ch);
  }

  .title {
    margin: 0 0 clamp(2rem, 5vw, 3.5rem);
    font-family: "Silkscreen", "VT323", monospace;
    font-size: clamp(2.25rem, 4.5vw, 3.6rem);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: 0.015em;
    color: var(--text);
  }

  .menu-tab {
    position: fixed;
    top: 50%;
    left: 0;
    z-index: 900;
    transform: translateY(-50%);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 0.95rem 0.4rem;
    writing-mode: vertical-rl;
    background: oklch(0.13 0 0 / 0.98);
    border: 1px solid oklch(1 0 0 / 0.14);
    border-left: 0;
    border-radius: 0 8px 8px 0;
    color: var(--text-secondary);
    font-family: "Silkscreen", "VT323", monospace;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: lowercase;
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .menu-tab:hover,
  .menu-tab:focus-visible {
    color: var(--text);
    background: oklch(0.16 0 0 / 0.98);
    outline: none;
  }

  @media (min-width: 900px) {
    .main-content {
      margin-left: var(--nav-w);
      padding-left: clamp(2.5rem, 5vw, 5rem);
    }
  }

  @media (max-width: 899px) {
    .main-content {
      padding-top: 4.5rem;
      /* Leave a gutter for the vertical menu tab on the left edge. */
      padding-left: 2.75rem;
    }

    .menu-tab {
      display: flex;
    }
  }
</style>
