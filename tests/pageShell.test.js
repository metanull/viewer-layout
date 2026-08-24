import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { PageShell } from '../src/index.js'
import { globalWithI18n } from './helpers.js'

describe('PageShell', () => {
  it('with only a default slot renders only the Content area', () => {
    const wrapper = mount(PageShell, {
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('main#mwnf-content').text()).toBe('Body')
    expect(wrapper.find('header').exists()).toBe(false)
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.find('footer').exists()).toBe(false)
    expect(wrapper.find('.mwnf-banner').exists()).toBe(false)
    expect(wrapper.find('.mwnf-hyperlinks').exists()).toBe(false)
    expect(wrapper.find('.mwnf-sponsors').exists()).toBe(false)
  })

  it('renders all seven sections in the fixed vertical order', () => {
    const wrapper = mount(PageShell, {
      props: {
        headerTitle: 'My Museum',
        bannerText: 'Welcome',
        navLinks: [{ label: 'Items', href: '#/items' }],
        hyperlinks: [{ label: 'MWNF', href: 'https://example.org' }],
        sponsors: [{ name: 'Sponsor A' }],
        footerText: '© MWNF',
      },
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    const order = Array.from(
      wrapper.element.querySelectorAll(
        '.mwnf-header, .mwnf-banner, .mwnf-nav, .mwnf-content, .mwnf-hyperlinks, .mwnf-sponsors, .mwnf-footer',
      ),
      (el) => el.className.split(' ')[0],
    )
    expect(order).toEqual([
      'mwnf-header',
      'mwnf-banner',
      'mwnf-nav',
      'mwnf-content',
      'mwnf-hyperlinks',
      'mwnf-sponsors',
      'mwnf-footer',
    ])
  })

  it('renders named slot content inside the matching section', () => {
    const wrapper = mount(PageShell, {
      slots: {
        header: '<span class="custom-header">Hand-made header</span>',
        default: '<p>Body</p>',
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('header .custom-header').text()).toBe('Hand-made header')
    expect(wrapper.find('footer').exists()).toBe(false)
  })

  it('re-emits update:language from the navigation', async () => {
    const wrapper = mount(PageShell, {
      props: { languages: ['en', 'fr'], language: 'en' },
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    await wrapper.find('select').setValue('fr')
    expect(wrapper.emitted('update:language')).toEqual([['fr']])
  })

  it('renders a skip link targeting the content area', () => {
    const wrapper = mount(PageShell, {
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    const skip = wrapper.find('.mwnf-skip-link')
    expect(skip.attributes('href')).toBe('#mwnf-content')
    expect(skip.text()).toBe('Skip to content')
  })
})
