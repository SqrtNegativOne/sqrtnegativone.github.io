import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";
import Cursor from "./components/Cursor";

import Bio from "./components/Bio";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import Quote from "./components/Quote";
import HeroName from "./components/HeroName";
import HalftoneImage from "./components/HalftoneImage";
import Home from "./components/Home";
import { useQuote } from "./hooks/useQuote";
import "./App.css";

// Known React routes — everything else is a 404
const KNOWN_ROUTES = ["/", "/about", "/skills", "/projects", "/contact"];

// Pages where the portrait should be hidden
const HIDE_PORTRAIT = ["/skills", "/projects"];

function App() {
  const location = useLocation();
  const quote = useQuote();

  const isKnown = KNOWN_ROUTES.includes(location.pathname);

  // 404 gets its own minimal layout — no name, no portrait, no quote
  if (!isKnown) {
    return (
      <>
        <NotFound />
        <ThemeToggle />
        <Cursor />
      </>
    );
  }

  // Home gets a full-screen layout — canvas + name/quote overlay + nav + cursor
  if (location.pathname === "/") {
    return (
      <>
        <Home />
        <div className="home-name-overlay">
          <Quote displayed={quote.displayed} phase={quote.phase} onCycle={quote.cycleQuote} />
          <HeroName />
        </div>
        <Navbar view="home" />
        <ThemeToggle />
        <Cursor />
      </>
    );
  }

  // Derive the current nav key from the pathname for Navbar highlighting
  const currentView = location.pathname.slice(1); // "about", "skills", "projects", "contact"

  const showPortrait = !HIDE_PORTRAIT.includes(location.pathname);

  return (
    <div className={`page${showPortrait ? "" : " no-portrait"}`}>
      {/* Quote + Name group — top-left */}
      <div className="name-group">
        <Quote displayed={quote.displayed} phase={quote.phase} onCycle={quote.cycleQuote} />
        <footer className="bottom-bar">
          <HeroName />
        </footer>
      </div>

      {/* Portrait — bottom-left (hidden on skills/projects) */}
      {showPortrait && (
        <div className="portrait-column">
          <HalftoneImage
            src="/portraits/tower.jpg"
            alt="Ark Malhotra portrait"
            className="portrait"
          />
        </div>
      )}

      {/* Content — bottom-right, swaps based on route */}
      <main className={`content${location.pathname === "/projects" || location.pathname === "/skills" ? " content--fill" : ""}`} key={location.pathname}>
        <Routes>
          <Route path="/about" element={<Bio />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      {/* Navbar — fixed top-right */}
      <Navbar view={currentView} />

      {/* Theme toggle — left border edge */}
      <ThemeToggle />

      {/* Custom cursor */}
      <Cursor />
    </div>
  );
}

export default App;
