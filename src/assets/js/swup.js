import SwupFadeTheme from '@swup/fade-theme';
const swup = new Swup({
  plugins: [new SwupFadeTheme()]
});
swup.hooks.on('visit:start', () => {
  console.log(window.location.href);
})