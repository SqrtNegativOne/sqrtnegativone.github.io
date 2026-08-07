<script>
  import MenuOverlay from "../components/MenuOverlay.svelte";
  import Cursor from "../components/Cursor.svelte";
  import AsciiBackground from "../components/AsciiBackground.svelte";
  import NotFound from "../components/NotFound.svelte";

  import Quote from "../components/Quote.svelte";
  import HeroName from "../components/HeroName.svelte";
  import HalftoneImage from "../components/HalftoneImage.svelte";

  import { quoteStore } from "../stores/quote.svelte.js";
  import "../index.css";
  import "../App.css";

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

{#if !isKnown}
  <div class="with-frame">
    <AsciiBackground />
    {@render children()}
  </div>
{:else if currentPath === "/media-library"}
  {@render children()}
  <MenuOverlay view="media-library" />
{:else if currentPath === "/"}
  <div class="page-content with-frame">
    <AsciiBackground />
    {@render children()}
    <div class="home-name-overlay">
      <HeroName />
      <Quote displayed={quoteStore.displayed} phase={quoteStore.phase} onCycle={quoteStore.cycleQuote} />
    </div>
  </div>
  <MenuOverlay view="home" />
{:else if currentPath === "/questions"}
  {@render children()}
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
    <main class="content {contentFill ? 'content--fill' : ''}">
      {@render children()}
    </main>
  </div>

  <!-- Menu — hamburger button fixed top-right, opens full-screen bento overlay -->
  <MenuOverlay view={currentView} />
{/if}

<Cursor />
