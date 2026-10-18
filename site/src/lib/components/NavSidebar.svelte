<script>
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";

  let {
    items = [],
    path = "",
    /** Keep the pane open instead of hover-revealing it. */
    pinned = false,
    open = $bindable(false)
  } = $props();

  let sidebarEl = $state();
  let leaving = $state(false);
  let navTimer;
  let leaveTimer;

  /** Distance (px) from the left viewport edge that reveals the panel. */
  const EDGE_ZONE = 8;
  /** How far past the panel's right edge the pointer may drift before it hides. */
  const CLOSE_MARGIN = 120;
  /** Above this width a pinned pane is a permanent column, not a drawer. */
  const PINNED_QUERY = "(min-width: 900px)";

  /** Max panel width — must match the CSS `--nav-w`. */
  function panelWidth() {
    return Math.min(320, window.innerWidth * 0.82);
  }

  function isPinnedHere() {
    return pinned && window.matchMedia(PINNED_QUERY).matches;
  }

  function navDelay() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
  }

  function openMenu() {
    if (open) return;
    clearTimeout(leaveTimer);
    leaving = false;
    open = true;
  }

  /**
   * Slide the panel shut. Exported so pages can close it before following a
   * link that lives outside the sidebar.
   */
  export function collapse() {
    if (!open) return;
    const hadFocus = sidebarEl?.contains(document.activeElement);
    open = false;
    leaving = true;
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => { leaving = false; }, 1400);
    if (hadFocus) document.getElementById("main-content")?.focus();
  }

  function closeMenu() {
    collapse();
  }

  function isActive(item) {
    if (!item || item.external) return false;
    const target = item.path.replace(/\/$/, "") || "/";
    const here = path.replace(/\/$/, "") || "/";
    return here === target || here.startsWith(target + "/");
  }

  function handleNav(item) {
    if (!item) return;

    if (item.external) {
      // Open synchronously so popup blockers still see the user gesture.
      window.open(item.path, "_blank", "noopener,noreferrer");
      // On /main the pane is pinned; there is no page transition to hide.
      if (!pinned) collapse();
      return;
    }

    collapse();
    clearTimeout(navTimer);
    navTimer = setTimeout(() => goto(item.path), navDelay());
  }

  function onMouseMove(e) {
    // Hover reveal is for precise pointers (mouse/trackpad), not touch.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    // A pinned pane is permanent: don't hide it when the pointer drifts away.
    if (pinned && open) return;
    if (leaving) return;

    if (!open) {
      if (e.clientX <= EDGE_ZONE) openMenu();
      return;
    }

    // Keep it open while hovering the panel; hide once the pointer has
    // moved a significant distance past the panel.
    if (e.clientX > panelWidth() + CLOSE_MARGIN) closeMenu();
  }

  function onPointerDown(e) {
    // A pinned pane on a wide screen is never dismissed by clicking around it.
    if (isPinnedHere()) return;

    // Touch/pen: tap the extreme-left strip to reveal, tap anywhere else to hide.
    if (e.pointerType === "mouse") {
      if (open && !sidebarEl?.contains(e.target)) closeMenu();
      return;
    }
    if (!open) {
      if (e.clientX <= EDGE_ZONE * 3) openMenu();
    } else if (!sidebarEl?.contains(e.target)) {
      closeMenu();
    }
  }

  function onGlobalKeydown(e) {
    if (e.key === "Escape" || e.code === "Escape") {
      // Escape may dismiss the mobile drawer, but not the permanent column.
      if (open && !isPinnedHere()) {
        e.preventDefault();
        closeMenu();
      }
      return;
    }

    if (!open && e.code === "Space") {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      openMenu();
    }
  }

  onDestroy(() => {
    clearTimeout(navTimer);
    clearTimeout(leaveTimer);
  });
</script>

<svelte:window
  onmousemove={onMouseMove}
  onpointerdown={onPointerDown}
  onkeydown={onGlobalKeydown}
/>

<nav
  bind:this={sidebarEl}
  id="site-sidebar"
  class="nav-sidebar {open ? 'is-open' : ''}"
  aria-label="Site menu"
  inert={!open}
>
  <ul class="nav-list">
    {#each items as item (item.key)}
      {@const active = isActive(item)}
      <li>
        <a
          class="nav-link {active ? 'is-active' : ''}"
          href={item.path}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          tabindex={open ? 0 : -1}
          aria-current={active ? "page" : undefined}
          onclick={(e) => {
            e.preventDefault();
            if (active) closeMenu();
            else handleNav(item);
          }}
        >
          <span class="nav-label">{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
/* ── Sidebar pane ──────────────────────────────── */
.nav-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 901;
  width: var(--nav-w, min(320px, 82vw));
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 5rem 2.5rem 3rem;
  background: oklch(0.13 0 0 / 0.98);
  border-right: 1px solid oklch(1 0 0 / 0.12);
  box-shadow: 24px 0 60px oklch(0 0 0 / 0.45);
  overflow-y: auto;
  transform: translateX(-100%);
  /* fast-then-slow (strong ease-out) slide */
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.nav-sidebar.is-open {
  transform: translateX(0);
}

.nav-list {
  list-style: none;
  /* auto margins centre the list but collapse when it needs to scroll */
  margin: auto 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nav-link {
  display: inline-block;
  color: var(--text);
  text-decoration: none;
  font-family: "Instrument Serif", serif;
  font-size: 2rem;
  line-height: 1.25;
  letter-spacing: 0.01em;
  transition: color 0.2s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-link:hover,
.nav-link:focus-visible {
  color: var(--accent);
  transform: translateX(6px);
  outline: none;
}

/* Current page: italic, struck-through, gray */
.nav-link.is-active,
.nav-link.is-active:hover,
.nav-link.is-active:focus-visible {
  font-style: italic;
  text-decoration: line-through;
  color: oklch(0.55 0 0);
  transform: none;
  cursor: default;
}

@media (max-width: 640px) {
  .nav-link {
    font-size: 1.75rem;
  }
}
</style>
