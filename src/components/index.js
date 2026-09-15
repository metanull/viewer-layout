// `SiteShell` reads `useSiteConfig()` and `useSection()` from
// `@museumwnf/viewer-core` itself, whose entry point carries `.vue` files —
// the same reason the composed views (`src/views`) are not part of the
// package root: a website's test runner that loads `@museumwnf/viewer-layout`
// natively would fail on the first one if `src/index.js` re-exported this.
// A website that names `SiteShell` imports `@museumwnf/viewer-layout/components`
// and lists `@museumwnf/viewer-layout` next to `@museumwnf/viewer-core` in its
// Vitest `server.deps.inline`, exactly as it does for `/views`.
export { default as SiteShell } from './SiteShell.vue'
