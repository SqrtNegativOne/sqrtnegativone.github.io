<script lang="ts">
  import Seo from '$shared/components/Seo.svelte';
  import SocialIcons from '$shared/components/SocialIcons.svelte';
  import buttons from '../../data/buttons.json';

  const EMAIL = 'sqrtnegativ1@gmail.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Ark Malhotra',
    url: 'https://sqrt.fyi/contact'
  };
  const jsonLdHtml = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</` + `script>`;
</script>

<svelte:head>
  {@html jsonLdHtml}
</svelte:head>

<Seo
  title="Contact — Ark Malhotra"
  description="Ways to reach Ark Malhotra."
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

  @media (prefers-reduced-motion: reduce) {
    .email {
      transition: none;
    }
    .email:hover {
      transform: none;
    }
  }
</style>
