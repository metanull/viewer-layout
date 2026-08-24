import { createI18n } from 'vue-i18n'

// Minimal i18n context: the layout must fall back to its bundled English
// defaults when the application defines no layout.* messages.
export function globalWithI18n(options = {}) {
  const i18n = createI18n({
    legacy: false,
    locale: options.locale ?? 'en',
    fallbackLocale: 'en',
    missingWarn: false,
    fallbackWarn: false,
    messages: options.messages ?? {},
  })
  return { global: { plugins: [i18n] } }
}
