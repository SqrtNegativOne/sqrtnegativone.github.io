<script lang="ts">
  import socials from '../data/socials.json';
  import type { SocialAudience, SocialItem } from '../types';

  let {
    audience = 'both',
    exclude = [],
    class: className = ''
  }: { audience?: SocialAudience; exclude?: string[]; class?: string } = $props();

  const VISIBLE_AUDIENCES: Record<SocialAudience, SocialAudience[]> = {
    personal: ['personal', 'both'],
    professional: ['professional', 'both'],
    both: ['personal', 'professional', 'both']
  };

  let items = $derived(
    (socials as SocialItem[]).filter(
      (social) =>
        VISIBLE_AUDIENCES[audience].includes(social.audience) && !exclude.includes(social.id)
    )
  );
</script>

<div class="social-icons {className}">
  {#each items as { id, name, url, icon } (id)}
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      class="social-icon"
      title={name}
    >
      {@html icon}
    </a>
  {/each}
</div>

<style>
  .social-icons {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--social-icon-gap, 1.25rem);
  }

  .social-icon {
    color: inherit;
    width: var(--social-icon-size, 1.5rem);
    height: var(--social-icon-size, 1.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .social-icon:hover {
    color: var(--social-icon-hover, var(--text, white));
    transform: translateY(-2px);
  }

  .social-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .social-icon {
      transition: none;
    }
    .social-icon:hover {
      transform: none;
    }
  }
</style>
