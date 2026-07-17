import { Routes, Route, useLocation } from "react-router-dom";
import MenuOverlay from "./components/MenuOverlay";
import ThemeToggle from "./components/ThemeToggle";
import Cursor from "./components/Cursor";
import AsciiBackground from "./components/AsciiBackground";

import Bio from "./components/Bio";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import ComingSoon from "./components/ComingSoon";
import Quote from "./components/Quote";
import HeroName from "./components/HeroName";
import HalftoneImage from "./components/HalftoneImage";
import Home from "./components/Home";
import Questions from "./components/Questions";
import { useQuote } from "./hooks/useQuote";
import "./App.css";

// Known React routes — everything else is a 404
const KNOWN_ROUTES = [
  "/", "/about", "/skills", "/projects", "/contact",
  "/now", "/colophon", "/minis", "/media-library",
  "/questions",
];

// Pages where the portrait should be hidden
const HIDE_PORTRAIT = ["/skills", "/projects"];

function App() {
  const location = useLocation();
  const quote = useQuote();

  const isKnown = KNOWN_ROUTES.includes(location.pathname);

  // 404 gets its own minimal layout — no name, no portrait, no quote
  if (!isKnown) {
    return (
      <div className="with-frame">
        <AsciiBackground />
        <NotFound />
        {/* <ThemeToggle /> */}
        <Cursor />
      </div>
    );
  }

  // Home gets a full-screen layout — canvas + name/quote overlay + nav + cursor.
  // .page-content is the wrapper that fades when the menu opens — MenuOverlay
  // and Cursor live outside it so the X button and cursor stay visible.
  if (location.pathname === "/") {
    return (
      <>
        <div className="page-content with-frame">
          <AsciiBackground />
          <Home />
          <div className="home-name-overlay">
            <HeroName />
            <Quote displayed={quote.displayed} phase={quote.phase} onCycle={quote.cycleQuote} />
          </div>
        </div>
        <MenuOverlay view="home" />
        {/* <ThemeToggle /> */}
        <Cursor />
      </>
    );
  }

  // Questions gets a completely blank/black layout
  if (location.pathname === "/questions") {
    return (
      <>
        <Questions />
        <Cursor />
      </>
    );
  }

  // Derive the current nav key from the pathname for menu highlighting
  const currentView = location.pathname.slice(1); // "about", "skills", "projects", "contact", etc.

  const showPortrait = !HIDE_PORTRAIT.includes(location.pathname);

  return (
    <>
      <div className={`page page-content with-frame${showPortrait ? "" : " no-portrait"}`}>
        <AsciiBackground />
        {/* Name + Quote group — top-left */}
        <div className="name-group">
          <footer className="bottom-bar">
            <HeroName />
          </footer>
          <Quote displayed={quote.displayed} phase={quote.phase} onCycle={quote.cycleQuote} />
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
            <Route path="/about"         element={<Bio />} />
            <Route path="/skills"        element={<Skills />} />
            <Route path="/projects"      element={<Projects />} />
            <Route path="/contact"       element={<Contact />} />
            <Route path="/now"           element={<ComingSoon />} />
            <Route path="/colophon"      element={<ComingSoon />} />
            <Route path="/minis"         element={<ComingSoon />} />
            <Route path="/media-library" element={<ComingSoon />} />
          </Routes>
        </main>
      </div>

      {/* Menu — hamburger button fixed top-right, opens full-screen bento overlay */}
      <MenuOverlay view={currentView} />

      {/* Theme toggle — intentionally disabled, light mode unimplemented */}
      {/* <ThemeToggle /> */}

      {/* Custom cursor */}
      <Cursor />
    </>
  );
}

export default App;
