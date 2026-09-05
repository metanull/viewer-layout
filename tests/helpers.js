import { createI18n } from '@metanull/viewer-core/i18n'

// The layout has no texts of its own any more: every `layout.*` entry comes
// from the application, which merges @metanull/viewer-i18n with its own file.
// These tests stand in for that application, so what they pass is what a real
// website's catalogue contains.
export const layoutTexts = {
  'layout.hyperlinks.label': 'Related links',
  'layout.language.label': 'Language',
  'layout.nav.label': 'Main navigation',
  'layout.nav.menu': 'Menu',
  'layout.nav.skipToContent': 'Skip to content',
  'layout.sponsors.label': 'Sponsors',
}

export function globalWithI18n(options = {}) {
  const i18n = createI18n({
    locale: options.locale ?? 'en',
    messages: { en: layoutTexts, ...options.messages },
  })
  return { global: { plugins: [i18n] } }
}
