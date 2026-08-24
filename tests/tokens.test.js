import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppHeader } from '../src/index.js'
import { globalWithI18n } from './helpers.js'

// vitest runs with the package root as cwd; ?raw imports and import.meta.url
// are both unreliable for CSS here, so read the file directly.
const layoutCss = readFileSync(resolve('src/styles/layout.css'), 'utf8')

describe('token styling', () => {
  afterEach(() => {
    document.head.querySelectorAll('style[data-test]').forEach((el) => el.remove())
    document.body.innerHTML = ''
  })

  it('a website token overrides the section computed style', () => {
    const style = document.createElement('style')
    style.setAttribute('data-test', '')
    // jsdom cascades custom properties but never substitutes var() into other
    // properties, so this asserts the two halves it can: the website token
    // reaches the section's computed style, and the stylesheet binds the
    // section background to that token. (Full substitution is covered by the
    // browser check of the consumer app.)
    style.textContent = `${layoutCss}\n.mwnf-header { --mwnf-header-background: rgb(10, 20, 30); }`
    document.head.appendChild(style)

    const wrapper = mount(AppHeader, {
      props: { title: 'My Museum' },
      attachTo: document.body,
      ...globalWithI18n(),
    })
    const computed = getComputedStyle(wrapper.element)
    expect(computed.getPropertyValue('--mwnf-header-background')).toBe('rgb(10, 20, 30)')
    expect(layoutCss).toMatch(/\.mwnf-header\s*{[^}]*background-color:\s*var\(--mwnf-header-background/)
  })

  it('every color, font, spacing and radius in layout.css is token-driven', () => {
    const declarations = layoutCss
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split(';')
      .map((decl) => decl.slice(decl.lastIndexOf('{') + 1).replace(/\s+/g, ' ').trim())
      .filter((line) =>
        /^(background(-color)?|color|font-family|font-size|padding|padding-\S+|gap|margin(-\S+)?|border(-\S+)?|border-radius|line-height|height|max-height|font-weight):/.test(
          line,
        ),
      )
    const hardcoded = declarations.filter(
      (line) =>
        !line.includes('var(--mwnf-') &&
        !/^(margin|padding)[^:]*:\s*(0|0 0[^;]*|auto);?$/.test(line) &&
        !/inherit|transparent|currentColor|none|100%|auto/.test(line),
    )
    expect(hardcoded, `hardcoded values found:\n${hardcoded.join('\n')}`).toEqual([])
  })
})
