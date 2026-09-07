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
  // The entries the content components read, from viewer-i18n 1.7.0's
  // `core`, `catalogue` and `record` namespaces.
  'core.action.apply': 'Apply',
  'core.action.close': 'Close',
  'core.action.reset': 'Reset',
  'core.pagination.next': 'Next',
  'core.pagination.previous': 'Previous',
  'catalogue.pagination.first': 'First',
  'catalogue.pagination.go': 'Go',
  'catalogue.pagination.last': 'Last',
  'catalogue.pagination.page': 'Page',
  'record.action.hideShortDescription': 'Hide short description',
  'record.action.viewShortDescription': 'View short description',
  'record.citation.heading': 'Citation',
  'record.glossary.close': 'Close',
  'record.glossary.heading': 'Glossary',
  'record.glossary.tool': 'Glossary tool',
  'record.glossary.instructions': 'Enter the first letter(s) of the term you are looking for, then choose one of the options in the list.',
  'record.glossary.definition': 'Definition',
  'record.dynasty.heading': 'Dynasties',
  'record.media.photograph': 'Photograph',
  'record.sheet.credits': 'Credits',
  'record.sheet.languages': 'Languages',
  // viewer-i18n's `sheet` namespace, read by DynastyPopout.
  'sheet.field.alsoKnownAs': 'Also known as',
  'sheet.field.area': 'Area',
  'sheet.field.history': 'History',
}

export function globalWithI18n(options = {}) {
  const i18n = createI18n({
    locale: options.locale ?? 'en',
    messages: { en: layoutTexts, ...options.messages },
  })
  return { global: { plugins: [i18n] } }
}
