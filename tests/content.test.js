import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import {
  FacetSelect,
  FeaturedRecord,
  FilterPanel,
  GlossaryPopover,
  MediaGallery,
  Pagination,
  RecordCredits,
  RecordGrid,
  RecordLanguages,
  RecordList,
  RecordSheet,
  RelatedRecords,
  ResultsSummary,
  SectionCards,
  SheetSection,
} from '../src/content/index.js'
import { globalWithI18n } from './helpers.js'

const records = [
  { id: 'a', image: 'a.jpg', imageAlt: 'A', name: 'Glazed <em>bowl</em>', meta: ['Egypt', '900–950'], badge: 'object', href: '#/item/a' },
  { id: 'b', name: 'Lamp', meta: ['Syria'], href: '#/item/b' },
]

describe('the content entry point', () => {
  it('brings none of the shell', () => {
    const source = readFileSync(resolve('src/content/index.js'), 'utf8')
    expect(source).not.toMatch(/PageShell|sections\//)
  })
})

describe('SectionCards', () => {
  it('renders one card per section, with its way in', () => {
    const wrapper = mount(SectionCards, {
      props: { cards: [{ title: 'Database', description: 'Search everything', action: 'Search', href: '#/database' }] },
      ...globalWithI18n(),
    })
    expect(wrapper.findAll('.mwnf-cards__card')).toHaveLength(1)
    expect(wrapper.find('a').attributes('href')).toBe('#/database')
    expect(wrapper.text()).toContain('Search everything')
    expect(wrapper.text()).toContain('Search →')
  })

  it('renders nothing for no card', () => {
    expect(mount(SectionCards, globalWithI18n()).html()).not.toContain('mwnf-cards')
  })

  it('renders cards in rows variant with image and number', () => {
    const wrapper = mount(SectionCards, {
      props: {
        variant: 'rows',
        cards: [{ title: 'Item One', number: 'I', image: 'one.jpg', alt: 'First', href: '#/1' }],
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-cards--rows').exists()).toBe(true)
    expect(wrapper.find('.mwnf-cards__image').attributes('src')).toBe('one.jpg')
    expect(wrapper.find('.mwnf-cards__image').attributes('alt')).toBe('First')
    expect(wrapper.text()).toContain('I')
    expect(wrapper.text()).toContain('Item One')
  })

  it('renders cards in covers variant with image overlay and number', () => {
    const wrapper = mount(SectionCards, {
      props: {
        variant: 'covers',
        cards: [{ title: 'Dynasty Two', number: 'II', image: 'two.jpg', alt: 'Second', href: '#/2' }],
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-cards--covers').exists()).toBe(true)
    expect(wrapper.find('.mwnf-cards__image').attributes('src')).toBe('two.jpg')
    expect(wrapper.text()).toContain('II')
    expect(wrapper.text()).toContain('Dynasty Two')
  })

  it('renders accordion variant with collapsible details and child links', async () => {
    const wrapper = mount(SectionCards, {
      props: {
        variant: 'accordion',
        cards: [
          {
            title: 'Section A',
            number: 'I',
            children: [
              { title: 'Sub One', href: '#/a1' },
              { title: 'Sub Two', href: '#/a2' },
            ],
          },
        ],
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-cards--accordion').exists()).toBe(true)
    expect(wrapper.find('details').exists()).toBe(true)
    expect(wrapper.text()).toContain('Section A')
    expect(wrapper.text()).toContain('I')
    const children = wrapper.findAll('.mwnf-cards__child-link')
    expect(children).toHaveLength(2)
    expect(children[0].attributes('href')).toBe('#/a1')
    expect(children[0].text()).toBe('Sub One')
  })
})

describe('FeaturedRecord', () => {
  it('renders the record and its name as HTML', () => {
    const wrapper = mount(FeaturedRecord, {
      props: { heading: 'Item on display', image: 'x.jpg', imageAlt: 'A bowl', eyebrow: 'object', name: 'Glazed <em>bowl</em>', meta: ['Cairo', '900'], action: 'View', href: '#/item/1' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('h2').text()).toBe('Item on display')
    expect(wrapper.find('.mwnf-featured__name').html()).toContain('<em>bowl</em>')
    expect(wrapper.find('img').attributes('alt')).toBe('A bowl')
    expect(wrapper.findAll('.mwnf-featured__meta').map((m) => m.text())).toEqual(['Cairo', '900'])
  })

  it('renders nothing with nothing to show', () => {
    expect(mount(FeaturedRecord, globalWithI18n()).find('section').exists()).toBe(false)
  })
})

describe('RecordList and RecordGrid', () => {
  it('render the same records over one contract', () => {
    const list = mount(RecordList, { props: { records }, ...globalWithI18n() })
    const grid = mount(RecordGrid, { props: { records, actionLabel: 'See' }, ...globalWithI18n() })
    expect(list.findAll('.mwnf-list__row')).toHaveLength(2)
    expect(grid.findAll('.mwnf-grid__tile')).toHaveLength(2)
    expect(list.find('.mwnf-list__name').html()).toContain('<em>bowl</em>')
    expect(grid.find('.mwnf-grid__name').html()).toContain('<em>bowl</em>')
    expect(list.findAll('.mwnf-list__meta-item').map((m) => m.text())).toEqual(['Egypt', '900–950', 'Syria'])
    expect(list.find('.mwnf-list__badge').text()).toBe('object')
    expect(list.find('a').attributes('href')).toBe('#/item/a')
    expect(grid.find('.mwnf-grid__action').attributes('href')).toBe('#/item/a')
  })

  it('show the card of a tile on hover, and cut a long line as legacy did', async () => {
    const long = 'x'.repeat(100)
    const grid = mount(RecordGrid, { props: { records: [{ id: 'a', name: 'A', meta: [long] }] }, ...globalWithI18n() })
    expect(grid.find('.mwnf-grid__tile--hover').exists()).toBe(false)
    await grid.find('.mwnf-grid__tile').trigger('mouseenter')
    expect(grid.find('.mwnf-grid__tile--hover').exists()).toBe(true)
    expect(grid.find('.mwnf-grid__meta').text()).toHaveLength(84)
    expect(grid.find('.mwnf-grid__meta').text().endsWith('[...]')).toBe(true)
  })

  it('say when they are loading, and hand an empty list to the slot', () => {
    const loading = mount(RecordList, { props: { records: [], loading: true, loadingText: 'Loading…' }, ...globalWithI18n() })
    expect(loading.text()).toBe('Loading…')
    expect(loading.attributes('aria-busy')).toBe('true')
    const empty = mount(RecordGrid, { props: { records: [] }, slots: { empty: '<p class="none">Nothing</p>' }, ...globalWithI18n() })
    expect(empty.find('.none').text()).toBe('Nothing')
  })
})

describe('Pagination', () => {
  const page = (currentPage, lastPage) => ({ total: lastPage * 10, lastPage, currentPage, from: 1, to: 10, rows: [] })

  it('renders a window around the current page and the position beside the texts', () => {
    const wrapper = mount(Pagination, { props: { pageInfo: page(7, 20) }, ...globalWithI18n() })
    expect(wrapper.findAll('.mwnf-pagination__number').map((b) => b.text())).toEqual(['5', '6', '7', '8', '9'])
    expect(wrapper.find('[aria-current="page"]').text()).toBe('7')
    expect(wrapper.find('.mwnf-pagination__position').text()).toBe('7 / 20')
    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).toContain('Previous')
  })

  it('emits the page to go to, clamped, and nothing for the page it is on', async () => {
    const wrapper = mount(Pagination, { props: { pageInfo: page(1, 3), jump: true }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-pagination__button').attributes('disabled')).toBeDefined()
    await wrapper.findAll('.mwnf-pagination__number')[2].trigger('click')
    await wrapper.find('.mwnf-pagination__jump-field').setValue('99')
    await wrapper.find('.mwnf-pagination__jump-field').trigger('keyup.enter')
    await wrapper.findAll('.mwnf-pagination__number')[0].trigger('click')
    expect(wrapper.emitted('navigate')).toEqual([[3], [3]])
  })

  it('renders nothing for a single page', () => {
    expect(mount(Pagination, { props: { pageInfo: page(1, 1) }, ...globalWithI18n() }).find('nav').exists()).toBe(false)
  })
})

describe('FacetSelect, FilterPanel, ResultsSummary', () => {
  it('a facet offers its placeholder and options, and emits the choice', async () => {
    const wrapper = mount(FacetSelect, {
      props: { label: 'Country', placeholder: 'Select a country', options: [{ value: 'eg', label: 'Egypt' }], modelValue: '' },
      ...globalWithI18n(),
    })
    const options = wrapper.findAll('option')
    expect(options[0].attributes('disabled')).toBeDefined()
    expect(options[1].text()).toBe('Egypt')
    await wrapper.find('select').setValue('eg')
    expect(wrapper.emitted('update:modelValue')).toEqual([['eg']])
  })

  it('a facet hides itself when asked and it has nothing to offer', () => {
    expect(mount(FacetSelect, { props: { options: [], hideEmpty: true }, ...globalWithI18n() }).find('label').exists()).toBe(false)
  })

  it('a panel applies and resets in one mode, only resets in the other', async () => {
    const apply = mount(FilterPanel, { props: { title: 'Filter' }, slots: { default: '<input />' }, ...globalWithI18n() })
    expect(apply.findAll('button')).toHaveLength(2)
    expect(apply.text()).toContain('Apply')
    await apply.find('form').trigger('submit')
    await apply.find('.mwnf-filter__button--reset').trigger('click')
    expect(apply.emitted('apply')).toHaveLength(1)
    expect(apply.emitted('reset')).toHaveLength(1)
    const immediate = mount(FilterPanel, { props: { mode: 'immediate', disabled: true }, ...globalWithI18n() })
    expect(immediate.findAll('button')).toHaveLength(1)
    expect(immediate.find('fieldset').attributes('disabled')).toBeDefined()
  })

  it('a summary renders each count beside its label', () => {
    const wrapper = mount(ResultsSummary, {
      props: { parts: [{ label: 'Objects found', count: 12 }, { label: 'out of', count: 340, value: 'objects' }] },
      ...globalWithI18n(),
    })
    expect(wrapper.findAll('.mwnf-summary__part').map((p) => p.text().replace(/\s+/g, ' '))).toEqual(['Objects found 12', 'out of 340 objects'])
  })
})

describe('RecordLanguages', () => {
  it('renders the languages as pressed buttons and emits the choice', async () => {
    const wrapper = mount(RecordLanguages, {
      props: { languages: [{ code: 'ar', label: 'العربية' }, 'en'], language: 'en' },
      ...globalWithI18n(),
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.map((b) => b.text())).toEqual(['العربية', 'EN'])
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(buttons[0].attributes('lang')).toBe('ar')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('select')).toEqual([['ar']])
  })

  it('renders nothing for one language', () => {
    expect(mount(RecordLanguages, { props: { languages: ['en'] }, ...globalWithI18n() }).find('div').exists()).toBe(false)
  })
})

describe('RecordSheet', () => {
  const rows = [
    { key: 'name', label: 'Name', render: 'inline', value: 'Bowl', html: 'Glazed <em>bowl</em>' },
    { key: 'description', label: 'Description', render: 'block', value: '…', html: '<p>A bowl in <span class="gloss-term" data-gid="g1">kufic</span> script.</p>' },
    { key: 'catalogue', label: 'Catalogue', render: 'link', value: 'https://example.org/1', html: null },
    { key: 'museum', label: 'Museum', render: 'custom', value: 'm1', html: null },
  ]

  it('renders rows as a table with HTML values, a link, and a slot for a custom row', () => {
    const wrapper = mount(RecordSheet, {
      props: { rows, dir: 'ltr' },
      slots: { museum: '<a class="museum" href="#/partner/m1">The Museum</a>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('th').map((t) => t.text())).toEqual(['Name', 'Description', 'Catalogue', 'Museum'])
    expect(wrapper.find('.mwnf-sheet__inline').html()).toContain('<em>bowl</em>')
    expect(wrapper.find('.gloss-term').exists()).toBe(true)
    expect(wrapper.find('a[href="https://example.org/1"]').exists()).toBe(true)
    expect(wrapper.find('.museum').text()).toBe('The Museum')
    expect(wrapper.find('.mwnf-sheet').attributes('dir')).toBe('ltr')
  })

  it('renders the same rows as a list', () => {
    const wrapper = mount(RecordSheet, { props: { rows, layout: 'list' }, ...globalWithI18n() })
    expect(wrapper.find('dl').exists()).toBe(true)
    expect(wrapper.findAll('dt').map((t) => t.text())).toEqual(['Name', 'Description', 'Catalogue', 'Museum'])
  })

  it('folds the short description behind a toggle after the description', async () => {
    const wrapper = mount(RecordSheet, {
      props: { rows, shortDescription: { html: '<p>Short.</p>' } },
      ...globalWithI18n(),
    })
    const toggle = wrapper.find('.mwnf-sheet__toggle')
    expect(toggle.text()).toBe('View short description')
    expect(wrapper.text()).not.toContain('Short.')
    await toggle.trigger('click')
    expect(wrapper.text()).toContain('Short.')
    expect(wrapper.find('.mwnf-sheet__toggle').text()).toBe('Hide short description')
    // Directly after the description row, before the catalogue.
    const labels = wrapper.findAll('th').map((t) => t.text())
    expect(labels.indexOf('Hide short description')).toBe(labels.indexOf('Description') + 1)
  })
})

describe('SheetSection, RecordCredits, RelatedRecords', () => {
  it('a section renders a heading and rendered HTML', () => {
    const wrapper = mount(SheetSection, { props: { heading: 'History', html: '<p>Long ago.</p>' }, ...globalWithI18n() })
    expect(wrapper.find('h2').text()).toBe('History')
    expect(wrapper.find('.mwnf-sheet-section__body').html()).toContain('<p>Long ago.</p>')
  })

  it('credits render who made the sheet, the working number and the citation', () => {
    const wrapper = mount(RecordCredits, {
      props: { credits: [{ label: 'Prepared by', value: 'A. Author' }], workingNumber: 'EG 12', workingNumberLabel: 'MWNF working number', citation: 'A. Author "Bowl" in DIA, 2026.' },
      ...globalWithI18n(),
    })
    expect(wrapper.findAll('h2').map((h) => h.text())).toEqual(['Credits', 'Citation'])
    expect(wrapper.find('dd').text()).toBe('A. Author')
    expect(wrapper.find('.mwnf-credits__number').text()).toContain('EG 12')
    expect(wrapper.find('.mwnf-credits__citation').text()).toContain('in DIA')
  })

  it('related records render as rows or tiles, and leave the outside references to the slot', () => {
    const list = mount(RelatedRecords, { props: { heading: 'Related', records }, ...globalWithI18n() })
    expect(list.find('.mwnf-list').exists()).toBe(true)
    const grid = mount(RelatedRecords, {
      props: { heading: 'Related', records, variant: 'grid' },
      slots: { default: '<p class="outside">mwnf3:objects:x9</p>' },
      ...globalWithI18n(),
    })
    expect(grid.find('.mwnf-grid').exists()).toBe(true)
    expect(grid.find('.outside').exists()).toBe(true)
    expect(mount(RelatedRecords, { props: { records: [] }, ...globalWithI18n() }).find('section').exists()).toBe(false)
  })
})

describe('MediaGallery', () => {
  const images = [
    { url: 'a.jpg', alt: 'A', caption: 'Front', photographer: 'P. Photo', copyright: 'The Museum' },
    { url: 'b.jpg', alt: 'B' },
  ]

  it('shows the current image, the thumbnails, the caption and the credit', async () => {
    const wrapper = mount(MediaGallery, { props: { images }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-media__main img').attributes('src')).toBe('a.jpg')
    expect(wrapper.findAll('.mwnf-media__thumb')).toHaveLength(2)
    expect(wrapper.find('.mwnf-media__caption').text()).toContain('Front')
    expect(wrapper.find('.mwnf-media__credit').text()).toBe('Photograph: P. Photo — © The Museum')
    await wrapper.findAll('.mwnf-media__thumb')[1].trigger('click')
    expect(wrapper.find('.mwnf-media__main img').attributes('src')).toBe('b.jpg')
    expect(wrapper.find('.mwnf-media__caption').exists()).toBe(false)
  })

  it('opens a lightbox, moves with the arrows, closes with Escape', async () => {
    const wrapper = mount(MediaGallery, { props: { images }, attachTo: document.body, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-lightbox').exists()).toBe(false)
    await wrapper.find('.mwnf-media__main').trigger('click')
    expect(wrapper.find('.mwnf-lightbox').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()
    expect(wrapper.find('.mwnf-lightbox__image').attributes('src')).toBe('b.jpg')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.mwnf-lightbox').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders every image in a row in the row variant', () => {
    const wrapper = mount(MediaGallery, { props: { images, variant: 'row' }, ...globalWithI18n() })
    expect(wrapper.findAll('figure')).toHaveLength(2)
    expect(wrapper.find('.mwnf-media__thumbs').exists()).toBe(false)
  })
})

describe('GlossaryPopover', () => {
  it('renders the term and closes on Escape or the button', async () => {
    const wrapper = mount(GlossaryPopover, {
      props: { term: { word: 'kufic', spelling: 'Kufic', definition: 'An angular script.' } },
      attachTo: document.body,
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-popover__term').text()).toBe('Kufic')
    expect(wrapper.find('.mwnf-popover__definition').text()).toBe('An angular script.')
    expect(wrapper.find('.mwnf-popover__title').text()).toContain('Glossary')
    await wrapper.find('.mwnf-popover__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    await wrapper.setProps({ term: { word: 'x', spelling: 'x', definition: 'y' } })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(2)
    wrapper.unmount()
  })

  it('renders nothing without a term, and rendered HTML when given', () => {
    expect(mount(GlossaryPopover, globalWithI18n()).find('aside').exists()).toBe(false)
    const wrapper = mount(GlossaryPopover, { props: { term: { word: 'x' }, html: '<p>Rendered <em>text</em></p>' }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-popover__definition').html()).toContain('<em>text</em>')
  })
})
