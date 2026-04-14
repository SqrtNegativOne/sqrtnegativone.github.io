import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/" },
  { key: "about", label: "About", path: "/about" },
  { key: "skills", label: "Skills", path: "/skills" },
  { key: "projects", label: "Projects", path: "/projects" },
  { key: "contact", label: "Contact", path: "/contact" },
];

export default function Navbar({ view }) {
  const [open, setOpen] = useState(true);
  const navRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside (for mobile tap-to-open)
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <nav
      className={`nav-pill${open ? " open" : ""}`}
      ref={navRef}
      onClick={() => setOpen((prev) => !prev)}
    >
      <svg
        className="nav-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
      <div className="nav-links">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-link${view === item.key ? " active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(item.path);
            }}
          >
            {item.label}
          </button>
        ))}
        <a
          className="nav-link"
          href="/blog/"
          onClick={(e) => e.stopPropagation()}
        >
          Blog
        </a>
      </div>
    </nav>
  );
}
