# Changelog

## 2.7.0

Four `EssayView` gaps found by its first site adoption (metanull/islamicart#57,
over metanull/viewer-layout#34/#47's `EssayView`): the spec could not reach a
nested translation field, `TextPageView`'s function body had no context to
render a per-record text with, the item grid's caption carried no meta lines
of its own, and a panel with alternate images had no notion of a selected
*variant* — only a selected item, so a "detail" close-up swapped the picture
without swapping its caption. Additive; every export of 2.6.0 is unchanged.

- `EssayView`'s `quote`/`body` accept a dotted path (`'extra.intro_text'`)
  into the node's translation, or a function `(ctx) => Markdown` of the base
  context (`{ node, text, language, tree, t, tr }`), alongside the existing
  flat field name.
- `TextPageView`'s function `body` is now called with `{ t, tr, language }` —
  the same shape `EssayView`'s spec functions read — instead of an empty
  object, so a static page can render a per-record text; fixes a latent bug
  where a function body threw (`md` was read off `useI18n()`, which never
  carried it).
- `EssayView`'s `items.meta(item, ctx) => [string]` and `items.badge(item,
  ctx) => string` add caption lines and a badge to the item grid, the same
  contract `RecordGrid` already renders.
- `EssayView`'s `panel.variants(item, ctx)` now returns
  `[{ id, image, alt, caption: { title, justification, fields } }]`: a full
  caption per variant, not just an image. The view keeps a `selectedVariant`
  (the item's own picture by default) and a thumbnail strip under the panel
  to switch it, swapping the image, title, Markdown justification and fields
  together; `panel.fields` stays as the fallback when a variant carries none
  of its own. `selectedVariant`/`selectVariant` are exposed in every slot's
  context alongside `selected`/`select`. `--mwnf-view-essay-variant-*`
  tokens style the strip, in the reference file.

## 2.6.0

`EssayView` (metanull/viewer-layout#34), the largest piece of the shared-pages
epic: a narrative essay over one node of a collection tree, which seven
pages across four sites become — islamicart's `ExhibitionTheme` and
`ArtIntroTheme`, baroqueart's `ExhibitionTheme`, sharinghistory's
`ExhibitionTheme`, `ExhibitionChapter` and `HistoricalBackgroundCountry`,
and the DXA family's `Theme`. Additive; every export of 2.5.0 is unchanged.

- A fourth composed view, from `@metanull/viewer-layout/views`: `tree` (a
  `useCollectionTree` result, built by the site, or a `{ purpose, childType }`
  / `{ themes }` declaration the view builds one from), a quote and a prose
  body with the glossary, a thumbnail-driven picture panel or a plain
  `RecordGrid`, previous/next over the tree (`navigation: 'tree'` crosses a
  branch boundary — decision D2 — `'siblings'` stays inside the parent), a
  tab strip of sibling pages, a breadcrumb, an `about(node)` mode for a
  tree's own introduction page, and roman/decimal numbering. Slots for what
  is not shared by every page — `justifications` for sharinghistory's
  curator/partner pair, `thumbnails` for the DXA related-works toggle — so
  no page is special-cased in the view itself.
- `--mwnf-view-essay-*` tokens for the essay's arrangement, in the reference
  file; the two-column body, the aside width and the status/back tokens are
  shared with `RecordView`'s.
- Peer and dev dependency `@metanull/viewer-core` ^1.10.0: the view reads
  1.10's `useCollectionTree` (`root`, `byId`, `children`, `parents`,
  `breadcrumb`, `itemsUnder`, `containing`, `walk`, `previous`/`next`, the
  `themes.json` adapter) and `glossaryTermsForText`, for a node with no
  `glossary_ids` column of its own to read.
- `SectionCards`: new `variant` prop (`'cards' | 'rows' | 'covers' | 'accordion'`)
  selects the presentation of the cards. The default `'cards'` is unchanged.
  `'rows'` renders cards in a flex layout with an image on the left, text on
  the right, and the image fades in on hover. `'covers'` displays each card as
  a cropped image with the title and number as text overlay. `'accordion'`
  creates collapsible sections, each with optional `children` subsections; the
  `number` (formatted by the caller as Roman or decimal) precedes the title.
  Tokens documented in `tokens.reference.css`.
- `.mwnf-prose` — readable text styling for essay pages: comfortable measure,
  paragraph spacing, list and link styling all on documented tokens.
- `LinkListView` (in `/views`): a page of categorized links. The spec declares
  groups statically or computed dynamically, each with a heading and links that
  may carry optional notes; an optional back link and title; groups with no links
  are filtered out. Texts are entry names.
- `TextPageView` (in `/views`): a simple page with optional heading and body text
  (rendered as a Markdown entry or a function returning Markdown), styled through
  `.mwnf-prose`. An optional back link that is true for history back, false for
  hidden, or `{ label, to | href }`. Texts are entry names.

## 2.5.0

Two more control kinds `CatalogueResultsView` asked for. Additive.

- `type: 'query'` — a text input bound to `filters[key]`, submitting on Enter
  in `apply` mode and on change in `immediate` mode, the same as `'year'`:
  the keyword-search results pages (three `DatabaseResults.vue`, four
  `SearchResults.vue`) narrow on a term that is not a facet, and could not
  become a spec without one.
- `type: 'checkbox'` — a labelled checkbox writing `'1'` or `''` into
  `filters[key]`: islamicart's Permanent Collection Explore page filters on
  a boolean, which neither existing control kind expressed.

## 2.4.1

What the DXA family's adoption asked for. Additive.

- `CatalogueResultsView`: every slot also receives `goToPage`, so a website
  can compose the filter panel itself — in the aside, where the galleries
  put it — and turn the pages from a second pagination above the tiles.
- `RecordView`: the `related` slot also receives `records` (the rows the
  spec made) and `outside` (the related records the package does not
  carry), so a website can surround the related block with its own without
  computing the relation again.

## 2.4.0

Two hooks the first site adoptions of the composed views asked for.
Additive.

- `CatalogueResultsView`: `spec.narrow(list, filters, helpers)` — a site rule
  over the whole list, applied after `scope`, the facets and `match` and
  before the date rule. A keyword index answers a list, not a predicate per
  record; this is where a results page that also searches hands the engine
  its hits.
- `RecordView`: the context every slot receives gains `languages` (the
  record's, labelled) and `select`, so a `header` of the site's own — a
  type badge, a timeline link — can still offer the record's languages.

## 2.3.0

Wave E of the shared-pages epic (metanull/inventory-app#1691), the composed
views (viewer-core#50 decided they live here: they are made of this
package's components, and viewer-core does not depend on the layout).
Additive; every export of 2.2.0 is unchanged.

- A third entry point, `@metanull/viewer-layout/views` — and only there, not
  from the package root: the views import `@metanull/viewer-core` itself,
  whose entry point carries `.vue` files, and a website's test runner loads
  this package natively while inlining viewer-core, so a root import would
  fail on the first `.vue` in every website's tests (which is what the
  downstream check of this release caught). A website that names the views
  inlines this package too. `HomeView` (the welcome, the section cards and
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
