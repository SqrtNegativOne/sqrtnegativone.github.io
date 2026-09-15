<script lang="ts">
  import { onMount } from 'svelte';
  import Seo from '$shared/components/Seo.svelte';
  import SocialIcons from '$shared/components/SocialIcons.svelte';
  import buttons from '../../data/buttons.json';

  const EMAIL = 'sqrtnegativ1@gmail.com';
  const MAX_LENGTH = 5000;

  let text = $state('');
  let honeypot = $state('');
  let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');
  let errorMessage = $state('');

  // Progressive enhancement: a no-JS submit redirects back with ?sent=1 / ?error=...
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sent') === '1') status = 'sent';
    else if (params.has('error')) {
      status = 'error';
      errorMessage = params.get('error') === 'empty' ? 'Write something first.' : 'Something went wrong. Please try again.';
    }
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (status === 'sending') return;

    const value = text.trim();
    if (value.length === 0) {
      status = 'error';
      errorMessage = 'Write something first.';
      return;
    }

    status = 'sending';
    errorMessage = '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: value, website: honeypot })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        status = 'error';
        errorMessage = data.error ?? 'Something went wrong. Please try again.';
        return;
      }

      text = '';
      status = 'sent';
    } catch {
      status = 'error';
      errorMessage = 'Network error. Please try again.';
    }
  }

  function handleInput() {
    if (status === 'sent' || status === 'error') {
      status = 'idle';
      errorMessage = '';
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Sqrt-1',
    url: 'https://sqrt.fyi/contact'
  };
  const jsonLdHtml = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</` + `script>`;
</script>

<svelte:head>
  {@html jsonLdHtml}
</svelte:head>

<Seo
  title="Contact Sqrt-1"
  description="Ways to contact Sqrt-1."
  path="/contact"
/>

<main class="contact">
  <h1 class="sr-only">Contact</h1>

  <a class="email" href="mailto:{EMAIL}" aria-label="Email {EMAIL}">
    <svg viewBox="2 4 20 16" fill="currentColor" aria-hidden="true">
      <path
        d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
      />
    </svg>
  </a>

  <div class="socials">
    <SocialIcons audience="personal" exclude={['email']} />
  </div>

  <form class="compose" method="POST" action="/api/contact" onsubmit={handleSubmit}>
    <label class="sr-only" for="message">Your message</label>
    <textarea
      id="message"
      name="body"
      rows="8"
      maxlength={MAX_LENGTH}
      placeholder="Type literally anything man. I don't care."
      aria-describedby="compose-status"
      oninput={handleInput}
      bind:value={text}
    ></textarea>

    <!-- Honeypot: hidden from users, catches bots. -->
    <div class="hp">
      <label for="website">Leave this field empty</label>
      <input
        id="website"
        name="website"
        type="text"
        tabindex="-1"
        autocomplete="off"
        bind:value={honeypot}
      />
    </div>

    <div class="compose-footer">
      <p id="compose-status" class="status" class:error={status === 'error'} role="status" aria-live="polite">
        {#if status === 'sending'}
          Sending…
        {:else if status === 'sent'}
          Thanks for that.
        {:else if status === 'error'}
          {errorMessage}
        {/if}
      </p>
      <span class="counter" class:over={text.length >= MAX_LENGTH}>{text.length}/{MAX_LENGTH}</span>
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </button>
    </div>
  </form>

  <ul class="buttons" aria-label="88 by 31 buttons">
    {#each buttons as button (button.id)}
      <li>
        <a
          href={button.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={button.name}
        >
          <img
            src={button.image}
            alt={button.name}
            width="88"
            height="31"
            loading="lazy"
            decoding="async"
          />
        </a>
      </li>
    {/each}
  </ul>

  <div class="johnvertisements">
    <iframe
      src="https://john.citrons.xyz/embed?ref=sqrt.fyi"
      title="Johnvertisements"
      loading="lazy"
    ></iframe>
  </div>
</main>

<style>
  .contact {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    min-height: 70vh;
    width: 100%;
  }

  .email {
    color: var(--text-secondary);
    width: clamp(3.5rem, 12vw, 5.5rem);
    height: clamp(3.5rem, 12vw, 5.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .email:hover {
    color: var(--text);
    transform: translateY(-2px);
  }

  .email :global(svg) {
    width: 100%;
    height: 100%;
  }

  .socials {
    display: flex;
    justify-content: center;
    --social-icon-size: 2rem;
    --social-icon-gap: 1.75rem;
    --social-icon-hover: var(--text);
    color: var(--text-secondary);
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0;
    margin: 1rem 0 0;
    list-style: none;
  }

  .buttons img {
    display: block;
    image-rendering: pixelated;
  }

  .johnvertisements {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .johnvertisements iframe {
    margin-left: auto;
    display: block;
    margin-right: auto;
    max-width: 732px;
    width: 100%;
    height: 94px;
    border: none;
  }

  .compose {
    width: min(100%, 42rem);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .compose textarea {
    width: 100%;
    min-height: 12rem;
    box-sizing: border-box;
    padding: 1rem 1.1rem;
    resize: vertical;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text);
    font-family: "Inter", sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .compose textarea::placeholder {
    color: var(--text-secondary);
  }

  .compose textarea:focus-visible {
    outline: none;
    border-color: var(--text);
    background: oklch(1 0 0 / 0.12);
  }

  .compose-footer {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .status {
    flex: 1;
    margin: 0;
    min-height: 1.2em;
    color: var(--text-secondary);
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
  }

  .status.error {
    color: oklch(0.72 0.16 25);
  }

  .counter {
    color: var(--text-secondary);
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
  }

  .counter.over {
    color: oklch(0.72 0.16 25);
  }

  .compose button {
    padding: 0.6rem 1.6rem;
    background: transparent;
    border: 1px solid var(--text);
    color: var(--text);
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .compose button:hover:not(:disabled),
  .compose button:focus-visible {
    background: var(--text);
    color: var(--bg);
  }

  .compose button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .hp {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .email {
      transition: none;
    }
    .email:hover {
      transform: none;
    }
  }
</style>
