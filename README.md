# @metanull/viewer-layout

Page structure for MWNF websites: `<PageShell>` composing seven optional, token-styled sections. No data access, no routing, no theming values — websites own their `theme/tokens.css`.

`PageShell` covers the needs of every website from props. A website fills the
sections it has and leaves the rest empty; a slot is for the *content* of a
section — the mark in the header, the active view — not for rebuilding the
section. A website that needs something no prop expresses adds the prop
here, so the next website has it too.

## Install

`.npmrc`:

```ini
@metanull:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
npm install @metanull/viewer-layout
```

`@metanull/viewer-core` (1.6.0 or later) is a peer dependency: the layout
reads its texts from the application's catalogue through it, and renders the
one Markdown prop it has (the banner headline) through its pipeline.

## Use

```js
import { PageShell } from '@metanull/viewer-layout'
import '@metanull/viewer-layout/style.css'
import './theme/tokens.css' // your copy of tokens.reference.css
```

```vue
<PageShell
  header-title="My Museum"
  :nav-links="[{ label: 'Items', href: '#/items', active: true }]"
  :languages="['en', 'fr']"
  language="en"
  footer-text="© MWNF"
  @update:language="switchLanguage"
>
  <router-view />
</PageShell>
```

With `@metanull/viewer-core`, a website passes these props from
`dataset.config.js` (`navigation`) or from a thin shell of its own that
computes the ones that depend on the route or the language.

## Texts

The layout carries no texts of its own. It renders six entries, which reach it
from the catalogue the website passes to `createViewer`:

| Entry | Rendered as |
| --- | --- |
| `layout.nav.skipToContent` | the skip link |
| `layout.nav.label` | the navigation's `aria-label` |
| `layout.nav.menu` | the menu button on a narrow screen |
| `layout.language.label` | the label of the language chooser |
| `layout.hyperlinks.label` | the related-links `aria-label`, unless a `title` is given |
| `layout.sponsors.label` | the sponsors `aria-label`, unless a `title` is given |

They are published in the `layout` namespace of
[`@metanull/viewer-i18n`](https://github.com/metanull/viewer-i18n), which every
website receives; a website overloads any of them in its own `locales/` file.
A language that has not translated one falls back to English.

Every other text a section shows — a link label, a search placeholder, a
notice, a sponsor heading — is a prop, and the website passes it through its
own `t()`.

## PageShell

Sections render top to bottom in this fixed order. Every section is optional: it renders nothing unless its slot or driving props are set. The default slot (→ `AppContent`) is where the router-view goes.

| Section | Slot | Props (on PageShell) | Events |
|---|---|---|---|
| `AppHeader` | `#header`, `#header-brand` | `header-home`, `header-brand`, `header-eyebrow`, `header-title`, `header-title-href`, `header-subtitle`, `header-logos`, `header-logos-title`, `header-links`, `search`, `languages`, `language`, `language-placement`, `language-style` | `search`, `update:language` |
| `AppBanner` | `#banner` | `banner-variant`, `banner-image`, `banner-image-alt`, `banner-text`, `banner-caption`, `banner-caption-label`, `banner-eyebrow`, `banner-title`, `banner-title-href`, `banner-subtitle`, `banner-headline`, `banner-enter`, `banner-strapline` | — |
| `AppNavigation` | `#navigation` | `nav-links`, `notice`, `languages`, `language` | `update:language` |
| `AppContent` | default | — | — |
| `AppHyperlinks` | `#hyperlinks` | `hyperlinks-variant`, `hyperlinks-title`, `hyperlinks-title-href`, `hyperlinks-subtitle`, `hyperlinks` | — |
| `AppSponsors` | `#sponsors` | `sponsors-title`, `sponsors`, `sponsor-groups` | — |
| `AppFooter` | `#footer` | `footer-text`, `footer-links` | — |

### The language switcher

`languages` is `['en']` or `[{ code, label }]`, `language` the active code.
`language-placement` says where the switcher renders: `navigation` (the
default, a select at the end of the navigation bar) or `header`;
`language-style` says how, `select` or `buttons`. Whichever renders emits
`update:language` with the code chosen.

### Links

Every link list — `header-links`, `nav-links`, `hyperlinks`, `footer-links`
— takes `{ label, href, external? }`; `external: true` opens the link in a
new window. `nav-links` also takes `active: true`, marked with
`aria-current="page"`. Links are plain `href`s: with viewer-core's hash
router, `#/items` navigates without any router coupling here.

## Sections (standalone use)

All sections are also exported individually.

| Component | Props | Slot behavior |
|---|---|---|
| `AppHeader` | `home`, `brand`, `eyebrow`, `title`, `titleHref`, `subtitle`, `logos: [{ image, alt, href? }]`, `logosTitle`, `links`, `search: { placeholder, submitLabel, submitText? }`, `languages`, `language`, `languageStyle: 'select' \| 'buttons' \| ''`; emits `search(term)`, `update:language` | Default slot replaces the whole header; `brand` slot is the mark |
| `AppBanner` | `variant: '' \| 'strip' \| 'split' \| 'section'`, `image`, `imageAlt`, `text`, `caption` (a string or `{ name, partner, location, country }`), `captionLabel`, `eyebrow`, `title`, `titleHref`, `subtitle`, `headline` (Markdown), `enter: { label, href, ariaLabel? }`, `strapline` | Slot replaces the banner |
| `AppNavigation` | `links`, `languages`, `language`, `languageSwitcher` (Boolean), `notice: { title?, text }`; emits `update:language` | Slot replaces the link list; the menu button, the switcher and the notice stay |
| `AppContent` | — | Default slot only; renders `<main id="mwnf-content">` |
| `AppHyperlinks` | `variant: '' \| 'tiles'`, `title`, `titleHref`, `subtitle`, `links: [{ label, href, description?, external? }]` | Slot replaces the link list |
| `AppSponsors` | `title`, `sponsors: [{ name, href?, logo? }]`, `groups: [{ title, sponsors }]` | Slot replaces the sponsor lists |
| `AppFooter` | `text`, `links` | Slot replaces text and links |

### Banner variants

- `''` — an image with a line of text under it.
- `strip` — a tall image with the site's name over it: `eyebrow` above
  `title`, `enter` rendered after the title as the way in, the `caption` in
  a box that shows on hover. A gallery's home.
- `split` — the image beside a text column: `title`, `subtitle`, `headline`
  (Markdown, rendered through viewer-core's pipeline), `enter`, `strapline`.
  An exhibition's home.
- `section` — a narrow strip with `title` over its lower edge and the
  `caption` at the other end. Every other page. The title is data the
  website derives from the route; the component only renders it.

The image's `alt` is `imageAlt`, else the caption's name (with
`captionLabel` before it), else the title.

### Hyperlinks variants

- `''` — a titled list of links.
- `tiles` — a title block (`title`, `subtitle`, linking to `titleHref`) beside
  one tile per link, each with its `label` and `description`. An exhibition's
  bottom banner.

## Content components

What renders *inside* a page, from props: the pieces every website's landing
page, results pages and record page are made of. Behaviour is viewer-core's
(`useListQuery`, `paginate`, `useFacets`, `useRecordSheet`, `sheetRows`, …);
what a page holds — which cards, which fields, which filters — is the site's;
these render it. They are exported from the package and, on their own,
from `@metanull/viewer-layout/content`, which brings none of the shell.

```js
import { RecordList, Pagination } from '@metanull/viewer-layout/content'
```

Links take an `href` the website's router produced — the same rule as the
sections. A route location (`to`) is honoured too, through the `RouterLink`
the application registered, without any router coupling here.

| Component | Props | Notes |
|---|---|---|
| `SectionCards` | `cards: [{ title, description, action, href \| to }]` | a landing page's grid of section cards |
| `FeaturedRecord` | `heading`, `image`, `imageAlt`, `eyebrow`, `name` (inline HTML), `meta: [string]`, `action`, `href \| to` | the "item on display" spotlight; the default slot replaces the record |
| `RecordList` | `records`, `loading`, `loadingText` | records as rows; `#empty` slot |
| `RecordGrid` | `records`, `loading`, `loadingText`, `actionLabel`, `dateCutoff` (80) | records as tiles with a hover card, shown under the image on a narrow screen; `#empty` slot |
| `Pagination` | `pageInfo` (viewer-core's `paginate()` result), `window` (5), `jump`, `ends`; emits `navigate(page)` | first / previous / a window of pages / next / last, the position beside the texts |
| `FacetSelect` | `label`, `options: [{ value, label }]`, `modelValue`, `placeholder`, `anyLabel`, `disabled`, `hideEmpty`; emits `update:modelValue` | one labelled select for one facet |
| `FilterPanel` | `title`, `mode: 'apply' \| 'immediate'`, `applyLabel`, `resetLabel`, `disabled`; emits `apply`, `reset` | the box the controls (default slot) sit in; `apply` has both buttons, `immediate` only Reset |
| `ResultsSummary` | `parts: [{ label, count?, value? }]` | each count beside its label, never inside a text; `#actions` slot |
| `RecordLanguages` | `languages`, `language`; emits `select(code)` | the languages one record carries, as pressed buttons |
| `RecordSheet` | `rows` (viewer-core's `sheetRows()`), `layout: 'table' \| 'list'`, `dir`, `shortDescription: { html }`, `shortDescriptionAfter`, `shortDescriptionOpen` | a row rendered `custom` or `link` is handed to a slot named after its key |
| `SheetSection` | `heading`, `html`, `dir` | a headed block under the sheet |
| `RecordCredits` | `credits: [{ label, value }]`, `workingNumber`, `workingNumberLabel`, `citation`, `heading`, `citationHeading` | who made the sheet, the working number, the citation |
| `RelatedRecords` | `heading`, `records`, `variant: 'list' \| 'grid'`, `actionLabel` | the same two presentations as a results page; outside references go in the default slot |
| `MediaGallery` | `images: [{ url, alt, caption, photographer, copyright }]`, `start`, `variant: '' \| 'row'` | the current image, thumbnails, caption, a lightbox (Escape closes, arrows move, focus returns); `row` renders every image in a row |
| `GlossaryPopover` | `term: { word, spelling, definition }`, `html`, `dir`; emits `close` | the definition of a clicked term, fixed in a corner; Escape closes, focus returns |

The record contract `RecordList`, `RecordGrid` and `RelatedRecords` share:
`{ id, image?, imageAlt?, name (inline HTML), meta: [string], badge?, href? | to? }`.

The texts they read — `core.action.apply`, `.reset`, `.close`,
`core.pagination.*`, `catalogue.pagination.*`, `record.action.*ShortDescription`,
`record.citation.heading`, `record.glossary.heading`, `.close`,
`record.media.photograph`, `record.sheet.credits`, `.languages` — are in
every bundle of `@metanull/viewer-i18n` from 1.7.0. Every other text is a prop.

## Composed views

Three whole pages, made of the content components on viewer-core's
composables and driven by a declaration the website writes instead of a
page. They are exported from the package and, on their own, from
`@metanull/viewer-layout/views`. A website names them in viewer-core's
`config.views` — the `home`, `list` and `detail` slots of the router — or
on its own routes, with the spec as route props. A website whose page is
not this shape writes its own component on the same content components:
the escape hatch stays open. They live here rather than in viewer-core
because they are made of this package's components, and viewer-core does
not depend on the layout.

Every text in a declaration is an **entry name, written out**, resolved by
the view through `t`; a number is placed beside its text by the view, never
inside it.

```js
import { CatalogueResultsView, HomeView, RecordView } from '@metanull/viewer-layout/views'

export default {
  views: { home: HomeView },
  home: {
    title: 'mysite.home.title',
    intro: 'mysite.home.intro',
    cards: [{ title: 'mysite.nav.catalogue', description: 'mysite.home.catalogueText', action: 'core.action.browse', to: { name: 'catalogue' } }],
    featured: { entity: 'items', heading: 'mysite.home.itemOnDisplay', action: 'core.action.viewDetails', route: 'item', eyebrow: 'type', meta: ['location', 'dates'] },
  },
  extraViews: [
    { path: '/catalogue', name: 'catalogue', component: CatalogueResultsView, props: { spec: catalogue }, meta: { section: 'catalogue', entities: ['items', 'countries'] } },
    { path: '/item/:id', name: 'item', component: RecordView, props: (route) => ({ spec: sheet, id: route.params.id }), meta: { section: 'catalogue', entities: ['items', 'countries'] } },
  ],
}
```

| View | Declaration | Slots |
|---|---|---|
| `HomeView` | `config.home` or the same as props: `title`, `intro` (Markdown), `cards: [{ title, description, action, to \| href }]`, `featured: { entity, heading, action, route, eyebrow, meta, seed }` — the pick is `useFeaturedRecord` | `before`, default, `after` |
| `CatalogueResultsView` | `spec`: `entity`, `keys`, `facets` (viewer-core's facet spec), `facetScope: 'all' \| 'matching'`, `controls: [{ key, type: 'select' \| 'year', label, placeholder, anyLabel, hideEmpty }]`, `filterMode: 'apply' \| 'immediate'`, `scope(record, filters)`, `match(record, filters)`, `dates: { mode, begin, end }`, `sort`, `pageSize`, `variant: 'list' \| 'grid'`, `record(record, helpers)`, `recordRoute`, `summary(context)`, `title`, `filterTitle`, `empty`, `actionLabel`, `pagination` | `before`, `filters`, `actions`, `aside`, `empty`, `after` — each given `{ filters, active, apply, reset, matching, pageInfo, options }` |
| `RecordView` | `spec` and `id`: `entity`, `translations`, `attribution`, `fields` (viewer-core's `sheetRows` spec, or a function of the context), `sections`, `layout`, `shortDescription`, `media(record, ctx)`, `mediaVariant`, `credits`, `workingNumber`, `citation: { project, permalink, heading } \| false`, `related: { variant, heading, record, route } \| false`, `back: { label, to \| href }`, `title(ctx)` | `header`, `before-sheet`, `after-sheet`, `aside`, `related`, `after`, and one named after every `custom` or `link` row — each given `{ record, text, language, dir, glossary, ready, attribution, t, tr }` |

The tokens they read — `--mwnf-view-*` — arrange the parts; a website themes
a composed page by theming the parts.

## Theming

Every color, font, spacing, radius comes from a `--mwnf-*` CSS custom property with a neutral fallback. Full list: [`tokens.reference.css`](src/tokens.reference.css) (also exported as `@metanull/viewer-layout/tokens.reference.css`) — copy it into your website as `theme/tokens.css` and set values.

Below `48rem` the navigation folds its links behind a menu button, the
`split` banner stacks its two columns, and the banner captions are hidden.

## Release

1. PR to `main` (direct pushes are blocked); CI must be green.
2. Bump `version` in `package.json` + `CHANGELOG.md` entry (strict semver).
3. Create a GitHub release with tag `vX.Y.Z` — CI publishes to GitHub Packages.
