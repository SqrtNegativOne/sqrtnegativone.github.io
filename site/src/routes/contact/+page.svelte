<script lang="ts">
  import { onMount } from 'svelte';
  import Seo from '$shared/components/Seo.svelte';
  import SocialIcons from '$shared/components/SocialIcons.svelte';
  import type { ButtonItem } from '$shared/types';
  import {
    contactMethods,
    defaultContactMethodId,
    getContactMethod,
    type ContactMethodId
  } from '$shared/data/contactMethods';
  import { buttonLabel } from '$lib/utils';
  import buttonsData from '../../data/buttons.json';

  const buttons = buttonsData as ButtonItem[];

  const EMAIL = 'sqrtnegativ1@gmail.com';
  const MAX_LENGTH = 5000;

  let text = $state('');
  let contactMethod = $state<ContactMethodId>(defaultContactMethodId);
  let contactHandle = $state('');
  let honeypot = $state('');
  let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');
  let errorMessage = $state('');

  let activeMethod = $derived(getContactMethod(contactMethod) ?? contactMethods[0]);

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
        body: JSON.stringify({
          body: value,
          contact_method: contactMethod,
          contact_handle: contactHandle.trim(),
          website: honeypot
        })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        status = 'error';
        errorMessage = data.error ?? 'Something went wrong. Please try again.';
        return;
      }

      text = '';
      contactHandle = '';
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

    <div class="reply">
      <div class="method">
        <span class="method-icon" aria-hidden="true">
          <svg viewBox={activeMethod.viewBox} fill="currentColor">{@html activeMethod.icon}</svg>
        </span>
        <label class="sr-only" for="contact-method">How should I reach you back?</label>
        <select
          id="contact-method"
          name="contact_method"
          bind:value={contactMethod}
          onchange={handleInput}
        >
          {#each contactMethods as method (method.id)}
            <option value={method.id}>{method.label}</option>
          {/each}
        </select>
        <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </div>

      <label class="sr-only" for="contact-handle">{activeMethod.label} so I can reply back</label>
      <input
        id="contact-handle"
        name="contact_handle"
        type="text"
        maxlength="200"
        inputmode={activeMethod.inputMode}
        autocomplete={activeMethod.id === 'email' ? 'email' : 'off'}
        placeholder={activeMethod.placeholder}
        aria-describedby="compose-status"
        oninput={handleInput}
        bind:value={contactHandle}
      />

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </button>
    </div>

    <div class="compose-meta">
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
    </div>
  </form>

  <ul class="buttons" aria-label="88 by 31 buttons">
    {#each buttons as button (button.url)}
      {@const label = buttonLabel(button.url)}
      <li>
        <a
          href={button.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          <img
            src={button.image}
            alt={label}
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
  <a class="banner" href="https://deltarune.com/code/">
    <img alt="This site is part of a game glitches and secrets web ring!" class="img-fluid" src="https://deltarune.com/assets/images/secrets-webring.gif">
  </a>
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

  .reply {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 0.5rem;
  }

  .method {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0 0.35rem 0 0.7rem;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  .method:focus-within,
  .method:hover {
    border-color: var(--text);
    color: var(--text);
  }

  .method-icon {
    display: flex;
    width: 1.05rem;
    height: 1.05rem;
    flex: none;
  }

  .method-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .method select {
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border: 0;
    color: inherit;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
    padding: 0.6rem 1.05rem 0.6rem 0;
    cursor: pointer;
  }

  .method select:focus-visible {
    outline: none;
  }

  .method select option {
    background: var(--bg);
    color: var(--text);
  }

  .chevron {
    position: absolute;
    right: 0.35rem;
    width: 0.7rem;
    height: 0.7rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    pointer-events: none;
  }

  .reply input {
    flex: 1 1 12rem;
    min-width: 0;
    padding: 0.6rem 0.9rem;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text);
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .reply input::placeholder {
    color: var(--text-secondary);
  }

  .reply input:focus-visible {
    outline: none;
    border-color: var(--text);
    background: oklch(1 0 0 / 0.12);
  }

  .compose-meta {
    display: flex;
    align-items: baseline;
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

  @media (max-width: 30rem) {
    .method {
      flex: 1 1 auto;
    }

    .compose button {
      flex: 1 1 100%;
    }
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
