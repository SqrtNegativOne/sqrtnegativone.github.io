<script>
  import MenuOverlay from "../components/MenuOverlay.svelte";
  import Cursor from "../components/Cursor.svelte";
  import AsciiBackground from "../components/AsciiBackground.svelte";


  import Quote from "../components/Quote.svelte";
  import HeroName from "../components/HeroName.svelte";
  import HalftoneImage from "../components/HalftoneImage.svelte";

  import { quoteStore } from "../stores/quote.svelte.js";
  import "../index.css";
  import "../App.css";
  import "@fontsource/inter/400.css";
  import "@fontsource/inter/500.css";
  import "@fontsource/inter/600.css";
  import "@fontsource/inter/700.css";
  import "@fontsource/ibm-plex-mono/300.css";
  import "@fontsource/ibm-plex-mono/400.css";
  import "@fontsource/instrument-serif/400.css";
  import "@fontsource/manrope/400.css";
  import "@fontsource/manrope/500.css";
  import "@fontsource/manrope/600.css";
  import "@fontsource/datatype/400.css";

  import { page } from "$app/stores";

  let { children } = $props();

  let currentPath = $derived($page.url.pathname.replace(/\/$/, '') || '/');

  const KNOWN_ROUTES = [
    "/", "/about", "/skills", "/projects",
    "/now", "/colophon", "/minis", "/media-library",
    "/questions",
  ];

  const HIDE_PORTRAIT = ["/skills", "/projects"];

  let isKnown = $derived(KNOWN_ROUTES.includes(currentPath));
  let currentView = $derived(currentPath === '/' ? 'home' : currentPath.slice(1));
  let showPortrait = $derived(!HIDE_PORTRAIT.includes(currentPath));
  let contentFill = $derived(currentPath === "/projects" || currentPath === "/skills");
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

{#if !isKnown}
  <div class="with-frame" id="main-content" tabindex="-1">
    <AsciiBackground />
    {@render children()}
  </div>
{:else if currentPath === "/media-library"}
  <div id="main-content" tabindex="-1">
    {@render children()}
  </div>
  <MenuOverlay view="media-library" />
{:else if currentPath === "/"}
  <div class="page-content with-frame" id="main-content" tabindex="-1">
    <AsciiBackground />
    {@render children()}
    <div class="home-name-overlay">
      <HeroName />
      <Quote displayed={quoteStore.displayed} phase={quoteStore.phase} onCycle={quoteStore.cycleQuote} />
    </div>
  </div>
  <MenuOverlay view="home" />
{:else if currentPath === "/questions"}
  <div id="main-content" tabindex="-1">
    {@render children()}
  </div>
{:else}
  <div class="page page-content with-frame" class:no-portrait={!showPortrait}>
    <AsciiBackground />

    <!-- Name + Quote group — top-left -->
    <div class="name-group">
      <footer class="bottom-bar">
        <HeroName />
      </footer>
      <Quote displayed={quoteStore.displayed} phase={quoteStore.phase} onCycle={quoteStore.cycleQuote} />
    </div>

    <!-- Portrait — bottom-left (hidden on skills/projects) -->
    {#if showPortrait}
      <div class="portrait-column">
        <HalftoneImage
          src="/portraits/tower.jpg"
          alt="Ark Malhotra portrait"
          class="portrait"
        />
      </div>
    {/if}

    <!-- Content — bottom-right, swaps based on route -->
    <main class="content {contentFill ? 'content--fill' : ''}" id="main-content" tabindex="-1">
      {@render children()}
    </main>
  </div>

  <!-- Menu — hamburger button fixed top-right, opens full-screen bento overlay -->
  <MenuOverlay view={currentView} />
{/if}

<Cursor />

<style>
  .skip-link {
    position: fixed;
    top: -100%;
    left: 1rem;
    z-index: 100000;
    padding: 0.75rem 1.25rem;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--text);
    border-radius: 8px;
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    text-decoration: none;
    transition: top 0.15s ease-out;
  }
  .skip-link:focus-visible {
    top: 1rem;
    outline: 2px solid var(--text);
    outline-offset: 2px;
  }
</style>
