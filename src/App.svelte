<script>
  import MenuOverlay from "./components/MenuOverlay.svelte";
  import Cursor from "./components/Cursor.svelte";
  import AsciiBackground from "./components/AsciiBackground.svelte";

  import Bio from "./components/Bio.svelte";
  import Skills from "./components/Skills.svelte";
  import Projects from "./components/Projects.svelte";
  import Contact from "./components/Contact.svelte";
  import NotFound from "./components/NotFound.svelte";
  import ComingSoon from "./components/ComingSoon.svelte";
  import Quote from "./components/Quote.svelte";
  import HeroName from "./components/HeroName.svelte";
  import HalftoneImage from "./components/HalftoneImage.svelte";
  import Home from "./components/Home.svelte";
  import MediaLibrary from "./components/MediaLibrary.svelte";
  import Questions from "./components/Questions.svelte";

  import { quoteStore } from "./stores/quote.svelte.js";
  import "./App.css";


  let currentPath = $state(window.location.pathname);


  const KNOWN_ROUTES = [
    "/", "/about", "/skills", "/projects", "/contact",
    "/now", "/colophon", "/minis", "/media-library",
    "/questions",
  ];

  const HIDE_PORTRAIT = ["/skills", "/projects"];

  let isKnown = $derived(KNOWN_ROUTES.includes(currentPath));
  let currentView = $derived(currentPath.slice(1));
  let showPortrait = $derived(!HIDE_PORTRAIT.includes(currentPath));
  let contentFill = $derived(currentPath === "/projects" || currentPath === "/skills");
</script>

  {#if !isKnown}
    <div class="with-frame">
      <AsciiBackground />
      <NotFound />
      <Cursor />
    </div>
  {:else if currentPath === "/media-library"}
    <MediaLibrary />
    <MenuOverlay view="media-library" />
    <Cursor />
  {:else if currentPath === "/"}
    <div class="page-content with-frame">
      <AsciiBackground />
      <Home />
      <div class="home-name-overlay">
        <HeroName />
        <Quote displayed={quoteStore.displayed} phase={quoteStore.phase} onCycle={quoteStore.cycleQuote} />
      </div>
    </div>
    <MenuOverlay view="home" />
    <Cursor />
  {:else if currentPath === "/questions"}
    <Questions />
    <Cursor />
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
        {#if currentPath === "/about"} <Bio /> {/if}
        {#if currentPath === "/skills"} <Skills /> {/if}
        {#if currentPath === "/projects"} <Projects /> {/if}
        {#if currentPath === "/contact"} <Contact /> {/if}
        {#if currentPath === "/now"} <ComingSoon /> {/if}
        {#if currentPath === "/colophon"} <ComingSoon /> {/if}
        {#if currentPath === "/minis"} <ComingSoon /> {/if}
      </main>
    </div>

    <!-- Menu — hamburger button fixed top-right, opens full-screen bento overlay -->
    <MenuOverlay view={currentView} />

    <!-- Custom cursor -->
    <Cursor />
  {/if}
