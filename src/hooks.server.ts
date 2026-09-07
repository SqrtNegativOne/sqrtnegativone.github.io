import type { Handle } from '@sveltejs/kit';

const NO_SCROLL_ROUTES = ['/', '/about', '/skills', '/projects'];

export const handle: Handle = async ({ event, resolve }) => {
  const currentPath = event.url.pathname.replace(/\/$/, '') || '/';
  const isNoScroll = NO_SCROLL_ROUTES.includes(currentPath);

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      if (isNoScroll) {
        return html.replace(
          '<body data-sveltekit-preload-data="hover">',
          '<body data-sveltekit-preload-data="hover" class="no-scroll">'
        );
      }
      return html;
    }
  });
};
