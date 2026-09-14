<script>
  import AsciiBackground from "$shared/components/AsciiBackground.svelte";
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
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

{#if $page.error}
  <div
    class="page-content with-frame"
    id="main-content"
    tabindex="-1"
  >
    <AsciiBackground />
    {@render children()}
  </div>
{:else}
  <PortfolioLayout {currentPath}>
    {@render children()}
  </PortfolioLayout>
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
</style>
