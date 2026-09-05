<script setup>
import AppHeader from './sections/AppHeader.vue'
import AppBanner from './sections/AppBanner.vue'
import AppNavigation from './sections/AppNavigation.vue'
import AppContent from './sections/AppContent.vue'
import AppHyperlinks from './sections/AppHyperlinks.vue'
import AppSponsors from './sections/AppSponsors.vue'
import AppFooter from './sections/AppFooter.vue'
import { useI18n } from '@metanull/viewer-core/i18n'

// The page every website is: seven sections in a fixed order, each filled
// from props and rendering nothing when it has nothing. A website hands
// these props over from `dataset.config.js` (`navigation`) or from a thin
// shell of its own; a slot is for the content of a section — the mark in
// the header, the active view — not for rebuilding the section.
defineProps({
  // Header
  headerTitle: { type: String, default: '' },
  headerSubtitle: { type: String, default: '' },
  headerEyebrow: { type: String, default: '' },
  headerTitleHref: { type: String, default: '' },
  headerHome: { type: String, default: '' },
  headerBrand: { type: String, default: '' },
  headerLogos: { type: Array, default: () => [] },
  headerLogosTitle: { type: String, default: '' },
  headerLinks: { type: Array, default: () => [] },
  search: { type: Object, default: null },
  // Languages
  languages: { type: Array, default: () => [] },
  language: { type: String, default: '' },
  /** 'navigation' | 'header' */
  languagePlacement: { type: String, default: 'navigation' },
  /** 'select' | 'buttons' */
  languageStyle: { type: String, default: 'select' },
  // Banner
  bannerVariant: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  bannerImageAlt: { type: String, default: '' },
  bannerText: { type: String, default: '' },
  bannerCaption: { type: [String, Object], default: '' },
  bannerCaptionLabel: { type: String, default: '' },
  bannerEyebrow: { type: String, default: '' },
  bannerTitle: { type: String, default: '' },
  bannerTitleHref: { type: String, default: '' },
  bannerSubtitle: { type: String, default: '' },
  bannerHeadline: { type: String, default: '' },
  bannerEnter: { type: Object, default: null },
  bannerStrapline: { type: String, default: '' },
  // Navigation
  navLinks: { type: Array, default: () => [] },
  notice: { type: Object, default: null },
  // Hyperlinks
  hyperlinksVariant: { type: String, default: '' },
  hyperlinksTitle: { type: String, default: '' },
  hyperlinksTitleHref: { type: String, default: '' },
  hyperlinksSubtitle: { type: String, default: '' },
  hyperlinks: { type: Array, default: () => [] },
  // Sponsors
  sponsorsTitle: { type: String, default: '' },
  sponsors: { type: Array, default: () => [] },
  sponsorGroups: { type: Array, default: () => [] },
  // Footer
  footerText: { type: String, default: '' },
  footerLinks: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:language', 'search'])
const { t } = useI18n()
</script>

<template>
  <div class="mwnf-page">
    <a class="mwnf-skip-link" href="#mwnf-content">{{ t('layout.nav.skipToContent') }}</a>
    <AppHeader
      :title="headerTitle"
      :subtitle="headerSubtitle"
      :eyebrow="headerEyebrow"
      :title-href="headerTitleHref"
      :home="headerHome"
      :brand="headerBrand"
      :logos="headerLogos"
      :logos-title="headerLogosTitle"
      :links="headerLinks"
      :search="search"
      :languages="languages"
      :language="language"
      :language-style="languagePlacement === 'header' ? languageStyle : ''"
      @search="emit('search', $event)"
      @update:language="emit('update:language', $event)"
    >
      <template v-if="$slots.header" #default><slot name="header" /></template>
      <template v-if="$slots['header-brand']" #brand><slot name="header-brand" /></template>
    </AppHeader>
    <AppBanner
      :variant="bannerVariant"
      :image="bannerImage"
      :image-alt="bannerImageAlt"
      :text="bannerText"
      :caption="bannerCaption"
      :caption-label="bannerCaptionLabel"
      :eyebrow="bannerEyebrow"
      :title="bannerTitle"
      :title-href="bannerTitleHref"
      :subtitle="bannerSubtitle"
      :headline="bannerHeadline"
      :enter="bannerEnter"
      :strapline="bannerStrapline"
    >
      <template v-if="$slots.banner" #default><slot name="banner" /></template>
    </AppBanner>
    <AppNavigation
      :links="navLinks"
      :languages="languages"
      :language="language"
      :language-switcher="languagePlacement !== 'header'"
      :notice="notice"
      @update:language="emit('update:language', $event)"
    >
      <template v-if="$slots.navigation" #default><slot name="navigation" /></template>
    </AppNavigation>
    <AppContent>
      <template v-if="$slots.default" #default><slot /></template>
    </AppContent>
    <AppHyperlinks
      :variant="hyperlinksVariant"
      :title="hyperlinksTitle"
      :title-href="hyperlinksTitleHref"
      :subtitle="hyperlinksSubtitle"
      :links="hyperlinks"
    >
      <template v-if="$slots.hyperlinks" #default><slot name="hyperlinks" /></template>
    </AppHyperlinks>
    <AppSponsors :title="sponsorsTitle" :sponsors="sponsors" :groups="sponsorGroups">
      <template v-if="$slots.sponsors" #default><slot name="sponsors" /></template>
    </AppSponsors>
    <AppFooter :text="footerText" :links="footerLinks">
      <template v-if="$slots.footer" #default><slot name="footer" /></template>
    </AppFooter>
  </div>
</template>
