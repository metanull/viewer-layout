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

## Theming

Every color, font, spacing, radius comes from a `--mwnf-*` CSS custom property with a neutral fallback. Full list: [`tokens.reference.css`](src/tokens.reference.css) (also exported as `@metanull/viewer-layout/tokens.reference.css`) — copy it into your website as `theme/tokens.css` and set values.

Below `48rem` the navigation folds its links behind a menu button, the
`split` banner stacks its two columns, and the banner captions are hidden.

## Release

1. PR to `main` (direct pushes are blocked); CI must be green.
2. Bump `version` in `package.json` + `CHANGELOG.md` entry (strict semver).
3. Create a GitHub release with tag `vX.Y.Z` — CI publishes to GitHub Packages.
