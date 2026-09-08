import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { SiteShell } from '../src/components/index.js'
import { globalWithI18n, layoutTexts } from './helpers.js'

const texts = {
  ...layoutTexts,
  'site.nav.home': 'Home',
  'site.nav.collection': 'Collection',
  'site.nav.partners': 'Partners',
  'site.nav.myCollection': 'My Collection',
  'site.footer.about': 'About MWNF',
  'site.search.placeholder': 'Search the collection',
  'site.search.submit': 'Search',
  'site.section.collection': 'Collection',
  'site.sponsors.coOrganisers': 'Co-organisers',
}

async function mountShell({ props = {}, slots = {}, route = '/collection' } = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<p>home</p>' }, meta: { section: 'home' } },
      { path: '/collection', name: 'collection', component: { template: '<p>collection</p>' }, meta: { section: 'collection' } },
      { path: '/search-results', name: 'search-results', component: { template: '<p>results</p>' } },
    ],
  })
  await router.push(route)
  await router.isReady()
  const { global } = globalWithI18n({ messages: { en: texts } })
  return mount(SiteShell, {
    props,
    slots,
    global: { ...global, plugins: [...global.plugins, router] },
  })
}

const navigation = {
  links: [
    { section: 'home', label: 'site.nav.home', to: { name: 'home' } },
    { section: 'collection', label: 'site.nav.collection', to: { name: 'collection' } },
    { label: 'site.nav.myCollection', href: 'https://example.org/mycollection', external: true },
  ],
  headerLinks: [{ label: 'site.nav.home', to: { name: 'home' } }],
  footerLinks: [{ label: 'site.footer.about', href: 'https://example.org/about', external: true }],
  sectionTitles: { collection: 'site.section.collection' },
  search: { route: 'search-results', key: 'q', placeholder: 'site.search.placeholder', submitLabel: 'site.search.submit', empty: 'all-objects' },
}

describe('SiteShell', () => {
  it('renders the configured nav links, marking the active one from the route section', async () => {
    const wrapper = await mountShell({ props: { config: { navigation } } })
    const links = wrapper.findAll('.mwnf-nav__link')
    expect(links.map((l) => l.text())).toEqual(['Home', 'Collection', 'My Collection'])
    expect(links[0].classes()).not.toContain('mwnf-nav__link--active')
    expect(links[1].classes()).toContain('mwnf-nav__link--active')
    expect(links[1].attributes('aria-current')).toBe('page')
  })

  it('resolves a `to` route location to an href', async () => {
    const wrapper = await mountShell({ props: { config: { navigation } } })
    const collectionLink = wrapper.findAll('.mwnf-nav__link')[1]
    expect(collectionLink.attributes('href')).toBe('/collection')
  })

  it('renders header and footer links, external ones opening in a new window', async () => {
    const wrapper = await mountShell({ props: { config: { navigation } } })
    expect(wrapper.find('.mwnf-header__link').text()).toBe('Home')
    expect(wrapper.find('.mwnf-header__link').attributes('target')).toBeUndefined()
    const footerLink = wrapper.find('.mwnf-footer__link')
    expect(footerLink.text()).toBe('About MWNF')
    expect(footerLink.attributes('target')).toBe('_blank')
    const myCollection = wrapper.findAll('.mwnf-nav__link')[2]
    expect(myCollection.attributes('target')).toBe('_blank')
  })

  it('submits the search form to the configured route and key, writing `empty` for a blank submit', async () => {
    const wrapper = await mountShell({ props: { config: { navigation } } })
    const router = wrapper.vm.$router
    await wrapper.find('.mwnf-header__search-input').setValue('bowl')
    await wrapper.find('.mwnf-header__search').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('search-results')
    expect(router.currentRoute.value.query).toEqual({ q: 'bowl' })

    await wrapper.find('.mwnf-header__search-input').setValue('')
    await wrapper.find('.mwnf-header__search').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ q: 'all-objects' })
  })

  it('puts the section title in the banner from `sectionTitles`', async () => {
    const wrapper = await mountShell({
      props: { config: { navigation, banner: { variant: 'section' } } },
    })
    expect(wrapper.find('.mwnf-banner__title').text()).toBe('Collection')
  })

  it('renders a #brand slot inside the header, beside the computed links', async () => {
    const wrapper = await mountShell({
      props: { config: { navigation } },
      slots: { brand: '<span class="mark">MWNF</span>' },
    })
    expect(wrapper.find('.mwnf-header__home .mark').text()).toBe('MWNF')
    expect(wrapper.find('.mwnf-header__link').exists()).toBe(true)
  })

  it('maps the `logos` prop into header logos and sponsor groups through `config.logos`', async () => {
    // Already in PageShell's logo shape (`{ image, alt, href? }`) plus the
    // one extra field the site's own bucketing reads — turning legacy's
    // `image_url`/`labels` into this shape is the site's own job.
    const logos = [
      { category_id: 0, image: 'unaoc.png', alt: 'UNAOC' },
      { category_id: 1, image: 'sponsor-a.png', alt: 'Sponsor A' },
      { category_id: 1, image: 'sponsor-b.png', alt: 'Sponsor B' },
    ]
    const logosConfig = {
      header: (logo) => Number(logo.category_id) === 0,
      headerTitle: 'site.sponsors.coOrganisers',
      sponsorGroups: (list, t) => {
        const rest = list.filter((logo) => Number(logo.category_id) !== 0)
        return rest.length ? [{ title: t('site.sponsors.coOrganisers'), sponsors: rest.map((logo) => ({ name: logo.alt, logo: logo.image })) }] : []
      },
    }
    const wrapper = await mountShell({ props: { config: { navigation, logos: logosConfig }, logos } })
    expect(wrapper.find('.mwnf-header__logos-title').text()).toBe('Co-organisers')
    expect(wrapper.find('.mwnf-header__logo img').attributes('src')).toBe('unaoc.png')
    expect(wrapper.find('.mwnf-sponsors__group-title').text()).toBe('Co-organisers')
    expect(wrapper.findAll('.mwnf-sponsors__item')).toHaveLength(2)
  })

  it('leaves an unconfigured field to $attrs', async () => {
    const wrapper = await mountShell({
      props: { config: { navigation: {} }, bannerImage: 'own-banner.jpg', footerText: '© Own footer' },
    })
    expect(wrapper.find('.mwnf-banner__image').attributes('src')).toBe('own-banner.jpg')
    expect(wrapper.find('.mwnf-footer__text').text()).toBe('© Own footer')
  })
})
