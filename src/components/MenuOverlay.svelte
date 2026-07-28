<script>
  import { onMount, onDestroy } from "svelte";
  import { navigate } from "svelte-routing";
  import "./MenuOverlay.css";

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
      else navigate(item.path);
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
