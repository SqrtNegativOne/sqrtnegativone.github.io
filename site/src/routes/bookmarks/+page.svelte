<script lang="ts">
  import Seo from '$shared/components/Seo.svelte';

  type Article = {
    title: string;
    author: string;
    source: string;
    url: string;
    readMinutes: number;
  };

  const articles: Article[] = [
    {
      title: 'Meditations on Moloch',
      author: 'Scott Alexander',
      source: 'slatestarcodex.com',
      url: 'https://slatestarcodex.com/2014/07/30/meditations-on-moloch/',
      readMinutes: 72,
    },
    {
      title: 'The Goddess of Everything Else (Part 2)',
      author: 'Scott Alexander',
      source: 'slatestarcodex.com',
      url: 'https://slatestarcodex.com/2015/08/17/the-goddess-of-everything-else-2/',
      readMinutes: 12,
    },
    {
      title: 'King Ludd',
      author: 'Scott Alexander',
      source: 'astralcodexten.com',
      url: 'https://www.astralcodexten.com/p/king-ludd',
      readMinutes: 15,
    },
    {
      title: 'Being John Rawls',
      author: 'Scott Alexander',
      source: 'astralcodexten.com',
      url: 'https://www.astralcodexten.com/p/being-john-rawls',
      readMinutes: 27,
    },
    {
      title: 'Our AI Midwife',
      author: 'Drew Housman',
      source: 'astralcodexten.com',
      url: 'https://www.astralcodexten.com/p/our-ai-midwife',
      readMinutes: 8,
    },
    {
      title: '…And I Show You How Deep The Rabbit Hole Goes',
      author: 'LessWrong',
      source: 'lesswrong.com',
      url: 'https://www.lesswrong.com/posts/wJnm5cBiZGmKn595f/and-i-show-you-how-deep-the-rabbit-hole-goes',
      readMinutes: 33,
    },
    {
      title: "Plans you're not supposed to talk about",
      author: 'Dino Thomas',
      source: 'dynomight.net',
      url: 'https://dynomight.net/plans/',
      readMinutes: 10,
    },
  ];

  type Site = {
    name: string;
    note: string;
    url: string;
  };

  const websites: Site[] = [
    { name: 'billwurtz.com', note: 'bill wurtz', url: 'https://billwurtz.com/' },
    { name: 'neal.fun', note: 'neal agham', url: 'https://neal.fun' },
    {
      name: 'About these notes',
      note: 'andy matuschak',
      url: 'https://notes.andymatuschak.org/About_these_notes',
    },
  ];

  const totalRead = articles.reduce((sum, a) => sum + a.readMinutes, 0);
</script>

<Seo
  title="Bookmarks — Sqrt-1"
  description="Articles and websites Sqrt-1 keeps coming back to."
  path="/bookmarks"
/>

<div class="bookmarks-layout">
  <header class="bookmarks-header">
    <h1 class="bookmarks-title">
      <em>the</em>
      <span>BOOKMARKS</span>
    </h1>
    <a class="bookmarks-back" href="/">← Back to site</a>
  </header>

  <div class="bookmarks-divider"></div>

  <div class="bookmarks-content">
    <!-- Favourite articles -->
    <section aria-labelledby="articles-heading">
      <div class="section-head">
        <h2 id="articles-heading" class="section-title">favourite articles</h2>
        <span class="section-meta">
          {articles.length} articles · ~{totalRead} min total read
        </span>
      </div>

      <ul class="article-list">
        {#each articles as article (article.url)}
          <li class="article-item">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              class="article-link">
              <div class="article-top">
                <h3 class="article-title">{article.title}</h3>
                <span class="read-time" aria-label="Estimated time to read: {article.readMinutes} minutes">
                  ~{article.readMinutes} min
                </span>
              </div>
              <div class="article-meta">
                <span class="article-author">{article.author}</span>
                <span class="article-source" aria-hidden="true">·</span>
                <span class="article-source">{article.source}</span>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </section>

    <!-- Favourite websites -->
    <section aria-labelledby="websites-heading">
      <div class="section-head">
        <h2 id="websites-heading" class="section-title">favourite websites</h2>
        <span class="section-meta">{websites.length} sites</span>
      </div>

      <ul class="site-list">
        {#each websites as site (site.url)}
          <li class="site-item">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              class="site-link">
              <h3 class="site-name">{site.name}</h3>
              <span class="site-note">{site.note}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>

    <p class="footnote">
      Reading times are estimates at a typical reading pace — Moloch is not
      a weekend read.
    </p>
  </div>
</div>

<style>
  .bookmarks-layout {
    display: flex;
    min-height: 100vh;
    padding: 4rem;
    box-sizing: border-box;
    width: 100%;
  }

  .bookmarks-header {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    padding-bottom: 2rem;
    padding-right: 3rem;
  }

  .bookmarks-title {
    font-family: "Instrument Serif", serif;
    font-weight: 400;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    line-height: 1;
    color: var(--text);
    margin: 0;
  }

  .bookmarks-title em {
    font-style: italic;
    font-weight: 400;
  }

  .bookmarks-title span {
    display: block;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .bookmarks-back {
    display: block;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.7rem;
    font-weight: 300;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    text-decoration: none;
    margin-top: 1rem;
    transition: color 0.2s;
  }

  .bookmarks-back:hover {
    color: var(--text);
  }

  .bookmarks-divider {
    flex-shrink: 0;
    width: 1px;
    background: var(--text);
    opacity: 0.18;
    align-self: stretch;
  }

  .bookmarks-content {
    flex: 1;
    padding-left: 3rem;
    padding-top: 2rem;
    max-width: 56rem;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .section-title {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text);
    margin: 0;
  }

  .section-title::before {
    content: "> ";
    color: var(--text-secondary);
  }

  .section-meta {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.7rem;
    font-weight: 300;
    color: var(--text-secondary);
  }

  .article-list,
  .site-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 0;
    margin: 0 0 3rem;
  }

  .article-link,
  .site-link {
    text-decoration: none;
    color: var(--text);
    display: block;
    padding: 1rem 1.2rem;
    border: 1px solid oklch(1 0 0 / 0.08);
    border-radius: 8px;
    transition: background 0.25s, border-color 0.25s;
  }

  .article-link:hover,
  .site-link:hover {
    background: oklch(1 0 0 / 0.04);
    border-color: oklch(1 0 0 / 0.15);
  }

  .article-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .article-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .read-time {
    flex-shrink: 0;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    font-weight: 300;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    padding: 0.15rem 0.5rem;
    border: 1px solid oklch(1 0 0 / 0.12);
    border-radius: 999px;
    white-space: nowrap;
  }

  .article-meta {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-top: 0.3rem;
  }

  .article-author {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .article-source {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.8;
  }

  .site-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .site-note {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.2rem;
  }

  .footnote {
    font-size: 0.8rem;
    color: var(--text-secondary);
    opacity: 0.75;
    margin: 0;
  }

  @media (max-width: 640px) {
    .bookmarks-layout {
      flex-direction: column;
      padding: 4rem 1.5rem;
    }

    .bookmarks-header {
      padding-right: 0;
      padding-bottom: 1.5rem;
      align-items: flex-start;
    }

    .bookmarks-divider {
      width: auto;
      height: 1px;
      align-self: stretch;
    }

    .bookmarks-content {
      padding-left: 0;
      padding-top: 1.5rem;
      max-width: 100%;
    }

    .article-top {
      flex-wrap: wrap;
    }
  }
</style>
