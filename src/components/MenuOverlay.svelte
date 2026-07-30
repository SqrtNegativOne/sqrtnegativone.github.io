<script>
  import { onMount, onDestroy } from "svelte";
    

  export let view = "";
  export let hideHint = false;

  const NAV_ITEMS = [
    { key: "home",         label: "Home",         path: "/",              importance: 3 },
    { key: "projects",     label: "Projects",     path: "/projects",      importance: 3 },
    { key: "about",        label: "About",        path: "/about",         importance: 2 },
    { key: "blog",         label: "Blog",         path: "/blog/",         importance: 2, external: true },
    { key: "skills",       label: "Skills",       path: "/skills",        importance: 1 },
    { key: "contact",      label: "Contact",      path: "/contact",       importance: 1 },
    { key: "now",          label: "Now",          path: "/now",           importance: 1 },
    { key: "minis",        label: "Minis",        path: "/minis",         importance: 1 },
    { key: "media-library",label: "Media Library",path: "/media-library", importance: 1 },
    { key: "questions",    label: "Questions",    path: "/questions",     importance: 1 },
    { key: "colophon",     label: "Colophon",     path: "/colophon",      importance: 1 },
  ];

  const EXIT_MS = 420;

  function getMenuGeometry() {
    if (typeof window === 'undefined') return { top:0, right:0, bottom:0, left:0, rows:0, cols:0, cell:0, mobile:false };
    const W = window.innerWidth;
    const H = window.innerHeight;
    const mobile = W <= 640;
    const tablet = W <= 1024 && !mobile;
    const cols   = mobile ? 2 : tablet ? 4 : 6;
    const h      = mobile ? 16 : 40;
    const cell   = (W - 2 * h) / cols;
    const rows   = Math.floor((H - 2 * h) / cell);
    const v      = (H - rows * cell) / 2;
    return { top: v, right: h, bottom: v, left: h, rows, cols, cell, mobile };
  }

  function cellDims(item, mobile) {
    if (mobile)                  return { w: 1, h: 1 };
    if (item.importance === 3)   return { w: 2, h: 2 };
    if (item.importance === 2)   return { w: 2, h: 1 };
    return { w: 1, h: 1 };
  }

  function packGrid(items, cols) {
    const occ = [];
    const fits = (r, c, w, h) => {
      if (c + w > cols) return false;
      for (let dr = 0; dr < h; dr++)
        for (let dc = 0; dc < w; dc++)
          if (occ[r + dr]?.[c + dc]) return false;
      return true;
    };
    const set = (r, c, w, h) => {
      for (let dr = 0; dr < h; dr++) {
        if (!occ[r + dr]) occ[r + dr] = [];
        for (let dc = 0; dc < w; dc++) occ[r + dr][c + dc] = true;
      }
    };
    return items.map(({ w, h }) => {
      for (let r = 0; ; r++) {
        for (let c = 0; c < cols; c++) {
          if (fits(r, c, w, h)) { set(r, c, w, h); return { row: r, col: c, w, h }; }
        }
      }
    });
  }

  function edgeMotion(p, rows, cols, cellPx) {
    const dT = p.row;
    const dB = rows - p.row - p.h;
    const dL = p.col;
    const dR = cols - p.col - p.w;
    const m = Math.min(dT, dB, dL, dR);
    if (m === dT) return { x: 0,                          y: -(p.row + p.h) * cellPx, dist: dT };
    if (m === dB) return { x: 0,                          y:  (rows - p.row) * cellPx, dist: dB };
    if (m === dL) return { x: -(p.col + p.w) * cellPx,    y: 0,                        dist: dL };
    return          { x:  (cols - p.col) * cellPx,    y: 0,                        dist: dR };
  }

  let open = false;
  let closing = false;
  let overlayStyle = {};
  let layout = { nav: [], deco: [], maxDist: 0 };
  let closeTimer;

  function closeMenu() {
    if (closing) return;
    closing = true;
    document.documentElement.style.removeProperty("--frame-v");
    document.body.classList.remove("menu-is-open");
    closeTimer = setTimeout(() => {
      open = false;
      closing = false;
    }, EXIT_MS);
  }

  function handleOpen() {
    const geo = getMenuGeometry();
    document.documentElement.style.setProperty("--frame-v", `${geo.top}px`);
    document.body.classList.add("menu-is-open");

    const sortedNav = NAV_ITEMS
      .filter((item) => item.key !== view)
      .slice()
      .sort((a, b) => b.importance - a.importance)
      .map((item) => ({ ...item, ...cellDims(item, geo.mobile) }));

    const totalSlots = geo.rows * geo.cols;
    const used = sortedNav.reduce((s, it) => s + it.w * it.h, 0);
    const decoCount = Math.max(0, totalSlots - used);
    const decoItems = Array.from({ length: decoCount }, () => ({ w: 1, h: 1 }));

    const placements = packGrid([...sortedNav, ...decoItems], geo.cols);
    const navPlacements  = placements.slice(0, sortedNav.length);
    const decoPlacements = placements.slice(sortedNav.length);

    const nav = sortedNav.map((it, i) => ({
      item: it,
      motion: edgeMotion(navPlacements[i], geo.rows, geo.cols, geo.cell),
    }));
    const deco = decoPlacements.map((p) => ({
      motion: edgeMotion(p, geo.rows, geo.cols, geo.cell),
    }));

    const maxDist = Math.max(
      0,
      ...nav.map((c) => c.motion.dist),
      ...deco.map((c) => c.motion.dist),
    );

    layout = { nav, deco, maxDist };
    overlayStyle = { top: geo.top, right: geo.right, bottom: geo.bottom, left: geo.left };
    open = true;
  }

  function handleNav(item) {
    closeMenu();
    setTimeout(() => {
      if (item.external) window.location.href = item.path;
      else window.location.href = item.path;
    }, EXIT_MS);
  }

  const inDelay  = (dist) => `${dist * 60}ms`;
  const outDelay = (dist) => `${(layout.maxDist - dist) * 35}ms`;

  function onKeydown(e) {
    if (open && e.key === "Escape") {
      closeMenu();
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
      clearTimeout(closeTimer);
      document.documentElement.style.removeProperty("--frame-v");
      document.body.classList.remove("menu-is-open");
    };
  });
</script>

<svelte:window on:keydown={onKeydown} />

<button
  class="nav-burger {open ? 'nav-burger--open' : ''}"
  onclick={() => { if (open) closeMenu(); else handleOpen(); }}
  aria-label={open ? "Close menu" : "Open menu"}
>
  <span></span>
  <span></span>
  <span></span>
</button>

{#if !hideHint}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="menu-hint" aria-hidden="true" onclick={() => { if (!open) handleOpen(); }} style="cursor: pointer;">
    press space to activate menu
  </div>
{/if}

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="menu-scrim {closing ? 'menu-scrim--closing' : ''}"
    style="top: {overlayStyle.top}px; right: {overlayStyle.right}px; bottom: {overlayStyle.bottom}px; left: {overlayStyle.left}px;"
    onclick={closeMenu}
  ></div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="menu-overlay {closing ? 'menu-overlay--closing' : ''}"
    style="top: {overlayStyle.top}px; right: {overlayStyle.right}px; bottom: {overlayStyle.bottom}px; left: {overlayStyle.left}px;"
    onclick={closeMenu}
  >
    <div class="menu-grid" onclick={(e) => e.stopPropagation()}>
      {#each layout.nav as { item, motion }, i (item.key)}
        <button
          class="menu-cell menu-cell--imp{item.importance} {closing ? 'menu-cell--out' : ''}"
          style="
            --from-x: {motion.x}px;
            --from-y: {motion.y}px;
            --delay: {inDelay(motion.dist)};
            --out-delay: {outDelay(motion.dist)};
          "
          onclick={() => handleNav(item)}
        >
          <span class="menu-cell__num">0{i + 1}</span>
          <span class="menu-cell__label">{item.label}</span>
        </button>
      {/each}

      {#each layout.deco as { motion }, i}
        <div
          class="menu-cell menu-cell--deco {closing ? 'menu-cell--out' : ''}"
          style="
            --from-x: {motion.x}px;
            --from-y: {motion.y}px;
            --delay: {inDelay(motion.dist)};
            --out-delay: {outDelay(motion.dist)};
          "
        ></div>
      {/each}
    </div>
  </div>
{/if}

<style>
/* ══════════════════════════════════════════════
   Hamburger / X button — mobile only (desktop uses Space key)
   ══════════════════════════════════════════════ */
.nav-burger {
  display: none;
  position: fixed;
  top: 3rem;
  right: 3rem;
  z-index: 10001;
  flex-direction: column;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.25s, border-color 0.25s;
}

.nav-burger:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
}

.nav-burger span {
  display: block;
  height: 1.5px;
  width: 100%;
  background: var(--text);
  transform-origin: center;
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1),
              opacity  0.2s ease;
}

/* Morph lines → X */
.nav-burger--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.nav-burger--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.nav-burger--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* ══════════════════════════════════════════════
   Menu hint — "press space to activate menu"
   Sits centered in the bottom margin space, outside the border frame.
   ══════════════════════════════════════════════ */
.menu-hint {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: var(--frame-v);
  display: flex;
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
  transition: opacity 0.28s ease;
}

body.menu-is-open .menu-hint {
  opacity: 0;
}

/* ══════════════════════════════════════════════
   Overlay — flush against the viewport border frame
   ══════════════════════════════════════════════ */
.menu-overlay {
  position: fixed;
  /* top/right/bottom/left set via inline style (JS-computed for pixel-perfect fit) */
  z-index: 500;
  overflow: hidden;
  background: transparent;
}

.menu-overlay--closing {
  pointer-events: none;
}

/* ══════════════════════════════════════════════
   Full-viewport scrim — separate from overlay so it isn't
   clipped by overflow:hidden and backdrop-filter works on
   all mobile browsers without pseudo-element quirks.
   ══════════════════════════════════════════════ */
.menu-scrim {
  position: fixed;
  z-index: 499;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(24px) saturate(0.75) brightness(0.4);
  -webkit-backdrop-filter: blur(24px) saturate(0.75) brightness(0.4);
  animation: overlay-bg-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  will-change: transform, opacity;
}

@supports (-moz-appearance:none) {
  .nav-burger, .menu-scrim {
    backdrop-filter: none;
  }
  .menu-scrim {
    background: rgba(0, 0, 0, 0.95);
  }
  .nav-burger {
    background: rgba(40, 40, 40, 0.9);
  }
}

.menu-scrim--closing {
  pointer-events: none;
  animation: overlay-bg-out 0.42s ease forwards;
}

@keyframes overlay-bg-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes overlay-bg-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* ══════════════════════════════════════════════
   Bento grid — desktop: 6 equal columns
   ══════════════════════════════════════════════ */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: calc((100vw - 80px) / 6);
  grid-auto-flow: row dense;
  gap: 1px;
  width: 100%;
}

/* ══════════════════════════════════════════════
   Importance tiers
   ══════════════════════════════════════════════ */
.menu-cell--imp3 {
  grid-column: span 2;
  grid-row: span 2;
}
.menu-cell--imp3 .menu-cell__label {
  font-size: clamp(2rem, 5.5vw, 6rem);
}

.menu-cell--imp2 {
  grid-column: span 2;
  grid-row: span 1;
}
.menu-cell--imp2 .menu-cell__label {
  font-size: clamp(1.2rem, 2.8vw, 3rem);
}

.menu-cell--imp1 .menu-cell__label {
  font-size: clamp(0.85rem, 1.6vw, 1.8rem);
  color: rgba(255, 255, 255, 0.35);
}
.menu-cell--imp1:hover .menu-cell__label {
  color: rgba(255, 255, 255, 0.85);
}

/* ══════════════════════════════════════════════
   Cells — frosted glass panels
   Plain backdrop-blur over the page content, faint
   diagonal highlight, inset bevel for thickness.
   ══════════════════════════════════════════════ */
.menu-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding: clamp(0.5rem, 1.5vw, 1.25rem);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 55%),
    rgba(14, 14, 14, 0.82);
  box-shadow:
    inset  1px  1px 0 rgba(255, 255, 255, 0.07),
    inset -1px -1px 0 rgba(0,   0,   0,   0.22);
  border: none;
  overflow: hidden;
  transition: background 0.25s ease;
  text-align: left;
}

.menu-cell:not(.menu-cell--deco):hover {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 55%),
    rgba(28, 28, 28, 0.88);
}

.menu-cell--active {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 55%),
    rgba(28, 28, 28, 0.85);
}

.menu-cell--deco {
  pointer-events: none;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 55%),
    rgba(14, 14, 14, 0.78);
}

/* Index label — top-left */
.menu-cell__num {
  position: absolute;
  top: clamp(0.4rem, 1vw, 0.85rem);
  left: clamp(0.4rem, 1vw, 0.85rem);
  font-family: "IBM Plex Mono", monospace;
  font-size: clamp(0.45rem, 0.6vw, 0.6rem);
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.18);
  text-transform: uppercase;
  transition: color 0.2s;
}

.menu-cell:hover .menu-cell__num,
.menu-cell--active .menu-cell__num {
  color: rgba(255, 255, 255, 0.4);
}

/* Page label — bottom-left */
.menu-cell__label {
  font-family: "Instrument Serif", serif;
  font-size: clamp(1.2rem, 3vw, 3rem);
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: -0.02em;
  font-weight: 400;
  line-height: 1;
  transition: color 0.2s;
  user-select: none;
}

.menu-cell:hover .menu-cell__label {
  color: rgba(255, 255, 255, 0.98);
}

.menu-cell--active .menu-cell__label {
  color: rgba(255, 255, 255, 0.9);
}

/* ══════════════════════════════════════════════
   Edge-aware slide animation
   Each cell receives per-instance --from-x / --from-y from JS, computed
   so the cell starts parked just outside the overlay edge nearest to it.
   --delay staggers the in-wave from border inward;
   --out-delay reverses it on close.
   ══════════════════════════════════════════════ */
/* No opacity transition — cells start fully outside the overlay edge (JS sets
   --from-x/--from-y to the full offset to outside) and overflow:hidden on
   .menu-overlay clips them until they slide into view, so they appear as a
   clean push from the edge rather than fading in mid-grid. */
@keyframes cell-from-edge {
  from { transform: translate(var(--from-x, 0), var(--from-y, 0)); }
  to   { transform: translate(0, 0); }
}

@keyframes cell-to-edge {
  from { transform: translate(0, 0); }
  to   { transform: translate(var(--from-x, 0), var(--from-y, 0)); }
}

.menu-cell {
  animation: cell-from-edge 0.52s cubic-bezier(0.22, 0.7, 0.2, 1) var(--delay, 0ms) both;
  will-change: transform, opacity;
}

.menu-cell--out {
  animation: cell-to-edge 0.4s cubic-bezier(0.55, 0.05, 0.75, 0.4) var(--out-delay, 0ms) both;
}

@media (prefers-reduced-motion: reduce) {
  .menu-cell,
  .menu-cell--out {
    animation-duration: 0.001s;
  }
}

/* ══════════════════════════════════════════════
   Responsive — tablet (641px – 1024px)
   ══════════════════════════════════════════════ */
@media (max-width: 1024px) and (min-width: 641px) {
  .nav-burger {
    display: flex;
  }

  .menu-hint {
    display: none;
  }

  .menu-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: calc((100vw - 80px) / 4);
  }

  .menu-cell--imp3 .menu-cell__label { font-size: clamp(2rem, 8vw, 5rem); }
  .menu-cell--imp2 .menu-cell__label { font-size: clamp(1.2rem, 4vw, 2.5rem); }
  .menu-cell--imp1 .menu-cell__label { font-size: clamp(0.85rem, 3vw, 1.8rem); }
}

/* ══════════════════════════════════════════════
   Responsive — mobile (≤640px, inset 16px)
   ══════════════════════════════════════════════ */
@media (max-width: 640px) {
  .nav-burger {
    display: flex;
  }

  .menu-hint {
    display: none;
  }

  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: calc((100vw - 32px) / 2);
  }

  .menu-cell--imp3,
  .menu-cell--imp2 {
    grid-column: span 1;
    grid-row: span 1;
  }

  .menu-cell--imp3 .menu-cell__label { font-size: clamp(1.5rem, 9vw, 2.8rem); }
  .menu-cell--imp2 .menu-cell__label { font-size: clamp(1.1rem, 7vw, 2rem); }
  .menu-cell--imp1 .menu-cell__label { font-size: clamp(0.85rem, 5vw, 1.5rem); }
}

</style>
