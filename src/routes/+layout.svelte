<script>
  import MenuOverlay from "../components/MenuOverlay.svelte";
  import Cursor from "../components/Cursor.svelte";
  import AsciiBackground from "../components/AsciiBackground.svelte";
  import PortfolioLayout from "../components/PortfolioLayout.svelte";

  import "../index.css";
  import "../App.css";
  import "@fontsource/inter/400.css";
  import "@fontsource/inter/500.css";
  import "@fontsource/inter/600.css";
  import "@fontsource/inter/700.css";
  import "@fontsource/ibm-plex-mono/300.css";
  import "@fontsource/ibm-plex-mono/400.css";
  import "@fontsource/instrument-serif/400.css";
  import "@fontsource/pt-sans-narrow/400.css";
  import "@fontsource/pt-sans-narrow/700.css";
  import "@fontsource/datatype/400.css";

  import { page } from "$app/stores";

  let { children } = $props();

  let currentPath = $derived($page.url.pathname.replace(/\/$/, '') || '/');

  const PORTFOLIO_ROUTES = ["/", "/about", "/skills", "/projects"];
  const STANDALONE_PREFIXES = ["/now", "/colophon", "/microblog", "/minis"];

  let isPortfolio = $derived(!$page.error && PORTFOLIO_ROUTES.includes(currentPath));
  let isStandalone = $derived(STANDALONE_PREFIXES.some((prefix) => currentPath.startsWith(prefix)));
  let showMenu = $derived(!$page.error && currentPath !== "/questions");
  let currentView = $derived(currentPath === "/" ? "home" : currentPath.slice(1).split("/")[0]);

  $effect(() => {
    document.body.classList.toggle('no-scroll', isPortfolio);
    return () => {
      document.body.classList.remove('no-scroll');
    };
  });
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

{#if isPortfolio}
  <PortfolioLayout {currentPath}>
    {@render children()}
  </PortfolioLayout>
{:else}
  <div
    class="page-content"
    class:standalone-layout={isStandalone}
    class:with-frame={!!$page.error}
    id="main-content"
    tabindex="-1"
  >
    {#if $page.error}
      <AsciiBackground />
    {/if}
    {@render children()}
  </div>
  {#if showMenu}
    <MenuOverlay view={currentView} />
  {/if}
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

  .standalone-layout {
    min-height: 100vh;
    padding: 5rem 2rem 4rem;
    box-sizing: border-box;
    width: 100%;
  }

  @media (max-width: 640px) {
    .standalone-layout {
      padding: 4rem 1.25rem 3rem;
    }
  }
</style>
