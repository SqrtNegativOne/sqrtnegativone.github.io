import { useMemo } from "react";
import mediaData from "../data/media.json";
import "./MediaLibrary.css";

const TYPE_LABEL = { game: "Game", movie: "Movie", show: "Show", book: "Book" };

function Rating({ value }) {
  return (
    <span className="ml-rating" aria-label={`${value} out of 7`}>
      <span className="ml-rating-num">{value}</span>
      <span className="ml-rating-sep">/</span>
      <span className="ml-rating-max">7</span>
    </span>
  );
}

function Poster({ item, size = "sm" }) {
  return (
    <div className={`ml-poster ml-poster--${size}`}>
      {item.poster ? (
        <img src={item.poster} alt="" loading="lazy" />
      ) : (
        <div className="ml-poster-fallback">
          <span>{TYPE_LABEL[item.type] || item.type}</span>
        </div>
      )}
      <span className={`ml-badge ml-badge--${item.type}`}>{TYPE_LABEL[item.type] || item.type}</span>
    </div>
  );
}

export default function MediaLibrary() {
  const { doing, done, todo } = useMemo(() => {
    const buckets = { doing: [], done: [], todo: [] };
    for (const item of mediaData) {
      (buckets[item.status] || (buckets[item.status] = [])).push(item);
    }
    // Order each bucket by rating desc, then title.
    for (const k of Object.keys(buckets)) {
      buckets[k].sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title));
    }
    return buckets;
  }, []);

  return (
    <div className="ml-root">
      <header className="ml-header">
        <h1 className="ml-title">Media Library</h1>
        <p className="ml-tagline">Things I'm watching, reading, playing.</p>
      </header>

      {doing.length > 0 && (
        <section className="ml-section ml-section--hero">
          <h2 className="ml-section-title">Currently</h2>
          <div className="ml-hero-row">
            {doing.map((item) => (
              <article key={`${item.type}-${item.id}`} className="ml-hero-card">
                <Poster item={item} size="lg" />
                <div className="ml-hero-meta">
                  <div className="ml-hero-title-row">
                    <h3 className="ml-hero-title">{item.title}</h3>
                    <Rating value={item.rating} />
                  </div>
                  {item.subtitle && <p className="ml-hero-sub">{item.subtitle}</p>}
                  <p className="ml-hero-line">
                    {TYPE_LABEL[item.type] || item.type}
                    {item.year ? ` · ${item.year}` : ""}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {(done.length > 0 || todo.length > 0) && (
        <section className="ml-section">
          <h2 className="ml-section-title">Library</h2>
          <div className="ml-table" role="table">
            <div className="ml-table-head" role="row">
              <span role="columnheader" className="ml-col-poster"></span>
              <span role="columnheader" className="ml-col-title">Title</span>
              <span role="columnheader" className="ml-col-type">Type</span>
              <span role="columnheader" className="ml-col-status">Status</span>
              <span role="columnheader" className="ml-col-rating">Rating</span>
            </div>
            {[...done, ...todo].map((item) => (
              <div key={`${item.type}-${item.id}`} className="ml-row" role="row">
                <span role="cell" className="ml-col-poster">
                  <Poster item={item} size="xs" />
                </span>
                <span role="cell" className="ml-col-title">
                  <span className="ml-row-title">{item.title}</span>
                  {item.subtitle && <span className="ml-row-sub">{item.subtitle}</span>}
                </span>
                <span role="cell" className="ml-col-type">{TYPE_LABEL[item.type] || item.type}</span>
                <span role="cell" className="ml-col-status">
                  <span className={`ml-status ml-status--${item.status}`}>{item.status}</span>
                </span>
                <span role="cell" className="ml-col-rating">
                  <Rating value={item.rating} />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {mediaData.length === 0 && (
        <p className="ml-empty">Nothing here yet.</p>
      )}
    </div>
  );
}
