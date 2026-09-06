<script>
  import Seo from '$lib/components/Seo.svelte';
  import { getPublicPosts, formatReadableDate } from '$lib/blog';

  const posts = getPublicPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'The Blog of Sqrt-1',
    'description': 'The Blog of Sqrt-1. Nothing particularly special about it.',
    'url': 'https://sqrt.fyi/blog/',
    'author': { '@type': 'Person', 'name': 'Ark Malhotra', 'url': 'https://sqrt.fyi/' }
  };
  const jsonLdHtml = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</` + `script>`;
</script>

<svelte:head>
  {@html jsonLdHtml}
</svelte:head>

<Seo
  title="Blog — Ark Malhotra"
  description="The Blog of Sqrt-1. Nothing particularly special about it."
  path="/blog/"
/>

<div class="blog-layout">
  <header class="blog-header">
    <h1 class="blog-title">
      <em>the</em>
      <span>BLOG</span>
    </h1>
    <a class="blog-feed-link" href="/feed.xml" type="application/atom+xml">atom feed</a>
  </header>

  <div class="blog-divider"></div>

  <div class="blog-content">
    <a href="/" class="blog-home-link">&larr; Back to site</a>

    <ul class="post-list">
      {#each posts as post (post.slug)}
        <li class="post-list-item">
          <a href="/blog/{post.slug}/">
            <h3 class="post-list-title">{post.title}</h3>
            {#if post.subtitle}
              <p class="post-list-subtitle">{post.subtitle}</p>
            {/if}
            <time class="post-list-date">{formatReadableDate(post.date)}</time>
            {#if post.description}
              <p class="post-list-desc">{post.description}</p>
            {/if}
            {#if post.tags}
              <div class="post-list-tags">
                {#each post.tags as tag (tag)}
                  {#if tag !== 'post' && tag !== 'afterdark'}
                    <span class="post-tag">#{tag}</span>
                  {/if}
                {/each}
              </div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .blog-layout {
    display: flex;
    min-height: 100vh;
    padding: 4rem;
    box-sizing: border-box;
    width: 100%;
  }

  .blog-header {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    padding-bottom: 2rem;
    padding-right: 3rem;
  }

  .blog-title {
    font-family: "Instrument Serif", serif;
    font-weight: 400;
    font-size: clamp(3rem, 6vw, 5rem);
    line-height: 1;
    color: var(--text);
  }

  .blog-title em {
    font-style: italic;
    font-weight: 400;
  }

  .blog-title span {
    display: block;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .blog-feed-link {
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

  .blog-feed-link:hover {
    color: var(--text);
  }

  .blog-divider {
    flex-shrink: 0;
    width: 1px;
    background: var(--text);
    opacity: 0.18;
    align-self: stretch;
  }

  .blog-content {
    flex: 1;
    padding-left: 3rem;
    padding-top: 2rem;
    overflow-y: auto;
    max-height: 100vh;
  }

  .blog-home-link {
    display: inline-block;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.7rem;
    font-weight: 300;
    color: var(--text-secondary);
    text-decoration: none;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 2rem;
    transition: color 0.2s;
  }

  .blog-home-link:hover {
    color: var(--text);
  }

  .post-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0;
    margin: 0;
  }

  .post-list-item a {
    text-decoration: none;
    color: var(--text);
    display: block;
    padding: 1rem 1.2rem;
    border: 1px solid oklch(1 0 0 / 0.08);
    border-radius: 8px;
    transition: background 0.25s, border-color 0.25s;
  }

  :global([data-theme="dark"]) .post-list-item a:hover {
    background: oklch(1 0 0 / 0.04);
    border-color: oklch(1 0 0 / 0.15);
  }

  .post-list-item a:hover {
    background: oklch(0 0 0 / 0.03);
    border-color: oklch(0 0 0 / 0.12);
  }

  .post-list-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .post-list-subtitle {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-top: 0.2rem;
  }

  .post-list-date {
    font-size: 0.75rem;
    color: var(--text-secondary);
    display: block;
    margin-top: 0.25rem;
  }

  .post-list-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.4rem;
  }

  .post-list-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.75rem;
  }

  .post-tag {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.7rem;
    color: var(--text-secondary);
    background: oklch(0 0 0 / 0.05);
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
  }

  :global([data-theme="dark"]) .post-tag {
    background: oklch(1 0 0 / 0.08);
  }

  @media (max-width: 768px) {
    .blog-layout {
      flex-direction: column;
      padding: 2rem 1.5rem;
    }

    .blog-header {
      padding: 0 0 1.5rem 0;
      align-items: flex-start;
    }

    .blog-title {
      font-size: 2.5rem;
    }

    .blog-divider {
      width: 100%;
      height: 1px;
      align-self: auto;
    }

    .blog-content {
      padding: 1.5rem 0 0 0;
      max-height: none;
    }
  }
</style>
