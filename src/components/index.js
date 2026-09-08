// `SiteShell` reads `useSiteConfig()` and `useSection()` from
// `@metanull/viewer-core` itself, whose entry point carries `.vue` files —
// the same reason the composed views (`src/views`) are not part of the
// package root: a website's test runner that loads `@metanull/viewer-layout`
// natively would fail on the first one if `src/index.js` re-exported this.
// A website that names `SiteShell` imports `@metanull/viewer-layout/components`
// and lists `@metanull/viewer-layout` next to `@metanull/viewer-core` in its
// Vitest `server.deps.inline`, exactly as it does for `/views`.
export { default as SiteShell } from './SiteShell.vue'
