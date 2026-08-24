import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  AppBanner,
  AppContent,
  AppFooter,
  AppHeader,
  AppHyperlinks,
  AppNavigation,
  AppSponsors,
} from '../src/index.js'
import { globalWithI18n } from './helpers.js'

const cases = [
  {
    component: AppHeader,
    name: 'AppHeader',
    tag: 'header',
    props: { title: 'My Museum', subtitle: 'A subtitle' },
    texts: ['My Museum', 'A subtitle'],
  },
  {
    component: AppBanner,
    name: 'AppBanner',
    tag: 'section',
    props: { text: 'Welcome to the exhibition' },
    texts: ['Welcome to the exhibition'],
  },
  {
    component: AppNavigation,
    name: 'AppNavigation',
    tag: 'nav',
    props: { links: [{ label: 'Items', href: '#/items' }] },
    texts: ['Items'],
  },
  {
    component: AppHyperlinks,
    name: 'AppHyperlinks',
    tag: 'section',
    props: { links: [{ label: 'MWNF', href: 'https://example.org' }] },
    texts: ['MWNF'],
  },
  {
    component: AppSponsors,
    name: 'AppSponsors',
    tag: 'section',
    props: { sponsors: [{ name: 'Sponsor A' }] },
    texts: ['Sponsor A'],
  },
  {
    component: AppFooter,
    name: 'AppFooter',
    tag: 'footer',
    props: { text: '© MWNF' },
    texts: ['© MWNF'],
  },
]

describe.each(cases)('$name', ({ component, tag, props, texts }) => {
  it('renders nothing without props or slot', () => {
    const wrapper = mount(component, globalWithI18n())
    expect(wrapper.find(tag).exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('renders its element and content when props are set', () => {
    const wrapper = mount(component, { props, ...globalWithI18n() })
    expect(wrapper.find(tag).exists()).toBe(true)
    for (const text of texts) {
      expect(wrapper.text()).toContain(text)
    }
  })

  it('renders slot content', () => {
    const wrapper = mount(component, {
      slots: { default: '<span class="custom">Custom</span>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find(tag).exists()).toBe(true)
    expect(wrapper.find('.custom').text()).toBe('Custom')
  })
})

describe('AppContent', () => {
  it('renders nothing without a slot', () => {
    const wrapper = mount(AppContent, globalWithI18n())
    expect(wrapper.find('main').exists()).toBe(false)
  })

  it('wraps the default slot in <main id="mwnf-content">', () => {
    const wrapper = mount(AppContent, {
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('main#mwnf-content').text()).toBe('Body')
  })
})

describe('AppNavigation language switcher', () => {
  it('renders no switcher for a single language', () => {
    const wrapper = mount(AppNavigation, {
      props: { links: [{ label: 'Items', href: '#/items' }], languages: ['en'], language: 'en' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('select').exists()).toBe(false)
  })

  it('renders the switcher with the bundled English label and emits update:language', async () => {
    const wrapper = mount(AppNavigation, {
      props: { languages: ['en', 'fr'], language: 'en' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-nav__language-label').text()).toBe('Language')
    await wrapper.find('select').setValue('fr')
    expect(wrapper.emitted('update:language')).toEqual([['fr']])
  })

  it('uses the application message for the label when defined', () => {
    const wrapper = mount(AppNavigation, {
      props: { languages: ['en', 'fr'], language: 'fr' },
      ...globalWithI18n({
        locale: 'fr',
        messages: { fr: { layout: { languageLabel: 'Langue' } } },
      }),
    })
    expect(wrapper.find('.mwnf-nav__language-label').text()).toBe('Langue')
  })

  it('marks the active link with aria-current', () => {
    const wrapper = mount(AppNavigation, {
      props: {
        links: [
          { label: 'Home', href: '#/' },
          { label: 'Items', href: '#/items', active: true },
        ],
      },
      ...globalWithI18n(),
    })
    const active = wrapper.find('.mwnf-nav__link--active')
    expect(active.text()).toBe('Items')
    expect(active.attributes('aria-current')).toBe('page')
  })
})
