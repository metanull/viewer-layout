import { useI18n } from 'vue-i18n'
import { layoutMessages } from './messages.js'

// t() limited to the layout.* namespace: uses the application's messages when
// the key exists in the active locale, otherwise the bundled English default.
export function useLayoutText() {
  const { t, te } = useI18n()
  return (key) => (te(key) ? t(key) : (layoutMessages.en.layout[key.split('.').pop()] ?? key))
}
