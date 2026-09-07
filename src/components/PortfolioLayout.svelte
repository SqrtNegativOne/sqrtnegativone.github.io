<script>
  import AsciiBackground from "./AsciiBackground.svelte";
  import HeroName from "./HeroName.svelte";
  import Quote from "./Quote.svelte";
  import HalftoneImage from "./HalftoneImage.svelte";
  import MenuOverlay from "./MenuOverlay.svelte";
  import { quoteStore } from "../stores/quote.svelte.js";

  let { currentPath, children } = $props();

  const HIDE_PORTRAIT = ["/skills", "/projects"];

  let currentView = $derived(currentPath === "/" ? "home" : currentPath.slice(1));
  let showPortrait = $derived(!HIDE_PORTRAIT.includes(currentPath));
  let contentFill = $derived(currentPath === "/projects" || currentPath === "/skills");
</script>

{#if currentPath === "/"}
  <div class="page-content with-frame" id="main-content" tabindex="-1">
    <AsciiBackground />
    {@render children()}
    <div class="home-name-overlay">
      <HeroName />
      <Quote displayed={quoteStore.displayed} phase={quoteStore.phase} onCycle={quoteStore.cycleQuote} />
    </div>
  </div>
  <MenuOverlay view="home" />
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
          src="/portraits/tower.webp"
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
