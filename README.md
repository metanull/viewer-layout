# @metanull/viewer-layout

Page structure for MWNF websites: `<PageShell>` composing seven optional, token-styled sections. No data access, no routing, no theming values — websites own their `theme/tokens.css`.

## Install

`.npmrc`:

```ini
@metanull:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
npm install @metanull/viewer-layout
```

`@metanull/viewer-core` is a peer dependency: the layout reads its five own
texts from the application's catalogue through it.

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

## Texts

The layout carries no texts of its own. It renders five entries, which reach it
from the catalogue the website passes to `createViewer`:

| Entry | Rendered as |
| --- | --- |
| `layout.nav.skipToContent` | the skip link |
| `layout.nav.label` | the navigation's `aria-label` |
| `layout.language.label` | the label of the language chooser |
| `layout.hyperlinks.label` | the related-links `aria-label`, unless a `title` is given |
| `layout.sponsors.label` | the sponsors `aria-label`, unless a `title` is given |

They are published in the `layout` namespace of
[`@metanull/viewer-i18n`](https://github.com/metanull/viewer-i18n), which every
website receives; a website overloads any of them in its own `locales/` file.
A language that has not translated one falls back to English.

## PageShell

Sections render top to bottom in this fixed order. Every section is optional: it renders nothing unless its slot or driving props are set. The default slot (→ `AppContent`) is where the router-view goes.

| Section | Slot | Props (on PageShell) | Events |
|---|---|---|---|
| `AppHeader` | `#header` | `header-title`, `header-subtitle` | — |
| `AppBanner` | `#banner` | `banner-image`, `banner-image-alt`, `banner-text` | — |
| `AppNavigation` | `#navigation` | `nav-links`, `languages`, `language` | `update:language` |
| `AppContent` | default | — | — |
| `AppHyperlinks` | `#hyperlinks` | `hyperlinks-title`, `hyperlinks` | — |
| `AppSponsors` | `#sponsors` | `sponsors-title`, `sponsors` | — |
| `AppFooter` | `#footer` | `footer-text` | — |

## Sections (standalone use)

All sections are also exported individually.

| Component | Props | Slot behavior |
|---|---|---|
| `AppHeader` | `title`, `subtitle` (String) | Slot replaces title/subtitle |
| `AppBanner` | `image`, `imageAlt`, `text` (String) | Slot replaces image/text |
| `AppNavigation` | `links: [{ label, href, active? }]`, `languages: ['en']` or `[{ code, label }]`, `language: String`; emits `update:language` | Slot replaces the link list; language switcher stays |
| `AppContent` | — | Default slot only; renders `<main id="mwnf-content">` |
| `AppHyperlinks` | `title: String`, `links: [{ label, href }]` | Slot replaces the link list |
| `AppSponsors` | `title: String`, `sponsors: [{ name, href?, logo? }]` | Slot replaces the sponsor list |
| `AppFooter` | `text` (String) | Slot replaces text |

`AppNavigation` renders plain `<a :href>` links — pass hrefs from your router (hash URLs work as-is).

## Theming

Every color, font, spacing, radius comes from a `--mwnf-*` CSS custom property with a neutral fallback. Full list: [`tokens.reference.css`](src/tokens.reference.css) (also exported as `@metanull/viewer-layout/tokens.reference.css`) — copy it into your website as `theme/tokens.css` and set values.

## Built-in strings

| Key | English default |
|---|---|
| `layout.skipToContent` | Skip to content |
| `layout.navigationLabel` | Main navigation |
| `layout.languageLabel` | Language |
| `layout.hyperlinksLabel` | Related links |
| `layout.sponsorsLabel` | Sponsors |

## Release

1. PR to `main` (direct pushes are blocked); CI must be green.
2. Bump `version` in `package.json` + `CHANGELOG.md` entry (strict semver).
3. Create a GitHub release with tag `vX.Y.Z` — CI publishes to GitHub Packages.
