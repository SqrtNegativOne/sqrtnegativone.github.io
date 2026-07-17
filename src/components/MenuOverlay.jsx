import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./MenuOverlay.css";

// importance: 3 = 2×2 square, 2 = 2×1 wide rectangle, 1 = 1×1 square
// Sorted descending before render → highest importance lands upper-left.
// Current page is filtered out so it never appears as a nav target.
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

// Compute the overlay inset so the grid rows snap flush to the border frame.
function getMenuGeometry() {
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

// Simulate grid-auto-flow: row dense — returns {row, col, w, h} for each item
// in the order provided so we know where every cell actually lands.
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

// Pick the border edge a cell is closest to, and the translate offset that
// parks the cell fully outside that edge of the overlay (not just one cell
// away from its own slot). Combined with overflow:hidden on .menu-overlay,
// this means cells are clipped while sliding in and only appear once they
// cross into the overlay — no mid-grid pop-in.
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

export default function MenuOverlay({ view, hideHint }) {
  const [open,         setOpen]         = useState(false);
  const [closing,      setClosing]      = useState(false);
  const [overlayStyle, setOverlayStyle] = useState({});
  const [layout,       setLayout]       = useState({ nav: [], deco: [], maxDist: 0 });
  const closeTimer = useRef(null);
  const navigate   = useNavigate();

  const close = () => {
    if (closing) return;
    setClosing(true);
    // Start the border-frame transition immediately so it animates in parallel
    // with the cells sliding out, instead of racing with a route change at
    // EXIT_MS (which can cancel the transition during the React re-render).
    document.documentElement.style.removeProperty("--frame-v");
    document.body.classList.remove("menu-is-open");
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, EXIT_MS);
  };

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    document.documentElement.style.removeProperty("--frame-v");
    document.body.classList.remove("menu-is-open");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closing]);

  // Desktop only: pressing Space anywhere opens the menu (unless typing in a field).
  useEffect(() => {
    if (open) return;
    const onKey = (e) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (window.innerWidth <= 640) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      handleOpen();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleOpen = () => {
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

    setLayout({ nav, deco, maxDist });
    setOverlayStyle({ top: geo.top, right: geo.right, bottom: geo.bottom, left: geo.left });
    setOpen(true);
  };

  const handleNav = (item) => {
    close();
    setTimeout(() => {
      if (item.external) window.location.href = item.path;
      else navigate(item.path);
    }, EXIT_MS);
  };

  // Stagger so the wave radiates from the border inward.
  // Closing reverses it: interior leaves first, edge cells retreat last.
  const inDelay  = (dist) => `${dist * 60}ms`;
  const outDelay = (dist) => `${(layout.maxDist - dist) * 35}ms`;

  return (
    <>
      <button
        className={`nav-burger${open ? " nav-burger--open" : ""}`}
        onClick={() => { if (open) close(); else handleOpen(); }}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span />
        <span />
        <span />
      </button>

      {!hideHint && (
        <div className="menu-hint" aria-hidden="true" onClick={() => { if (!open) handleOpen(); }} style={{cursor: 'pointer'}}>press space to activate menu</div>
      )}

      {open && (
        <div
          className={`menu-scrim${closing ? " menu-scrim--closing" : ""}`}
          style={overlayStyle}
          onClick={close}
        />
      )}

      {open && (
        <div
          className={`menu-overlay${closing ? " menu-overlay--closing" : ""}`}
          style={overlayStyle}
          onClick={close}
        >
          <div className="menu-grid" onClick={(e) => e.stopPropagation()}>
            {layout.nav.map(({ item, motion }, i) => (
              <button
                key={item.key}
                className={[
                  "menu-cell",
                  `menu-cell--imp${item.importance}`,
                  closing ? "menu-cell--out" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  "--from-x":    `${motion.x}px`,
                  "--from-y":    `${motion.y}px`,
                  "--delay":     inDelay(motion.dist),
                  "--out-delay": outDelay(motion.dist),
                }}
                onClick={() => handleNav(item)}
              >
                <span className="menu-cell__num">0{i + 1}</span>
                <span className="menu-cell__label">{item.label}</span>
              </button>
            ))}

            {layout.deco.map(({ motion }, i) => (
              <div
                key={`deco-${i}`}
                className={[
                  "menu-cell",
                  "menu-cell--deco",
                  closing ? "menu-cell--out" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  "--from-x":    `${motion.x}px`,
                  "--from-y":    `${motion.y}px`,
                  "--delay":     inDelay(motion.dist),
                  "--out-delay": outDelay(motion.dist),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
