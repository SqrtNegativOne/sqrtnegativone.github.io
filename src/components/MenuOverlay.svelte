<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let { view = "", hideHint = false } = $props();

  const NAV_ITEMS = [
    { key: "home",         label: "Home",         path: "/",              importance: 3 },
    { key: "projects",     label: "Projects",     path: "/projects",      importance: 3 },
    { key: "about",        label: "About",        path: "/about",         importance: 2 },
    { key: "blog",         label: "Blog",         path: "/blog/",         importance: 2, external: true },
    { key: "skills",       label: "Skills",       path: "/skills",        importance: 1 },
    { key: "now",          label: "Now",          path: "/now",           importance: 1 },
    { key: "minis",        label: "Minis",        path: "/minis",         importance: 1 },
    { key: "media-library",label: "Media Library",path: "/media-library", importance: 1 },
    { key: "questions",    label: "Questions",    path: "/questions",     importance: 1 },
    { key: "colophon",     label: "Colophon",     path: "/colophon",      importance: 1 },
  ];

  let open = $state(false);

  let query = $state("");
  let selectedIndex = $state(0);
  let searchInput = $state();
  let burgerButton = $state();
  let overlayEl = $state();
  
  let filteredItems = $derived(
    NAV_ITEMS.filter(
      (item) => item.key !== view && item.label.toLowerCase().includes(query.toLowerCase())
    )
  );

  $effect(() => {
    // Reset selection when query changes
    if (query !== undefined) {
      selectedIndex = 0;
    }
  });

  $effect(() => {
    if (open && searchInput) {
      if (window.innerWidth > 640) {
        searchInput.focus();
      }
    }
  });

  function closeMenu() {
    // Return focus to the burger button if focus was inside the overlay
    const hadFocus = open && overlayEl?.contains(document.activeElement);
    open = false;
    document.body.classList.remove("menu-is-open");
    setTimeout(() => { query = ""; }, 150);
    if (hadFocus) burgerButton?.focus();
  }

  function handleOpen() {
    document.body.classList.add("menu-is-open");
    open = true;
  }

  function handleNav(item) {
    if (!item) return;
    closeMenu();
    setTimeout(() => {
      if (item.external) window.open(item.path, '_blank', 'noopener,noreferrer');
      else {
// eslint-disable-next-line svelte/no-navigation-without-resolve
        goto(item.path);
      }
    }, 150);
  }

  function onGlobalKeydown(e) {
    if (open && (e.key === "Escape" || e.code === "Escape")) {
      e.preventDefault();
      closeMenu();
      return;
    }
    
    // Command Palette navigation
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % filteredItems.length;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleNav(filteredItems[selectedIndex]);
      }
    }

    if (!open && (e.code === "Space" || e.key === " ")) {
      if (window.innerWidth <= 640) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      handleOpen();
    }
  }

  onMount(() => {
    return () => {
      document.body.classList.remove("menu-is-open");
    };
  });
</script>

<svelte:window 
  onkeydown={onGlobalKeydown} 
  onkeyup={(e) => {
    // Catch escape on keyup in case keydown was swallowed by the browser
    if (open && (e.key === "Escape" || e.code === "Escape")) {
      e.preventDefault();
      closeMenu();
    }
  }} 
/>

<button
  bind:this={burgerButton}
  class="nav-burger {open ? 'nav-burger--open' : ''}"
  onclick={() => { if (open) closeMenu(); else handleOpen(); }}
  aria-label={open ? "Close menu" : "Open menu"}
>
  <span></span>
  <span></span>
  <span></span>
</button>

{#if !hideHint}
  <!-- Decorative hint: keyboard users activate the menu via the Space shortcut -->
  <div class="menu-hint" aria-hidden="true">
    <div class="hint-text {open ? '' : 'is-visible'}">
      press space to activate menu
    </div>
    <div class="hint-text {open ? 'is-visible' : ''}">
      <span>type to search • ↑↓ to navigate • enter to select • esc to close</span>
    </div>
  </div>
{/if}

<!-- We keep the menu in the DOM permanently to prevent layout thrashing and stutter -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="menu-scrim {open ? 'is-open' : ''}" onclick={closeMenu}></div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={overlayEl}
  class="menu-overlay {open ? 'is-open' : ''}"
  onclick={closeMenu}
  role={open ? "dialog" : undefined}
  aria-modal={open ? "true" : undefined}
  aria-label={open ? "Site menu" : undefined}
  inert={!open}
>
  <div class="command-palette-wrapper {open ? 'is-open' : ''}">
    <div class="command-palette" onclick={(e) => e.stopPropagation()}>
      <div class="search-header">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          bind:this={searchInput}
          bind:value={query} 
          placeholder="Where to?" 
          class="search-input"
          spellcheck="false"
          autocomplete="off"
          tabindex={open ? 0 : -1}
          onkeydown={(e) => {
            if (e.key === "Escape" || e.code === "Escape") {
              e.preventDefault();
              closeMenu();
            }
          }}
        />
      </div>
      <div class="results">
        {#each filteredItems as item, i (item.key)}
          <button 
            class="result-item {i === selectedIndex ? 'selected' : ''}" 
            onclick={() => handleNav(item)}
            onpointerenter={() => selectedIndex = i}
            tabindex={open ? 0 : -1}
          >
            <span class="result-label">{item.label}</span>
            <span class="result-path">{item.path}</span>
          </button>
        {/each}
        {#if filteredItems.length === 0}
          <div class="no-results">No results found for "{query}"</div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
/* Hamburger / X button */
.nav-burger {
  display: none;
  position: fixed;
  top: 3rem;
  right: 3rem;
  z-index: 10001;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  padding: 12px;
  background: oklch(1 0 0 / 0.08);
  border: 1px solid oklch(1 0 0 / 0.14);
  border-radius: 999px;
  transition: background 0.15s, border-color 0.15s;
}

.nav-burger:hover {
  background: oklch(1 0 0 / 0.14);
  border-color: oklch(1 0 0 / 0.25);
}

.nav-burger span {
  display: block;
  height: 1.5px;
  width: 100%;
  background: var(--text);
  transform-origin: center;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s ease;
}

.nav-burger--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.nav-burger--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.nav-burger--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* Menu hint */
.menu-hint {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: var(--frame-v, 40px);
  display: grid;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: lowercase;
  color: rgba(var(--text-secondary-rgb), 0.7);
  pointer-events: none;
  user-select: none;
}
.hint-text {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}
.hint-text.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Scrim */
.menu-scrim {
  position: fixed;
  inset: 0;
  z-index: 499;
  background: oklch(0 0 0 / 0.85);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease-out, visibility 0.15s ease-out;
  will-change: opacity;
}
.menu-scrim.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Overlay & Wrapper */
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 15vh 2rem 2rem;
  pointer-events: none;
}
.menu-overlay.is-open {
  pointer-events: auto;
}

.command-palette-wrapper {
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  transform: translateY(15px);
  transition: opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.15s;
  will-change: transform, opacity;
}
.command-palette-wrapper.is-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Command Palette */
.command-palette {
  display: flex;
  flex-direction: column;
  background: oklch(0.15 0 0 / 0.95);
  border: 1px solid oklch(1 0 0 / 0.15);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.1);
}

.search-header {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid oklch(1 0 0 / 0.15);
  gap: 1rem;
}

.search-icon {
  color: oklch(1 0 0 / 0.4);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: oklch(1 0 0 / 0.9);
  font-family: inherit;
  font-size: 1.25rem;
  outline: none;
}
.search-input::placeholder {
  color: oklch(1 0 0 / 0.3);
}

.results {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 50vh;
  padding: 0.5rem;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  color: oklch(1 0 0 / 0.6);
}

.result-item.selected {
  background: oklch(1 0 0 / 0.1);
  color: oklch(1 0 0 / 0.95);
}

.result-label {
  font-family: inherit;
  font-size: 1.5rem;
  line-height: 1.2;
}

.result-path {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
  opacity: 0.5;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: oklch(1 0 0 / 0.4);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.9rem;
}

/* Scrollbar styling */
.results::-webkit-scrollbar {
  width: 8px;
}
.results::-webkit-scrollbar-track {
  background: transparent;
}
.results::-webkit-scrollbar-thumb {
  background: oklch(1 0 0 / 0.15);
  border-radius: 4px;
}

/* Responsive — Mobile */
@media (max-width: 640px) {
  .nav-burger {
    display: flex;
  }
  .menu-hint {
    display: none;
  }
  
  .menu-overlay {
    padding: 0;
    align-items: flex-start;
  }
  
  .command-palette-wrapper {
    max-width: 100%;
    max-height: 100vh;
    height: 100vh;
  }
  
  .command-palette {
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    height: 100%;
    padding-top: 6rem;
  }

  .search-header {
    display: none;
  }

  .results {
    max-height: none;
    flex: 1;
    padding: 1rem 2rem;
    gap: 0.5rem;
  }
  
  .result-item {
    padding: 1rem 0;
    border-radius: 0;
  }

  .result-item.selected {
    background: transparent;
    color: oklch(1 0 0 / 0.95);
  }
  
  .result-label {
    font-size: 3rem;
  }
  
  .result-path {
    display: none;
  }
}
</style>
