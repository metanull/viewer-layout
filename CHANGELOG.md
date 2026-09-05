# Changelog

## 2.1.0

The alignment pass (metanull/inventory-app#1683): `PageShell` covers the
needs of all seven websites from props, so no website rebuilds a section in
a slot. Additive — every prop and slot of 2.0.0 still works. Requires
`@metanull/viewer-core` 1.6.0, whose `/i18n` entry point exports the
Markdown renderers the banner headline goes through, and the `layout.nav.menu`
entry of `@metanull/viewer-i18n` 1.6.0.

- `AppHeader` (#18): `home` and a `brand` slot or text for the mark;
  `eyebrow` above the title and `titleHref`; `logos` with `logosTitle`;
  `links`; `search` rendering a search form that emits `search(term)`; the
  language switcher in the header as `select` or `buttons`. On `PageShell`:
  `headerHome`, `headerBrand`, the `header-brand` slot, `headerEyebrow`,
  `headerTitleHref`, `headerLogos`, `headerLogosTitle`, `headerLinks`,
  `search`, `languagePlacement`, `languageStyle`.
- `AppNavigation` (#19): the links fold behind a menu button on a narrow
  screen (`layout.nav.menu`), closing again when one is followed; `notice`
  renders a standing bar under the links; `external` links open in a new
  window. On `PageShell`: `notice`.
- `AppFooter` and `AppSponsors` (#20): `links` beside the footer text;
  `groups` of sponsors under headings, next to the flat `sponsors`. On
  `PageShell`: `footerLinks`, `sponsorGroups`.
- `AppBanner` (#21): `variant` `strip`, `split` or `section`, with `caption`
  (a string or `{ name, partner, location, country }`), `captionLabel`,
  `eyebrow`, `title`, `titleHref`, `subtitle`, `headline` (Markdown, rendered
  through viewer-core), `enter`, `strapline`; `AppHyperlinks` `variant`
  `tiles` with `subtitle` and `titleHref`. On `PageShell`: `bannerVariant`
  and the matching `banner*` props, `hyperlinksVariant`,
  `hyperlinksSubtitle`, `hyperlinksTitleHref`.
- Tokens for every new colour, spacing and size, listed in
  `tokens.reference.css`.

## 2.0.0

Breaking. A website adopting this must be on `@metanull/viewer-core` 1.2.1 or
later — 1.1.0 does not declare the `/i18n` entry point this reads its texts
through, and 1.2.0 keys them on a symbol that is not shared when that entry
point is loaded as a second copy of the module — and must supply the five
`layout.*` entries, which it does by receiving the `layout` namespace of
`@metanull/viewer-i18n`.

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
