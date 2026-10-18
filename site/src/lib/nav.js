/**
 * The site's primary navigation. Kept in one place so the global sidebar
 * and the standalone /main page always agree on the same links.
 */
export const NAV_ITEMS = [
  { key: "blog",          label: "Blog",          path: "/blog",          importance: 3 },
  { key: "now",           label: "Now",           path: "/now",           importance: 2 },
  { key: "microblog",     label: "Microblog",     path: "/microblog",     importance: 1 },
  { key: "media-library", label: "Media Library", path: "/media-library", importance: 1 },
  { key: "questions",     label: "Questions",     path: "/questions",     importance: 1 },
  { key: "bookmarks",     label: "Bookmarks",     path: "/bookmarks",     importance: 1 },
  { key: "contact",       label: "Contact",       path: "/contact",       importance: 2 },
  { key: "colophon",      label: "Colophon",      path: "/colophon",      importance: 1 },
  { key: "cv",            label: "CV",            path: "https://cv.sqrt.fyi/", importance: 3, external: true }
];
