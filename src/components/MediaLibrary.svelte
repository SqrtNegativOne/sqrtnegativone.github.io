<script>
  import mediaData from "../data/media.json";
  import "./MediaLibrary.css";

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
            <div class={`ml-poster ml-poster--lg`}>
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
