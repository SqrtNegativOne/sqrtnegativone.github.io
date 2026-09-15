<script>
  import SocialIcons from '$shared/components/SocialIcons.svelte';
</script>

<div class="social-icons-wrap">
  <SocialIcons audience="professional" />
</div>

<style>
  .social-icons-wrap {
    position: fixed;
    bottom: 6rem;
    right: 4rem;
    z-index: 10;
    --social-icon-size: 1.5rem;
    --social-icon-gap: 1.25rem;
    --social-icon-hover: var(--text, white);
    color: var(--text-secondary, oklch(1 0 0 / 0.7));
  }

  @media (max-width: 640px) {
    .social-icons-wrap {
      bottom: 2rem;
      right: 2rem;
      --social-icon-size: 1.25rem;
      --social-icon-gap: 1rem;
    }
  }
</style>
