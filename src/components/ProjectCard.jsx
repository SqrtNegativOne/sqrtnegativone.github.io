import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import ShaderImage from "./ShaderImage";


const GithubIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false);
  const modalRef = useRef(null);
  const id = useId();
  const cardId = `card-${project.id}-${id}`;
  const imgId = `img-${project.id}-${id}`;
  const titleId = `title-${project.id}-${id}`;

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useOutsideClick(modalRef, () => setExpanded(false));

  return (
    <>
      {/* ── Portal: backdrop + expanded modal ─────── */}
      {createPortal(
        <AnimatePresence>
          {expanded && (
            <>
              {/* Dim backdrop */}
              <motion.div
                className="fixed inset-0 z-[10001] bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpanded(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 z-[10002] grid place-items-center p-6 pointer-events-none">
                <motion.div
                  layoutId={cardId}
                  ref={modalRef}
                  className="pointer-events-auto w-full max-w-[480px] max-h-[85vh] overflow-y-auto [scrollbar-width:none] flex flex-col bg-[var(--bg)] border border-[var(--text-secondary)]"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setExpanded(false)}
                    aria-label="Close"
                    className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center border border-[var(--glass-border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-secondary)] transition-colors font-['IBM_Plex_Mono'] text-xs"
                  >
                    ×
                  </button>

                  {/* Image */}
                  {project.image && (
                    <motion.div
                      layoutId={imgId}
                      className="w-full h-64 flex-shrink-0"
                    >
                      <ShaderImage
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full"
                        width={480}
                        height={256}
                      />
                    </motion.div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <motion.h2
                          layoutId={titleId}
                          className="font-['Instrument_Serif'] italic text-2xl font-normal text-[var(--text)] leading-tight"
                        >
                          {project.name}
                        </motion.h2>
                        {project.private && (
                          <span className="font-['IBM_Plex_Mono'] text-[0.5rem] tracking-widest border border-[var(--glass-border)] px-1.5 py-0.5 text-[var(--text-secondary)] opacity-60 mt-1 inline-block">
                            private
                          </span>
                        )}
                      </div>
                      {(project.github || project.url) && (
                        <div className="flex gap-3 flex-shrink-0 mt-1">
                          {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer"
                              className="font-['IBM_Plex_Mono'] text-[0.6rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1.5 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
                              <GithubIcon /> src
                            </a>
                          )}
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer"
                              className="font-['IBM_Plex_Mono'] text-[0.6rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1.5 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
                              <ExternalIcon /> live
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <motion.p
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-['Inter'] text-sm text-[var(--text-secondary)] leading-relaxed"
                    >
                      {project.description}
                    </motion.p>

                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {project.tags.map((tag) => (
                          <span key={tag} className="font-['IBM_Plex_Mono'] text-[0.5rem] tracking-wide text-[var(--text-secondary)] opacity-55">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Collapsed card in carousel ─────────────── */}
      <motion.article
        layoutId={cardId}
        className="project-card flex-none w-[360px] flex flex-col border border-[var(--glass-border)] hover:border-[var(--text-secondary)] transition-all overflow-hidden cursor-pointer group hover:shadow-[0_0_24px_rgba(var(--text-secondary-rgb),0.15)]"
        style={{ visibility: expanded ? "hidden" : "visible" }}
        onClick={() => setExpanded(true)}
      >
        {/* Image */}
        {project.image ? (
          <motion.div
            layoutId={imgId}
            className="w-full h-52 flex-shrink-0"
          >
            <ShaderImage
              src={project.image}
              alt={project.name}
              className="w-full h-full"
              width={360}
              height={208}
            />
          </motion.div>
        ) : (
          /* Placeholder when no image — subtle gradient */
          <div className="w-full h-52 flex-shrink-0 bg-gradient-to-br from-[var(--glass-bg)] to-transparent flex items-center justify-center">
            <span className="font-['IBM_Plex_Mono'] text-[2rem] opacity-10 select-none">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}

        {/* Text area */}
        <div className="flex flex-col flex-1 p-6 gap-0">
          {/* Header row */}
          <div className="flex justify-end items-center mb-3">
            <div className="flex items-center gap-2">
              {project.private && (
                <span className="font-['IBM_Plex_Mono'] text-[0.45rem] tracking-widest border border-[var(--glass-border)] px-1.5 py-0.5 text-[var(--text-secondary)] opacity-60">
                  private
                </span>
              )}
              <span className="font-['IBM_Plex_Mono'] text-[0.45rem] tracking-widest text-[var(--text-secondary)] opacity-0 group-hover:opacity-50 transition-opacity">
                expand ↗
              </span>
            </div>
          </div>

          {/* Title + description */}
          <div className="flex flex-col flex-1 gap-2">
            <motion.h3
              layoutId={titleId}
              className="font-['Instrument_Serif'] italic text-lg font-normal text-[var(--text)] leading-snug"
            >
              {project.name}
            </motion.h3>
            <p className="font-['Inter'] text-[0.72rem] text-[var(--text-secondary)] leading-relaxed line-clamp-4 flex-1">
              {project.description}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-col gap-1.5">
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {project.tags.map((tag) => (
                  <span key={tag} className="font-['IBM_Plex_Mono'] text-[0.45rem] tracking-wide text-[var(--text-secondary)] opacity-55">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {(project.github || project.url) && (
              <div className="flex gap-3 mt-1">
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-['IBM_Plex_Mono'] text-[0.5rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
                    <GithubIcon /> src
                  </a>
                )}
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-['IBM_Plex_Mono'] text-[0.5rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
                    <ExternalIcon /> live
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </>
  );
}
