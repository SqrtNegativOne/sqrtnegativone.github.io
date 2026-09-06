<script>
  import Seo from '$lib/components/Seo.svelte';
  import { formatReadableDate, formatIsoDate } from '$lib/blog';

  let { data } = $props();
  let post = $derived(data.post);
  let isAfterdark = $derived(post.tags?.includes('afterdark'));

  let fontStyle = $derived.by(() => {
    if (post.font === 'Times New Roman') {
      return "font-family: 'Times New Roman', serif; font-size: 1.15rem; line-height: 1.6;";
    }
    if (post.font === 'IBM Plex Sans') {
      return "font-family: 'IBM Plex Sans', sans-serif;";
    }
    return '';
  });

  let jsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || '',
    datePublished: formatIsoDate(post.date),
    url: `https://sqrt.fyi/blog/${post.slug}/`,
    mainEntityOfPage: `https://sqrt.fyi/blog/${post.slug}/`,
    author: { '@type': 'Person', 'name': 'Ark Malhotra', url: 'https://sqrt.fyi/' }
  });

  let jsonLdHtml = $derived(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</` + `script>`);
</script>

<svelte:head>
  {@html jsonLdHtml}
</svelte:head>

<Seo
  title="{post.title} — Ark Malhotra"
  description={post.description || post.title}
  path="/blog/{post.slug}/"
  noindex={isAfterdark}
/>

<div class="blog-layout is-post">
  <div class="blog-content">
    {#if isAfterdark}
      <a href="/blog-afterdark/" class="post-back">&larr; All afterdark posts</a>
    {:else}
      <a href="/blog/" class="post-back">&larr; All posts</a>
    {/if}

    <article>
      <header class="post-header">
        <h1 class="post-title">{post.title}</h1>
        {#if post.description}
          <p class="post-subtitle">{post.description}</p>
        {/if}
        <time class="post-date">{formatReadableDate(post.date)}</time>
        {#if post.tags}
          <div class="post-tags">
            {#each post.tags as tag (tag)}
              {#if tag !== 'post' && tag !== 'afterdark'}
                <span class="post-tag">#{tag}</span>
              {/if}
            {/each}
          </div>
        {/if}
      </header>
      <div class="post-body" style={fontStyle}>
        {@html post.content}
      </div>
    </article>
  </div>
</div>

<style>
  .blog-layout {
    display: flex;
    min-height: 100vh;
    padding: 3rem 2rem;
    box-sizing: border-box;
    width: 100%;
    justify-content: center;
  }

  .blog-content {
    max-width: 640px;
    width: 100%;
    padding: 0;
  }

  .post-header {
    margin-bottom: 2rem;
  }

  .post-title {
    font-family: "Instrument Serif", serif;
    font-weight: 400;
    font-size: 3rem;
    line-height: 1.2;
    margin: 0;
  }

  .post-subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  .post-date {
    font-size: 0.75rem;
    color: var(--text-secondary);
    display: block;
    margin-top: 0.5rem;
  }

  .post-tags {
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

  .post-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
  }

  :global(.post-body p),
  :global(.post-body li) {
    font-size: 1.5rem;
    line-height: 1.7;
  }

  :global(.post-body ul),
  :global(.post-body ol) {
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin: 0.5rem 0;
  }

  :global(.post-body img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
  }

  :global(.post-body a) {
    color: var(--text);
    text-decoration: underline;
    text-decoration-color: var(--text-secondary);
    text-underline-offset: 3px;
    transition: text-decoration-color 0.2s;
  }

  :global(.post-body a:hover) {
    text-decoration-color: var(--text);
  }

  :global(.post-body del) {
    opacity: 0.5;
  }

  :global(.post-body blockquote) {
    border-left: 2px solid var(--text-secondary);
    padding-left: 1.2rem;
    margin: 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  :global(.post-body blockquote p) {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 1.05rem;
  }

  :global(.post-body strong) {
    font-weight: 700;
  }

  .post-back {
    display: inline-block;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-decoration: none;
    margin-bottom: 1.5rem;
    transition: color 0.2s;
  }

  .post-back:hover {
    color: var(--text);
  }

  :global(.post-body .footnotes) {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid oklch(0.5999 0 0 / 0.2);
    font-size: 0.78rem;
    color: var(--text-secondary);
  }

  :global(.post-body .footnotes ol) {
    padding-left: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  :global(.post-body .footnotes li) {
    line-height: 1.6;
    font-size: 0.85rem;
  }

  :global(.post-body .footnotes li p) {
    font-size: 0.85rem;
  }

  :global(.post-body .footnote-ref),
  :global(.post-body sup) {
    line-height: 0;
  }

  :global(.post-body sup a),
  :global(.post-body .footnote-ref a) {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-decoration: none;
    vertical-align: super;
    line-height: 0;
    font-weight: 300;
    transition: color 0.2s;
  }

  :global(.post-body sup a:hover),
  :global(.post-body .footnote-ref a:hover) {
    color: var(--text);
  }

  :global(.post-body .data-footnote-backref),
  :global(.post-body .footnote-backref) {
    font-size: 0.7rem;
    text-decoration: none;
    color: var(--text-secondary);
    margin-left: 0.3em;
    transition: color 0.2s;
  }

  :global(.post-body .data-footnote-backref:hover),
  :global(.post-body .footnote-backref:hover) {
    color: var(--text);
  }
</style>
