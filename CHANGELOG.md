# Changelog

## 2.0.0

Breaking. A website adopting this must be on `@metanull/viewer-core` 1.2.0 or
later — 1.1.0 does not declare the `/i18n` entry point this reads its texts
through — and must supply the five `layout.*` entries, which it does by
receiving the `layout` namespace of `@metanull/viewer-i18n`.

- `vue-i18n` is gone. The layout reads its texts through
  `@metanull/viewer-core/i18n`, now a peer dependency.
- **Removed: the `layoutMessages` export and the bundled English defaults.**
  The layout no longer carries texts. Its five entries are published in the
  `layout` namespace of `@metanull/viewer-i18n`, so they are translated in the
  same place, by the same people, as every other text on the platform —
  instead of being an export each website had to remember to merge.
- The entries are renamed to the platform's three-part grammar:
  `layout.skipToContent` → `layout.nav.skipToContent`, `layout.navigationLabel`
  → `layout.nav.label`, `layout.languageLabel` → `layout.language.label`,
  `layout.hyperlinksLabel` → `layout.hyperlinks.label`, `layout.sponsorsLabel`
  → `layout.sponsors.label`.

## 0.1.0 — 2026-08-24

- Initial release: `PageShell` composing seven optional, token-styled sections
  (`AppHeader`, `AppBanner`, `AppNavigation`, `AppContent`, `AppHyperlinks`,
  `AppSponsors`, `AppFooter`), `--mwnf-*` token styling with
  `tokens.reference.css`, vue-i18n `layout.*` chrome strings with bundled
  English defaults (`layoutMessages`).
