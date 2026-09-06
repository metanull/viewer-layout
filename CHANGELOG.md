# Changelog

## 2.3.0

Wave E of the shared-pages epic (metanull/inventory-app#1691), the composed
views (viewer-core#50 decided they live here: they are made of this
package's components, and viewer-core does not depend on the layout).
Additive; every export of 2.2.0 is unchanged.

- A third entry point, `@metanull/viewer-layout/views`, and the same three
  exports from the package: `HomeView` (the welcome, the section cards and
  the record on display, from `config.home`), `CatalogueResultsView` (the
  filters in the URL, the options, the date rule, the order, the pages, the
  rows and the summary, from a spec) and `RecordView` (the record's language
  and loads, the sheet, the sections, the credits, the citation, the related
  records and the glossary popover, from a spec). Each keeps slots for what
  only one website has, and a website whose page is not this shape writes
  its own on the same components.
- `--mwnf-view-*` tokens for the arrangement of a composed page, in the
  reference file.
- Peer dependency `@metanull/viewer-core` ^1.8.0: the views read the
  engine of wave B. The build externalizes `@metanull/viewer-core` as it
  already did `@metanull/viewer-core/i18n`; the tests stand a fixture data
  package behind `@inventory-data`, as a website stands its own.

## 2.2.0

Wave C of the shared-pages epic (metanull/inventory-app#1691): the content
components — what renders inside a page, from props. Additive; every export
of 2.1.0 is unchanged. The texts these read are in every bundle of
`@metanull/viewer-i18n` from 1.7.0.

- A second entry point, `@metanull/viewer-layout/content` (#23), for a page
  that composes a list and a pagination without carrying the shell; the
  same components are exported from the package too. One stylesheet for
  both. Their tokens — `--mwnf-card-*`, `--mwnf-featured-*`, `--mwnf-list-*`,
  `--mwnf-grid-*`, `--mwnf-pagination-*`, `--mwnf-filter-*`, `--mwnf-facet-*`,
  `--mwnf-summary-*`, `--mwnf-languages-*`, `--mwnf-sheet-*`, `--mwnf-credits-*`,
  `--mwnf-media-*`, `--mwnf-popover-*` — are in `tokens.reference.css`, and a
  test now fails when a stylesheet reads a token the reference does not
  document.
- `SectionCards` and `FeaturedRecord` (#24): a landing page's cards and its
  spotlight, which three websites carried with the same hundred lines of CSS.
- `RecordList` and `RecordGrid` (#25): records as rows (the standalone row)
  and as tiles with a hover card (the DXA grid), over one record contract —
  `{ id, image, imageAlt, name, meta, badge, href | to }` — so a page swaps
  one for the other by changing a component name.
- `Pagination`, `FacetSelect`, `FilterPanel`, `ResultsSummary` (#26): one
  pagination for the five that existed, a labelled facet select, the panel
  in its two legacy shapes (`apply` and `immediate`), and a summary that
  renders every count beside its label.
- `RecordLanguages`, `RecordSheet`, `SheetSection`, `RecordCredits`,
  `RelatedRecords` (#27): the sheet in its two legacy layouts (table and
  list) with the short-description toggle built in and a slot per custom
  row, and the blocks around it.
- `MediaGallery` and `GlossaryPopover` (#28): one image gallery with
  thumbnails and a lightbox (and a `row` variant for the standalone sites'
  flat row until they adopt the gallery — decision D4), and one glossary
  popover. Escape closes both and focus returns to what opened them.
- Links: an `href` the website's router produced, as everywhere in this
  package; a route location (`to`) is honoured through the application's
  `RouterLink` when it registered one. Nothing here imports vue-router.

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
