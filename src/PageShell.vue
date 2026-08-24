<script setup>
import AppHeader from './sections/AppHeader.vue'
import AppBanner from './sections/AppBanner.vue'
import AppNavigation from './sections/AppNavigation.vue'
import AppContent from './sections/AppContent.vue'
import AppHyperlinks from './sections/AppHyperlinks.vue'
import AppSponsors from './sections/AppSponsors.vue'
import AppFooter from './sections/AppFooter.vue'
import { useLayoutText } from './i18n/useLayoutText.js'

defineProps({
  headerTitle: { type: String, default: '' },
  headerSubtitle: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  bannerImageAlt: { type: String, default: '' },
  bannerText: { type: String, default: '' },
  navLinks: { type: Array, default: () => [] },
  languages: { type: Array, default: () => [] },
  language: { type: String, default: '' },
  hyperlinksTitle: { type: String, default: '' },
  hyperlinks: { type: Array, default: () => [] },
  sponsorsTitle: { type: String, default: '' },
  sponsors: { type: Array, default: () => [] },
  footerText: { type: String, default: '' },
})

const emit = defineEmits(['update:language'])
const lt = useLayoutText()
</script>

<template>
  <div class="mwnf-page">
    <a class="mwnf-skip-link" href="#mwnf-content">{{ lt('layout.skipToContent') }}</a>
    <AppHeader :title="headerTitle" :subtitle="headerSubtitle">
      <template v-if="$slots.header" #default><slot name="header" /></template>
    </AppHeader>
    <AppBanner :image="bannerImage" :image-alt="bannerImageAlt" :text="bannerText">
      <template v-if="$slots.banner" #default><slot name="banner" /></template>
    </AppBanner>
    <AppNavigation
      :links="navLinks"
      :languages="languages"
      :language="language"
      @update:language="emit('update:language', $event)"
    >
      <template v-if="$slots.navigation" #default><slot name="navigation" /></template>
    </AppNavigation>
    <AppContent>
      <template v-if="$slots.default" #default><slot /></template>
    </AppContent>
    <AppHyperlinks :title="hyperlinksTitle" :links="hyperlinks">
      <template v-if="$slots.hyperlinks" #default><slot name="hyperlinks" /></template>
    </AppHyperlinks>
    <AppSponsors :title="sponsorsTitle" :sponsors="sponsors">
      <template v-if="$slots.sponsors" #default><slot name="sponsors" /></template>
    </AppSponsors>
    <AppFooter :text="footerText">
      <template v-if="$slots.footer" #default><slot name="footer" /></template>
    </AppFooter>
  </div>
</template>
