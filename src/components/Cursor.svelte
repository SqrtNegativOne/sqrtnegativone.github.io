<script>
  import { onMount, onDestroy } from "svelte";
  import gsap from "gsap";
  import MouseFollower from "mouse-follower";
  import "mouse-follower/dist/mouse-follower.min.css";

  let cursor;

  onMount(() => {
    MouseFollower.registerGSAP(gsap);
    
    cursor = new MouseFollower({
      className: 'mf-cursor -exclusion', // Add -exclusion by default
      stateDetection: {
        '-external': 'a[target="_blank"], a[href^="http"]',
        '-pointer': 'a:not([target="_blank"]):not([href^="http"]), button, [role="button"], .nav-link, .blog-item, .skill-item, .cursor-pointer',
        '-hidden': '.use-native-cursor, .use-native-cursor *'
      }
    });
  });

  onDestroy(() => {
    if (cursor) {
      cursor.destroy();
    }
  });
</script>

<style>
  /* Base state is already set to exclusion by the library when class -exclusion is present */
  :global(.mf-cursor) {
    z-index: 99999 !important;
  }

  /* Bulletproof CSS override: If a modal or menu is open ANYWHERE on the page, 
     disable the expensive blend mode on the cursor to prevent stutter. */
  :global(body:has(.ml-modal-backdrop, .menu-overlay, .menu-scrim) .mf-cursor) {
    mix-blend-mode: normal !important;
  }
  :global(body:has(.ml-modal-backdrop, .menu-overlay, .menu-scrim) .mf-cursor:before) {
    background: #fff !important;
  }

  /* Override the default -pointer state to EXPAND instead of shrink */
  :global(.mf-cursor.-pointer:before) {
    transform: scale(0.8) !important;
    background: transparent !important;
    border: 1px solid #fff;
  }

  /* Style for external links (adds a top-right arrow inside) */
  :global(.mf-cursor.-external:before) {
    transform: scale(0.8) !important;
    background: #fff !important;
  }
  
  :global(.mf-cursor.-external:after) {
    content: "↗";
    position: absolute;
    top: -24px; left: -24px;
    width: 48px; height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 700;
    font-size: 16px;
    font-family: sans-serif;
    z-index: 10;
  }
</style>
