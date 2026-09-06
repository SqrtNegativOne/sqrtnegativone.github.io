<script lang="ts">
  import { onMount } from 'svelte';
  import Seo from '$lib/components/Seo.svelte';

  interface BskyAuthor {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  }

  interface BskyImage {
    thumb: string;
    fullsize: string;
    alt?: string;
    aspectRatio?: { width: number; height: number };
  }

  interface BskyExternal {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  }

  interface BskyEmbed {
    $type: string;
    images?: BskyImage[];
    external?: BskyExternal;
    record?: {
      $type?: string;
      uri?: string;
      author?: BskyAuthor;
      value?: {
        text?: string;
        createdAt?: string;
      };
      text?: string;
    };
  }

  interface BskyPostRecord {
    $type: string;
    text: string;
    createdAt: string;
  }

  interface BskyPost {
    uri: string;
    cid: string;
    author: BskyAuthor;
    record: BskyPostRecord;
    embed?: BskyEmbed;
    replyCount?: number;
    repostCount?: number;
    likeCount?: number;
    quoteCount?: number;
    indexedAt: string;
  }

  interface BskyFeedItem {
    post: BskyPost;
    reply?: {
      root: BskyPost;
      parent: BskyPost;
    };
    reason?: {
      $type: string;
      by?: BskyAuthor;
      indexedAt?: string;
    };
  }

  const BSKY_HANDLE = 'sqrt-1.bsky.social';
  const BSKY_API_URL = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed';

  let feedItems = $state<BskyFeedItem[]>([]);
  let cursor = $state<string | undefined>(undefined);
  let hasMore = $state(true);
  let isLoading = $state(true);
  let isLoadingMore = $state(false);
  let isFetchingAll = $state(false);
  let errorMessage = $state<string | null>(null);
  let activeFilter = $state<'all' | 'originals' | 'media'>('all');
  let selectedImage = $state<{ src: string; alt: string } | null>(null);

  async function fetchFeed(nextCursor?: string): Promise<{ items: BskyFeedItem[]; nextCursor?: string }> {
    const params = new URLSearchParams({
      actor: BSKY_HANDLE,
      limit: '50'
    });
    if (nextCursor) {
      params.append('cursor', nextCursor);
    }

    const res = await fetch(`${BSKY_API_URL}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to load posts (Status: ${res.status})`);
    }

    const data = await res.json();
    return {
      items: data.feed || [],
      nextCursor: data.cursor
    };
  }

  async function loadInitial() {
    isLoading = true;
    errorMessage = null;
    try {
      const data = await fetchFeed();
      feedItems = data.items;
      cursor = data.nextCursor;
      hasMore = !!data.nextCursor;
    } catch (err: unknown) {
      console.error(err);
      errorMessage = err instanceof Error ? err.message : 'Could not load posts from Bluesky.';
    } finally {
      isLoading = false;
    }
  }

  async function loadMore() {
    if (isLoadingMore || !cursor) return;
    isLoadingMore = true;
    try {
      const data = await fetchFeed(cursor);
      feedItems = [...feedItems, ...data.items];
      cursor = data.nextCursor;
      hasMore = !!data.nextCursor;
    } catch (err: unknown) {
      console.error(err);
      errorMessage = err instanceof Error ? err.message : 'Could not fetch more posts.';
    } finally {
      isLoadingMore = false;
    }
  }

  async function loadAllPosts() {
    if (isFetchingAll || !hasMore) return;
    isFetchingAll = true;
    while (cursor && hasMore) {
      try {
        const data = await fetchFeed(cursor);
        feedItems = [...feedItems, ...data.items];
        cursor = data.nextCursor;
        hasMore = !!data.nextCursor;
      } catch (err) {
        console.error('Error fetching remaining posts:', err);
        break;
      }
    }
    isFetchingAll = false;
  }

  let filteredFeed = $derived(
    feedItems.filter((item) => {
      const isRepost = !!item.reason;
      const isReply = !!item.reply;
      const hasImages = !!item.post.embed?.images && item.post.embed.images.length > 0;

      if (activeFilter === 'originals') {
        return !isRepost && !isReply;
      }
      if (activeFilter === 'media') {
        return hasImages;
      }
      return true;
    })
  );

  function getPostWebUrl(uri: string, authorHandle: string): string {
    const rkey = uri.split('/').pop() || '';
    return `https://bsky.app/profile/${authorHandle}/post/${rkey}`;
  }

  function formatRelativeDate(isoStr: string): string {
    try {
      const postDate = new Date(isoStr);
      const now = new Date();
      const diffMs = now.getTime() - postDate.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return isoStr;
    }
  }

  function formatPostText(text: string): string {
    if (!text) return '';
    // Escape HTML first
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Linkify URLs
    escaped = escaped.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="post-link">$1</a>'
    );

    // Linkify @handles
    escaped = escaped.replace(
      /@([a-zA-Z0-9.-]+)/g,
      '<a href="https://bsky.app/profile/$1" target="_blank" rel="noopener noreferrer" class="post-mention">@$1</a>'
    );

    // Linkify #hashtags
    escaped = escaped.replace(
      /#([a-zA-Z0-9_]+)/g,
      '<a href="https://bsky.app/hashtag/$1" target="_blank" rel="noopener noreferrer" class="post-tag">#$1</a>'
    );

    return escaped;
  }

  onMount(() => {
    loadInitial();
  });
</script>

<Seo
  title="Microblog — Ark Malhotra"
  description="Short thoughts, links, and status updates fetched live from @sqrt-1.bsky.social on Bluesky."
  path="/microblog"
/>

<div class="microblog-container">
  <!-- Microblog Header Banner -->
  <header class="microblog-header">
    <div class="header-left">
      <div class="header-title-row">
        <h1 class="microblog-title">microblog</h1>
        <span class="live-pill" title="Live AT Protocol feed">
          <span class="live-dot"></span>
          LIVE FEED
        </span>
      </div>
      <p class="microblog-desc">
        Short-form thoughts, notes, and links fetched directly from
        <a
          href="https://bsky.app/profile/{BSKY_HANDLE}"
          target="_blank"
          rel="noopener noreferrer"
          class="bsky-profile-link"
        >
          @{BSKY_HANDLE}
          <svg class="w-3.5 h-3.5 inline ml-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </p>
    </div>

    <!-- Filter Buttons -->
    <div class="filter-bar" role="tablist" aria-label="Post filter options">
      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'all'}
        class="filter-btn {activeFilter === 'all' ? 'is-active' : ''}"
        onclick={() => activeFilter = 'all'}
      >
        All ({feedItems.length})
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'originals'}
        class="filter-btn {activeFilter === 'originals' ? 'is-active' : ''}"
        onclick={() => activeFilter = 'originals'}
      >
        Originals
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'media'}
        class="filter-btn {activeFilter === 'media' ? 'is-active' : ''}"
        onclick={() => activeFilter = 'media'}
      >
        With Media
      </button>
    </div>
  </header>

  <!-- Feed Content -->
  {#if isLoading}
    <div class="state-box" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p class="loading-text">Fetching posts from AT Protocol...</p>
    </div>
  {:else if errorMessage && feedItems.length === 0}
    <div class="state-box error-box" role="alert">
      <p class="error-msg">{errorMessage}</p>
      <div class="error-actions">
        <button type="button" class="retry-btn" onclick={loadInitial}>
          Retry Fetching
        </button>
        <a
          href="https://bsky.app/profile/{BSKY_HANDLE}"
          target="_blank"
          rel="noopener noreferrer"
          class="direct-bsky-btn"
        >
          View on Bluesky &rarr;
        </a>
      </div>
    </div>
  {:else if filteredFeed.length === 0}
    <div class="state-box">
      <p class="empty-msg">No posts match this filter.</p>
    </div>
  {:else}
    <div class="feed-stream">
      {#each filteredFeed as item (item.post.uri)}
        {@const isRepost = !!item.reason}
        {@const post = item.post}
        {@const postUrl = getPostWebUrl(post.uri, post.author.handle)}

        <article class="post-card" class:is-repost={isRepost}>
          <!-- Repost Header if applicable -->
          {#if isRepost}
            <div class="repost-banner">
              <svg class="w-3.5 h-3.5 mr-1.5 opacity-75" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.5 3.75a3 3 0 00-3 3v.75h1.5v-.75a1.5 1.5 0 011.5-1.5h11.44l-2.72 2.72 1.06 1.06 4.5-4.5-4.5-4.5-1.06 1.06 2.72 2.72H4.5zm15 16.5a3 3 0 003-3v-.75h-1.5v.75a1.5 1.5 0 01-1.5 1.5H8.06l2.72-2.72-1.06-1.06-4.5 4.5 4.5 4.5 1.06-1.06-2.72-2.72h11.44z" />
              </svg>
              <span>Reposted by @{BSKY_HANDLE}</span>
            </div>
          {/if}

          <!-- Reply badge if replying to another account -->
          {#if item.reply && !isRepost}
            <div class="reply-banner">
              <svg class="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v3M3 10l6-6M3 10l6 6" />
              </svg>
              <span>Replying to @{item.reply.parent?.author?.handle || 'user'}</span>
            </div>
          {/if}

          <!-- Post Header -->
          <div class="post-header">
            <div class="author-area">
              {#if post.author.avatar}
                <img
                  src={post.author.avatar}
                  alt="{post.author.displayName || post.author.handle} avatar"
                  class="author-avatar"
                  loading="lazy"
                />
              {:else}
                <div class="avatar-placeholder" aria-hidden="true">
                  {(post.author.displayName || post.author.handle).charAt(0).toUpperCase()}
                </div>
              {/if}

              <div class="author-info">
                <div class="author-name-row">
                  <span class="author-name">{post.author.displayName || post.author.handle}</span>
                  <a
                    href="https://bsky.app/profile/{post.author.handle}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="author-handle"
                  >
                    @{post.author.handle}
                  </a>
                </div>
                <time datetime={post.record.createdAt} class="post-time" title={new Date(post.record.createdAt).toLocaleString()}>
                  {formatRelativeDate(post.record.createdAt)}
                </time>
              </div>
            </div>

            <!-- External link to open original post on Bluesky -->
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="bsky-icon-btn"
              title="Open on Bluesky"
              aria-label="View on Bluesky"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
              </svg>
            </a>
          </div>

          <!-- Post Body Text -->
          {#if post.record.text}
            <div class="post-content">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html formatPostText(post.record.text)}
            </div>
          {/if}

          <!-- Embedded Images Gallery -->
          {#if post.embed?.images && post.embed.images.length > 0}
            <div
              class="images-grid"
              class:grid-single={post.embed.images.length === 1}
              class:grid-double={post.embed.images.length === 2}
              class:grid-multi={post.embed.images.length > 2}
            >
              {#each post.embed.images as img}
                <button
                  type="button"
                  class="image-trigger"
                  onclick={() => selectedImage = { src: img.fullsize, alt: img.alt || 'Post image' }}
                  aria-label="Enlarge image"
                >
                  <img
                    src={img.thumb}
                    alt={img.alt || 'Bluesky post attachment'}
                    loading="lazy"
                    class="post-image"
                  />
                </button>
              {/each}
            </div>
          {/if}

          <!-- Embedded External Link Card -->
          {#if post.embed?.external}
            <a
              href={post.embed.external.uri}
              target="_blank"
              rel="noopener noreferrer"
              class="external-card"
            >
              {#if post.embed.external.thumb}
                <img
                  src={post.embed.external.thumb}
                  alt=""
                  class="external-thumb"
                  loading="lazy"
                />
              {/if}
              <div class="external-text">
                <span class="external-title">{post.embed.external.title}</span>
                {#if post.embed.external.description}
                  <p class="external-desc">{post.embed.external.description}</p>
                {/if}
                <span class="external-domain">{new URL(post.embed.external.uri).hostname}</span>
              </div>
            </a>
          {/if}

          <!-- Post Metrics & Permalink Footer -->
          <footer class="post-footer">
            <div class="post-metrics">
              <span class="metric-item" title="Replies">
                <svg class="w-3.5 h-3.5 mr-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {post.replyCount || 0}
              </span>

              <span class="metric-item" title="Reposts">
                <svg class="w-3.5 h-3.5 mr-1 opacity-60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.5 3.75a3 3 0 00-3 3v.75h1.5v-.75a1.5 1.5 0 011.5-1.5h11.44l-2.72 2.72 1.06 1.06 4.5-4.5-4.5-4.5-1.06 1.06 2.72 2.72H4.5zm15 16.5a3 3 0 003-3v-.75h-1.5v.75a1.5 1.5 0 01-1.5 1.5H8.06l2.72-2.72-1.06-1.06-4.5 4.5 4.5 4.5 1.06-1.06-2.72-2.72h11.44z" />
                </svg>
                {post.repostCount || 0}
              </span>

              <span class="metric-item" title="Likes">
                <svg class="w-3.5 h-3.5 mr-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {post.likeCount || 0}
              </span>
            </div>

            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="post-permalink"
            >
              bsky.app &rarr;
            </a>
          </footer>
        </article>
      {/each}
    </div>

    <!-- Bottom Pagination / Fetch Controls -->
    <div class="pagination-footer">
      {#if hasMore}
        <button
          type="button"
          onclick={loadMore}
          disabled={isLoadingMore || isFetchingAll}
          class="btn-load-more"
        >
          {#if isLoadingMore}
            <span class="spinner-small" aria-hidden="true"></span>
            Loading more...
          {:else}
            Load More Posts
          {/if}
        </button>

        <button
          type="button"
          onclick={loadAllPosts}
          disabled={isFetchingAll || isLoadingMore}
          class="btn-fetch-all"
        >
          {#if isFetchingAll}
            <span class="spinner-small" aria-hidden="true"></span>
            Fetching All Posts ({feedItems.length} loaded)...
          {:else}
            Fetch All {hasMore ? '(260+)' : ''}
          {/if}
        </button>
      {:else}
        <span class="end-pill">You've reached the end of the microblog ({feedItems.length} posts).</span>
      {/if}
    </div>
  {/if}
</div>

<!-- Lightbox Modal for Images -->
{#if selectedImage}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="lightbox-overlay" onclick={() => selectedImage = null}>
    <div class="lightbox-dialog">
      <img src={selectedImage.src} alt={selectedImage.alt} class="lightbox-img" />
      <button
        type="button"
        class="lightbox-close"
        onclick={() => selectedImage = null}
        aria-label="Close image"
      >
        &times;
      </button>
    </div>
  </div>
{/if}

<style>
  .microblog-container {
    max-width: 48rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 3.5rem;
    width: 100%;
  }

  /* Header */
  .microblog-header {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    padding-bottom: 1.5rem;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .microblog-title {
    font-weight: 500;
    font-size: 3.25rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--text);
    margin: 0;
  }

  .live-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    color: oklch(0.85 0.18 150);
    background: oklch(0.85 0.18 150 / 0.08);
    border: 1px solid oklch(0.85 0.18 150 / 0.25);
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background-color: currentColor;
    box-shadow: 0 0 8px currentColor;
    animation: livePulse 2s infinite ease-in-out;
  }

  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.8); }
  }

  .microblog-desc {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .bsky-profile-link {
    color: var(--text);
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.9em;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .bsky-profile-link:hover {
    color: oklch(0.8 0.15 220);
  }

  /* Filters */
  .filter-bar {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    background: oklch(1 0 0 / 0.04);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn:hover {
    color: var(--text);
    border-color: var(--text-secondary);
  }

  .filter-btn.is-active {
    background: oklch(1 0 0 / 0.12);
    color: var(--text);
    border-color: oklch(1 0 0 / 0.28);
    font-weight: 500;
  }

  /* Stream & Post Cards */
  .feed-stream {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .post-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: oklch(0.12 0 0 / 0.6);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.09));
    border-radius: 12px;
    backdrop-filter: blur(8px);
    transition: border-color 0.25s ease, transform 0.25s ease;
  }

  .post-card:hover {
    border-color: oklch(1 0 0 / 0.22);
    transform: translateY(-1px);
  }

  .repost-banner,
  .reply-banner {
    display: inline-flex;
    align-items: center;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: -0.25rem;
  }

  .repost-banner {
    color: oklch(0.8 0.12 160);
  }

  .post-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .author-area {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    object-fit: cover;
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.15));
  }

  .avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    background: oklch(1 0 0 / 0.1);
    display: grid;
    place-items: center;
    font-family: "IBM Plex Mono", monospace;
    font-weight: 600;
    color: var(--text);
  }

  .author-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .author-name-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .author-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
  }

  .author-handle {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.76rem;
    color: var(--text-secondary);
    text-decoration: none;
  }

  .author-handle:hover {
    color: var(--text);
    text-decoration: underline;
  }

  .post-time {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    color: var(--text-secondary);
    opacity: 0.75;
  }

  .bsky-icon-btn {
    color: var(--text-secondary);
    padding: 0.35rem;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .bsky-icon-btn:hover {
    color: oklch(0.8 0.15 220);
    background: oklch(1 0 0 / 0.05);
  }

  /* Post content */
  .post-content {
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .post-content :global(.post-link) {
    color: oklch(0.75 0.18 240);
    text-decoration: underline;
    text-underline-offset: 3px;
    word-break: break-all;
  }

  .post-content :global(.post-mention),
  .post-content :global(.post-tag) {
    color: oklch(0.8 0.14 200);
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.95em;
    text-decoration: none;
  }

  .post-content :global(.post-mention:hover),
  .post-content :global(.post-tag:hover) {
    text-decoration: underline;
  }

  /* Images grid */
  .images-grid {
    display: grid;
    gap: 0.5rem;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 0.25rem;
  }

  .grid-single {
    grid-template-columns: 1fr;
  }

  .grid-double {
    grid-template-columns: 1fr 1fr;
  }

  .grid-multi {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .image-trigger {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: block;
    width: 100%;
    overflow: hidden;
    border-radius: 8px;
  }

  .post-image {
    width: 100%;
    max-height: 380px;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.3s ease;
  }

  .image-trigger:hover .post-image {
    transform: scale(1.02);
  }

  /* External card */
  .external-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.1));
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    background: oklch(1 0 0 / 0.02);
    transition: all 0.2s ease;
  }

  .external-card:hover {
    background: oklch(1 0 0 / 0.05);
    border-color: var(--text-secondary);
  }

  .external-thumb {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .external-text {
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .external-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
  }

  .external-desc {
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .external-domain {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    color: var(--text-secondary);
    opacity: 0.7;
  }

  /* Footer */
  .post-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--glass-border, oklch(1 0 0 / 0.06));
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .post-metrics {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .metric-item {
    display: inline-flex;
    align-items: center;
  }

  .post-permalink {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s;
  }

  .post-permalink:hover {
    color: var(--text);
    text-decoration: underline;
  }

  /* Loading and Error States */
  .state-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 5rem 1rem;
    color: var(--text-secondary);
    text-align: center;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 2px solid oklch(1 0 0 / 0.1);
    border-top-color: oklch(0.8 0.15 220);
    border-radius: 9999px;
    animation: spin 0.8s linear infinite;
  }

  .spinner-small {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid oklch(1 0 0 / 0.2);
    border-top-color: currentColor;
    border-radius: 9999px;
    animation: spin 0.8s linear infinite;
    margin-right: 0.4rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
  }

  .error-box {
    background: oklch(0.2 0.05 25);
    border: 1px solid oklch(0.5 0.15 25 / 0.4);
    border-radius: 12px;
  }

  .error-msg {
    color: oklch(0.85 0.12 30);
    font-size: 0.95rem;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .retry-btn {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
    background: oklch(1 0 0 / 0.1);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.2));
    border-radius: 6px;
    color: var(--text);
    cursor: pointer;
  }

  .direct-bsky-btn {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.15));
    border-radius: 6px;
    color: var(--text-secondary);
    text-decoration: none;
  }

  .direct-bsky-btn:hover {
    color: var(--text);
    border-color: var(--text-secondary);
  }

  /* Pagination Footer */
  .pagination-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 2rem 0;
    flex-wrap: wrap;
  }

  .btn-load-more {
    display: inline-flex;
    align-items: center;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.82rem;
    letter-spacing: 0.05em;
    padding: 0.65rem 1.5rem;
    background: oklch(1 0 0 / 0.08);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.15));
    border-radius: 8px;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-load-more:hover:not(:disabled) {
    background: oklch(1 0 0 / 0.15);
    border-color: var(--text-secondary);
  }

  .btn-fetch-all {
    display: inline-flex;
    align-items: center;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.78rem;
    padding: 0.65rem 1.25rem;
    background: transparent;
    border: 1px dashed var(--glass-border, oklch(1 0 0 / 0.15));
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-fetch-all:hover:not(:disabled) {
    color: var(--text);
    border-color: var(--text-secondary);
  }

  .end-pill {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: oklch(1 0 0 / 0.04);
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
  }

  /* Lightbox */
  .lightbox-overlay {
    position: fixed;
    inset: 0;
    background: oklch(0 0 0 / 0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .lightbox-dialog {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
  }

  .lightbox-img {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 25px 50px -12px oklch(0 0 0 / 0.8);
  }

  .lightbox-close {
    position: absolute;
    top: -2.5rem;
    right: 0;
    font-size: 2rem;
    line-height: 1;
    color: white;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.8;
  }

  .lightbox-close:hover {
    opacity: 1;
  }

  @media (max-width: 640px) {
    .microblog-title {
      font-size: 2.25rem;
    }
    .post-card {
      padding: 1.25rem;
    }
  }
</style>
