import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

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
  { key: "colophon",     label: "Colophon",     path: "/colophon",      importance: 1 },
];

const dir = (i) => ["top", "left", "bottom", "right"][i % 4];

// Duration (ms) the exit animation plays before the overlay unmounts
const EXIT_MS = 360;

// Compute the overlay inset so the grid rows snap flush to the border frame.
// Horizontal inset is fixed (matches body::before); vertical inset is adjusted
// so that exactly N whole rows fit with zero leftover pixels.
function getMenuGeometry() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const mobile = W <= 640;
  const tablet = W <= 1024 && !mobile;
  const cols   = mobile ? 2 : tablet ? 4 : 6;
  const h      = mobile ? 16 : 40;          // horizontal inset in px
  const cell   = (W - 2 * h) / cols;        // exact cell size
  const rows   = Math.floor((H - 2 * h) / cell);
  const v      = (H - rows * cell) / 2;     // vertical inset for perfect fit
  return { top: v, right: h, bottom: v, left: h, rows, cols, cell };
}

export default function Navbar({ view }) {
  const [open,         setOpen]         = useState(false);
  const [closing,      setClosing]      = useState(false);
  const [overlayStyle, setOverlayStyle] = useState({});
  const [decoCount,    setDecoCount]    = useState(12);
  const closeTimer = useRef(null);
  const navigate   = useNavigate();

  const close = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      // Remove the computed frame variable — border snaps back to default
      document.documentElement.style.removeProperty("--frame-v");
    }, EXIT_MS);
  };

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    document.documentElement.style.removeProperty("--frame-v");
  }, []);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closing]);

  const handleOpen = () => {
    const geo = getMenuGeometry();

    // Tell body::before to match the computed vertical inset
    document.documentElement.style.setProperty("--frame-v", `${geo.top}px`);

    // Enough deco cells to fill all rows beyond the nav items
    const sorted = [...NAV_ITEMS]
      .sort((a, b) => b.importance - a.importance)
      .filter((item) => item.key !== view);
    const totalSlots = geo.rows * geo.cols;
    setDecoCount(Math.max(0, totalSlots - sorted.length));

    setOverlayStyle({
      top:    geo.top,
      right:  geo.right,
      bottom: geo.bottom,
      left:   geo.left,
    });
    setOpen(true);
  };

  const handleNav = (item) => {
    close();
    setTimeout(() => {
      if (item.external) window.location.href = item.path;
      else navigate(item.path);
    }, EXIT_MS);
  };

  const sorted = [...NAV_ITEMS]
    .sort((a, b) => b.importance - a.importance)
    .filter((item) => item.key !== view);

  return (
    <>
      {/* Hamburger / X toggle */}
      <button
        className={`nav-burger${open ? " nav-burger--open" : ""}`}
        onClick={() => { if (open) close(); else handleOpen(); }}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Bento grid overlay — inset computed for pixel-perfect row fit */}
      {open && (
        <div
          className={`menu-overlay${closing ? " menu-overlay--closing" : ""}`}
          style={overlayStyle}
          onClick={close}
        >
          <div className="menu-grid" onClick={(e) => e.stopPropagation()}>

            {sorted.map((item, i) => (
              <button
                key={item.key}
                className={[
                  "menu-cell",
                  `menu-cell--imp${item.importance}`,
                  `menu-cell--${dir(i)}`,
                  closing ? "menu-cell--out" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  "--delay":     `${i * 50}ms`,
                  "--out-delay": `${(sorted.length - 1 - i) * 32}ms`,
                }}
                onClick={() => handleNav(item)}
              >
                <span className="menu-cell__num">0{i + 1}</span>
                <span className="menu-cell__label">{item.label}</span>
              </button>
            ))}

            {Array.from({ length: decoCount }, (_, i) => (
              <div
                key={`deco-${i}`}
                className={[
                  "menu-cell",
                  "menu-cell--deco",
                  `menu-cell--${dir(sorted.length + i)}`,
                  closing ? "menu-cell--out" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  "--delay":     `${(sorted.length + i) * 22}ms`,
                  "--out-delay": "0ms",
                }}
              />
            ))}

          </div>
        </div>
      )}
    </>
  );
}
