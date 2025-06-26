import Swup from 'swup';
import SwupFadeTheme from '@swup/fade-theme';
import SwupHeadPlugin from '@swup/head-plugin';

const swup = new Swup({
  plugins: [
    new SwupFadeTheme(),
    new SwupHeadPlugin()
  ],
});

swup.hooks.on('visit:start', () => {
  console.log('Navigating to:', window.location.href);
});