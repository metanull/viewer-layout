# Changelog

## 2.9.0

- `TimelineEventList` and `TimelineResultsView` (#37): the seven sites'
  hand-written Timeline pages — none importing `FacetSelect`/`FilterPanel`,
  each with its own query mirroring and its own rows — as one engine over
  viewer-core's `useTimelineEvents`. `TimelineResultsView`'s spec covers all
  three axes (the worldwide country merge, an exhibition's own narrative
  chronology, Sharing History's exhibition split) and both legacy pages per
  site: `entrance: true` renders the form alone, with validation, navigating
  to a target route; `entrance: false` (default) is the results, with the
  filter panel, the summary, pagination, and DXA's "See gallery" cross-link
  over an item predicate the site supplies. `TimelineEventList` renders the
  per-event rows the results page and a slot both need — a date, a caption,
  a Markdown description, an image/item strip and per-event actions such as
  the standalone sites' "View items from this period". The `begin` and `end`
  controls accept an optional `options` prop: an array or function yielding
  `[{ value, label }]` buckets (century strings like "1500–1599" for DXA
  sites); without it, a free-year number input.

- _(pending: `PartnerListView` — metanull/viewer-layout#38)_

- `SearchFormView`, over `FilterPanel`/`FacetSelect` and viewer-core's `useFacets`, `centuryPresets`, `yearBuckets` and `useSearchLanguage`: legacy's three search entrances — `Database`'s keyword rows, `CollectionSearch`'s facet column, `PcEntrance`'s one-filter-at-a-time radio — as one spec, over `mode: 'rows' | 'facets' | 'radio'` (metanull/viewer-layout#39)

- `GlossaryTool`: the search box four item sheets and a theme page each wrote
  for themselves, over viewer-core's `searchGlossary` — an input, the hit
  list, the chosen definition as Markdown, collapsed behind a native
  `<details>` toggle (keyboard-usable for free, as `SectionCards`'
  accordion variant already is). `DynastyPopout`: the other fifty repeated
  lines, one dynasty's name, also known as, area, AH/AD dates and history,
  the same toggle; islamicart's dynasty cards and its dynasty sheet fold
  into the same shape (decision D5). `DynastyList` renders one popout per
  dynasty of a record, `RelatedRecords`'s shape (metanull/viewer-layout#40).

- Five components promoted from the DXA and exhibition sites to the shared package:
  - `PartnerMap` — an OpenStreetMap embed for a partner's location, centred and zoomed from
    the record's coordinates; the title and "map of X" label are catalogue entries.
  - `FeaturedPartners` — a carousel of featured partner records, one showing at a time,
    rotated on a timer, with bullet controls.
  - `SiblingGalleries` — two blocks of gallery tiles and MWNF virtual museum links; galleries
    may be unresolved (no link); the site builds the arrays from its data and provides the
    museums' labels and links.
  - `PopupLogo` — a dismissible fixed modal for sponsor logos or notices, with Markdown
    rendering by default or opt-in raw HTML.
  - `BackLink` — a "back" navigation link that uses browser history when available, with a
    fallback route.

## 2.8.0

Five more gaps, found by `EssayView`, `LinkListView` and `SectionCards`'s
next two site adoptions (metanull/sharinghistory#50, metanull/water-in-islam#42,
both merged; metanull/islamicart#57, open) over metanull/viewer-layout#34/#47/#49.
Additive; every export of 2.7.0 is unchanged.

- `EssayView`'s `tabs` accepts `'children'` alongside the existing `true`/
  `'siblings'` (unchanged, the node's own siblings): a theme page whose tab
  strip is its chapters, not its neighboring themes.
- `EssayView` now reads `spec.entity` — already a spec key, for the items
  grid — as the tree's own translations entity when `spec.tree` carries none
  of its own (`spec.tree.entity`/`.themes`), falling back to `'collections'`
  as before. Fixes a pre-built tree (a site's own `useCollectionTree()`
  result, handed to `EssayView` as `spec.tree`) silently reading the wrong
  entity for every node's title/quote/body.
- `EssayView`'s `numbering: 'roman' | 'decimal'` counts a node among its true
  siblings — found through `tree.parents(id)` — instead of `tree.root`'s
  children, which a themes-package tree (`root` is always `null`) has none
  of; every top-level theme numbered "I" before this. A themes tree now
  numbers its top-level themes I, II, III, same as any other.
- `EssayView`'s `about(node)` may return `{ panel?, navigation? }` instead of
  a plain boolean, keeping the named piece instead of dropping it; the
  spec-wide `aboutKeeps: ['panel' | 'navigation']` does the same across every
  about page in one spec. A plain `true`/`false` return is unchanged — both
  still dropped.
- `LinkListView`'s `label` and `note` render as inline Markdown (through
  `mdInline`) instead of plain interpolated text — a bibliography entry's
  italicised title survives instead of being stripped. New slots `before`,
  `group` (given `{ group }`; the default renders the heading and its links —
  replace it entirely for a citation list, which is not link-shaped) and
  `after`.
- `SectionCards`' `title` and `description` render as inline Markdown
  (`mdInline`, no block elements) instead of plain text.

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
