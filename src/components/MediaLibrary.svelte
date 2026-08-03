<script>
  import mediaData from "../data/media.json";
  

  const TYPE_LABEL = { game: "Game", movie: "Movie", show: "Show", book: "Book" };

  const { doing, done, todo } = (() => {
    const buckets = { doing: [], done: [], todo: [] };
    for (const item of mediaData) {
      (buckets[item.status] || (buckets[item.status] = [])).push(item);
    }
    for (const k of Object.keys(buckets)) {
      buckets[k].sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title));
    }
    return buckets;
  })();
</script>

<div class="ml-root">
  <header class="ml-header">
    <h1 class="ml-title">Media Library</h1>
    <p class="ml-tagline">Things I'm watching, reading, playing.</p>
  </header>

  {#if doing.length > 0}
    <section class="ml-section ml-section--hero">
      <h2 class="ml-section-title">Currently</h2>
      <div class="ml-hero-row">
        {#each doing as item (item.type + '-' + item.id)}
          <article class="ml-hero-card">
            <div class="ml-poster ml-poster--lg">
              {#if item.poster}
                <img src={item.poster} alt="" loading="lazy" />
              {:else}
                <div class="ml-poster-fallback">
                  <span>{TYPE_LABEL[item.type] || item.type}</span>
                </div>
              {/if}
              <span class={`ml-badge ml-badge--${item.type}`}>{TYPE_LABEL[item.type] || item.type}</span>
            </div>
            <div class="ml-hero-meta">
              <div class="ml-hero-title-row">
                <h3 class="ml-hero-title">{item.title}</h3>
                <span class="ml-rating" aria-label={`${item.rating} out of 7`}>
                  <span class="ml-rating-num">{item.rating}</span>
                  <span class="ml-rating-sep">/</span>
                  <span class="ml-rating-max">7</span>
                </span>
              </div>
              {#if item.subtitle}
                <p class="ml-hero-sub">{item.subtitle}</p>
              {/if}
              <p class="ml-hero-line">
                {TYPE_LABEL[item.type] || item.type}
                {item.year ? ` · ${item.year}` : ""}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/if}

  {#if done.length > 0 || todo.length > 0}
    <section class="ml-section">
      <h2 class="ml-section-title">Library</h2>
      <div class="ml-table" role="table">
        <div class="ml-table-head" role="row">
          <span role="columnheader" class="ml-col-poster"></span>
          <span role="columnheader" class="ml-col-title">Title</span>
          <span role="columnheader" class="ml-col-type">Type</span>
          <span role="columnheader" class="ml-col-status">Status</span>
          <span role="columnheader" class="ml-col-rating">Rating</span>
        </div>
        {#each [...done, ...todo] as item (item.type + '-' + item.id)}
          <div class="ml-row" role="row">
            <span role="cell" class="ml-col-poster">
              <div class={`ml-poster ml-poster--xs`}>
                {#if item.poster}
                  <img src={item.poster} alt="" loading="lazy" />
                {:else}
                  <div class="ml-poster-fallback">
                    <span>{TYPE_LABEL[item.type] || item.type}</span>
                  </div>
                {/if}
                <span class={`ml-badge ml-badge--${item.type}`}>{TYPE_LABEL[item.type] || item.type}</span>
              </div>
            </span>
            <span role="cell" class="ml-col-title">
              <span class="ml-row-title">{item.title}</span>
              {#if item.subtitle}
                <span class="ml-row-sub">{item.subtitle}</span>
              {/if}
            </span>
            <span role="cell" class="ml-col-type">{TYPE_LABEL[item.type] || item.type}</span>
            <span role="cell" class="ml-col-status">
              <span class={`ml-status ml-status--${item.status}`}>{item.status}</span>
            </span>
            <span role="cell" class="ml-col-rating">
              <span class="ml-rating" aria-label={`${item.rating} out of 7`}>
                <span class="ml-rating-num">{item.rating}</span>
                <span class="ml-rating-sep">/</span>
                <span class="ml-rating-max">7</span>
              </span>
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if mediaData.length === 0}
    <p class="ml-empty">Nothing here yet.</p>
  {/if}
</div>

<style>
/* Media Library — standalone Netflix-ish layout, intentionally not matching
   the rest of the site. Lives in a fixed full-viewport panel so the global
   border frame / portrait / nav of the SPA shell don't interfere. */

.ml-root {
  position: fixed;
  inset: 0;
  z-index: 5;
  overflow-y: auto;
  background: #0b0b0d;
  color: #f5f5f7;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  padding: clamp(24px, 5vw, 64px) clamp(20px, 5vw, 72px) 96px;
  -webkit-font-smoothing: antialiased;
}

.ml-header {
  margin-bottom: 40px;
  padding-right: 60px; /* leave room for the hamburger */
}

.ml-title {
  font-family: "Instrument Serif", "Iowan Old Style", Georgia, serif;
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1;
}

.ml-tagline {
  margin: 12px 0 0;
  color: #8a8a93;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.ml-section {
  margin-top: 48px;
}

.ml-section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #b8b8c0;
  margin: 0 0 16px;
}

/* ---------- Hero row (currently doing) ---------- */

.ml-hero-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.ml-hero-card {
  background: linear-gradient(180deg, #18181c 0%, #111114 100%);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 180ms ease, box-shadow 180ms ease;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset;
}

.ml-hero-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.ml-hero-meta {
  padding: 16px 18px 20px;
}

.ml-hero-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.ml-hero-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.ml-hero-sub {
  margin: 6px 0 0;
  color: #9a9aa3;
  font-size: 13px;
  line-height: 1.4;
}

.ml-hero-line {
  margin: 10px 0 0;
  color: #6e6e78;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ---------- Poster element ---------- */

.ml-poster {
  position: relative;
  background: #1d1d22;
  overflow: hidden;
}

.ml-poster img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ml-poster--lg {
  aspect-ratio: 2 / 3;
  width: 100%;
}

.ml-poster--sm {
  aspect-ratio: 2 / 3;
  width: 100%;
  border-radius: 6px;
}

.ml-poster--xs {
  aspect-ratio: 2 / 3;
  width: 44px;
  border-radius: 4px;
  flex-shrink: 0;
}

.ml-poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(
    135deg,
    #1d1d22 0px,
    #1d1d22 8px,
    #16161a 8px,
    #16161a 16px
  );
  color: #4d4d56;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ml-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 3px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: rgba(0, 0, 0, 0.65);
  color: #f5f5f7;
  backdrop-filter: blur(4px);
}

.ml-badge--game  { background: rgba(132, 73, 230, 0.85); }
.ml-badge--movie { background: rgba(229, 9, 20, 0.85); }
.ml-badge--show  { background: rgba(0, 122, 200, 0.85); }
.ml-badge--book  { background: rgba(184, 134, 11, 0.85); }

/* ---------- Rating ---------- */

.ml-rating {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 12px;
  color: #f5f5f7;
  white-space: nowrap;
}

.ml-rating-num {
  font-weight: 600;
}

.ml-rating-sep,
.ml-rating-max {
  color: #6e6e78;
}

/* ---------- Table / library grid ---------- */

.ml-table {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #1f1f25;
}

.ml-table-head,
.ml-row {
  display: grid;
  grid-template-columns: 60px 1fr 100px 110px 90px;
  align-items: center;
  gap: 16px;
  padding: 12px 8px;
  border-bottom: 1px solid #1f1f25;
}

.ml-table-head {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6e6e78;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  padding-top: 8px;
  padding-bottom: 8px;
}

.ml-row {
  transition: background-color 120ms ease;
}

.ml-row:hover {
  background-color: #14141a;
}

.ml-row-title {
  display: block;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.005em;
}

.ml-row-sub {
  display: block;
  font-size: 12px;
  color: #8a8a93;
  margin-top: 2px;
}

.ml-col-type {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 12px;
  color: #b8b8c0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ml-status {
  display: inline-block;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 3px;
}

.ml-status--doing { background: rgba(255, 200, 60, 0.15);  color: #ffcc55; }
.ml-status--done  { background: rgba(80, 200, 120, 0.15);  color: #5dd29a; }
.ml-status--todo  { background: rgba(120, 130, 150, 0.15); color: #9aa2b2; }

.ml-empty {
  color: #6e6e78;
  text-align: center;
  padding: 80px 0;
  font-style: italic;
}

/* ---------- Responsive ---------- */

@media (max-width: 640px) {
  .ml-root {
    padding: 28px 18px 80px;
  }

  .ml-hero-row {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .ml-hero-title { font-size: 16px; }

  .ml-table-head {
    display: none;
  }

  .ml-row {
    grid-template-columns: 44px 1fr auto;
    grid-template-areas:
      "poster title rating"
      "poster meta  meta";
    row-gap: 4px;
  }

  .ml-row .ml-col-poster { grid-area: poster; }
  .ml-row .ml-col-title  { grid-area: title;  }
  .ml-row .ml-col-rating { grid-area: rating; }
  .ml-row .ml-col-type,
  .ml-row .ml-col-status {
    grid-area: meta;
    display: inline-block;
    margin-right: 10px;
  }
}

</style>
