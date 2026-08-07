<script>
  import socials from '../data/socials.json';
</script>

<div class="social-icons">
  {#each socials as { name, url, icon }}
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name} class="icon-link">
      {@html icon}
    </a>
  {/each}
</div>

<style>
  .social-icons {
    position: fixed;
    bottom: 6rem;
    right: 4rem;
    display: flex;
    gap: 1.25rem;
    z-index: 10;
  }
  
  .icon-link {
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    width: 1.5rem;
    height: 1.5rem;
    transition: color 0.2s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-link:hover {
    color: var(--text, white);
    transform: translateY(-2px);
  }

  .icon-link :global(svg) {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 640px) {
    .social-icons {
      bottom: 2rem;
      right: 2rem;
      gap: 1rem;
    }
    .icon-link {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
</style>
