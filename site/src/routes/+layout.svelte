<script>
  import MenuOverlay from "$shared/components/MenuOverlay.svelte";
  import AsciiBackground from "$shared/components/AsciiBackground.svelte";

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

  const NAV_ITEMS = [
    { key: "blog",          label: "Blog",          path: "/blog",          importance: 3 },
    { key: "now",           label: "Now",           path: "/now",           importance: 2 },
    { key: "microblog",     label: "Microblog",     path: "/microblog",     importance: 1 },
    { key: "media-library", label: "Media Library", path: "/media-library", importance: 1 },
    { key: "questions",     label: "Questions",     path: "/questions",     importance: 1 },
    { key: "colophon",      label: "Colophon",      path: "/colophon",      importance: 1 },
    { key: "cv",            label: "CV",            path: "https://cv.sqrt.fyi/", importance: 3, external: true }
  ];

  let currentPath = $derived($page.url.pathname.replace(/\/$/, '') || '/');

  const STANDALONE_PREFIXES = ["/now", "/colophon", "/microblog"];
  const BARE_ROUTES = ["/main"];

  let isBare = $derived(BARE_ROUTES.includes(currentPath));
  let isStandalone = $derived(STANDALONE_PREFIXES.some((prefix) => currentPath.startsWith(prefix)));
  let showMenu = $derived(!$page.error && currentPath !== "/questions" && !isBare);
  let currentView = $derived(currentPath === "/" ? "home" : currentPath.slice(1).split("/")[0]);
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

{#if isBare}
  {@render children()}
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
    <MenuOverlay items={NAV_ITEMS} view={currentView} />
  {/if}
{/if}

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
