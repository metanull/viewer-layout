// English defaults for every built-in string the layout renders.
// Websites merge (and translate) these under the `layout` namespace of their
// own vue-i18n messages; keys missing from the active locale fall back to
// these bundled values at render time.
export const layoutMessages = {
  en: {
    layout: {
      skipToContent: 'Skip to content',
      navigationLabel: 'Main navigation',
      languageLabel: 'Language',
      hyperlinksLabel: 'Related links',
      sponsorsLabel: 'Sponsors',
    },
  },
}
