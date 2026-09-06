import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from '@metanull/viewer-core/i18n'
import { loadEntities, useDataPackage } from '@metanull/viewer-core'
import { CatalogueResultsView, HomeView, RecordView } from '../src/views/index.js'
import { layoutTexts } from './helpers.js'

// The composed views render a real page out of the fixture package behind
// `@inventory-data`: an `objects` entity with dates, a country, tags and
// related records, and a glossary. These texts stand in for the website's
// catalogue — the shared bundle plus its own file.
const texts = {
  ...layoutTexts,
  'core.action.viewDetails': 'View details',
  'core.status.loading': 'Loading…',
  'catalogue.facet.any': 'Any',
  'catalogue.facet.country': 'Country',
  'catalogue.facet.fromYear': 'From year',
  'catalogue.filter.heading': 'Filter',
  'catalogue.results.itemsFound': 'Items found',
  'catalogue.results.noResultsFilter': 'No items match the selected filter.',
  'record.action.backToResults': 'Back to results',
  'record.citation.in': 'in',
  'record.related.items': 'Related items',
  'sheet.field.description': 'Description',
  'sheet.field.location': 'Location',
  'sheet.field.name': 'Name',
  'sheet.field.preparedBy': 'Prepared by',
  'sheet.field.type': 'Type',
  'sheet.field.workingNumber': 'MWNF working number',
  'core.project.islamicArt': 'Discover Islamic Art',
  'site.home.title': 'Welcome',
  'site.home.intro': 'A **fixture** museum.',
  'site.home.catalogue': 'Catalogue',
  'site.home.catalogueText': 'Every object.',
  'site.home.onDisplay': 'On display',
}

const COUNTRY_NAMES = { 'c-eg': 'Egypt', 'c-sy': 'Syria' }

async function settle(predicate, tries = 40) {
  for (let i = 0; i < tries && !predicate(); i++) await new Promise((r) => setTimeout(r, 5))
  await nextTick()
}

async function mountView(component, { props = {}, slots = {}, route = '/' } = {}) {
  const i18n = createI18n({ locale: 'en', messages: { en: texts } })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<p>home</p>' } },
      { path: '/objects', name: 'objects-list', component: { template: '<p>list</p>' } },
      { path: '/objects/:id', name: 'objects-detail', component: { template: '<p>detail</p>' } },
      { path: '/item/:id', name: 'item', component: { template: '<p>item</p>' } },
    ],
  })
  // The view reads its filters from the URL, so the URL is in place first —
  // as it is for a website, where the router has resolved before a view exists.
  await router.push(route)
  await router.isReady()
  const wrapper = mount(component, { props, slots, global: { plugins: [i18n, router] } })
  return { wrapper, router }
}

// What a website's router does before any of these views exists: the
// entities the routes declare, and English, which every list reads.
beforeAll(async () => {
  await loadEntities(['objects', 'glossary'])
  const pkg = useDataPackage()
  await pkg.loadTranslations('objects', 'en')
  await pkg.loadTranslations('glossary', 'en')
})

describe('HomeView', () => {
  it('renders the welcome, the cards and the record on display from the declaration', async () => {
    const { wrapper } = await mountView(HomeView, {
      props: {
        title: 'site.home.title',
        intro: 'site.home.intro',
        cards: [{ title: 'site.home.catalogue', description: 'site.home.catalogueText', action: 'core.action.viewDetails', to: { name: 'objects-list' } }],
        featured: { entity: 'objects', heading: 'site.home.onDisplay', action: 'core.action.viewDetails', route: 'objects-detail', eyebrow: 'type', meta: ['location'], seed: 1 },
      },
    })
    await settle(() => wrapper.text().includes('On display'))
    expect(wrapper.find('h1').text()).toBe('Welcome')
    expect(wrapper.find('.mwnf-home__intro').html()).toContain('<strong>fixture</strong>')
    expect(wrapper.find('.mwnf-cards__title').text()).toBe('Catalogue')
    expect(wrapper.find('.mwnf-cards__text').text()).toBe('Every object.')
    expect(wrapper.find('.mwnf-featured').exists()).toBe(true)
    // The pick has an image, so it is one of o1 and o3, and its name is the translated one.
    expect(wrapper.find('.mwnf-featured__name').text()).toMatch(/Glazed bowl|Fragment/)
    expect(wrapper.find('.mwnf-featured__action').text()).toContain('View details')
  })

  it('renders nothing but the slots when nothing is declared', async () => {
    const { wrapper } = await mountView(HomeView, { slots: { default: '<p class="own">Own content</p>' } })
    expect(wrapper.find('.own').exists()).toBe(true)
    expect(wrapper.find('.mwnf-cards').exists()).toBe(false)
    expect(wrapper.find('.mwnf-featured').exists()).toBe(false)
  })
})

describe('CatalogueResultsView', () => {
  const spec = {
    entity: 'objects',
    facets: { country: { field: 'country_id', label: (id) => COUNTRY_NAMES[id] ?? id } },
    dates: { mode: 'overlap', begin: 'begin', end: 'end' },
    controls: [
      { key: 'country', label: 'catalogue.facet.country', anyLabel: 'catalogue.facet.any' },
      { key: 'begin', type: 'year', label: 'catalogue.facet.fromYear' },
    ],
    filterTitle: 'catalogue.filter.heading',
    pageSize: 2,
    recordRoute: 'objects-detail',
  }

  it('lists the records in chronological order, paged, with the options the records carry', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, { props: { spec }, route: '/objects' })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    const names = wrapper.findAll('.mwnf-list__name').map((n) => n.text())
    // Two a page, dated first: the bowl (900), then the lamp (1200).
    expect(names).toEqual(['Glazed bowl', 'Mosque lamp'])
    expect(wrapper.find('.mwnf-summary__count').text()).toBe('4')
    expect(wrapper.find('.mwnf-pagination').exists()).toBe(true)
    const options = wrapper.findAll('.mwnf-facet__select option').map((o) => o.text())
    expect(options).toContain('Egypt')
    expect(options).toContain('Syria')
    expect(wrapper.find('.mwnf-list__link').attributes('href')).toBe('/objects/o1')
  })

  it('reads its filters from the URL and applies the site rule and the date rule', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, scope: (record) => record.id !== 'o4' } },
      route: '/objects?country=c-eg&begin=1000',
    })
    await settle(() => wrapper.text().includes('Items found'))
    // Egypt holds o1 (900–950), o3 (undated) and o4 (scoped out); from 1000
    // under the overlap rule keeps the undated fragment and drops the bowl.
    expect(wrapper.findAll('.mwnf-list__name').map((n) => n.text())).toEqual(['Fragment'])
  })

  it('navigates when a control changes in immediate mode, and hands its slots the state', async () => {
    const { wrapper, router } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, filterMode: 'immediate' } },
      slots: { aside: '<template #aside="{ pageInfo }"><p class="aside">{{ pageInfo.total }} in the aside</p></template>' },
      route: '/objects',
    })
    await settle(() => wrapper.text().includes('Items found'))
    expect(wrapper.find('.aside').text()).toBe('4 in the aside')
    await wrapper.find('.mwnf-facet__select').setValue('c-sy')
    await settle(() => router.currentRoute.value.query.country === 'c-sy')
    expect(router.currentRoute.value.query.country).toBe('c-sy')
  })

  it('renders the tiles when the spec says grid, and the empty text when nothing matches', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, variant: 'grid', match: () => false } },
      route: '/objects',
    })
    await settle(() => wrapper.text().includes('Items found'))
    expect(wrapper.find('.mwnf-grid').exists()).toBe(true)
    expect(wrapper.text()).toContain('No items match the selected filter.')
  })
})

describe('RecordView', () => {
  const spec = {
    entity: 'objects',
    translations: ['glossary'],
    fields: [
      { key: 'name', label: 'sheet.field.name', value: 'name' },
      { key: 'location', label: 'sheet.field.location', value: 'location' },
      { key: 'type', label: 'sheet.field.type', value: 'type', render: 'custom' },
    ],
    sections: [{ key: 'description', label: 'sheet.field.description', value: 'description' }],
    citation: { project: 'ISL' },
    back: { label: 'record.action.backToResults', to: { name: 'objects-list' } },
    related: { route: 'objects-detail' },
  }

  it('renders the sheet, the sections, the credits, the citation and the related records', async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec, id: 'o1' },
      slots: { type: '<template #type="{ row }"><em class="own-type">{{ row.value }}</em></template>' },
      route: '/objects/o1',
    })
    await settle(() => wrapper.text().includes('Prepared by'))
    expect(wrapper.find('h1').html()).toContain('Glazed <em>bowl</em>')
    expect(wrapper.findAll('.mwnf-sheet__label').map((l) => l.text())).toEqual(['Name', 'Location', 'Type'])
    expect(wrapper.find('.own-type').text()).toBe('Ceramic')
    // The description reaches the glossary: the term is marked while it renders.
    expect(wrapper.find('.mwnf-sheet-section').html()).toContain('gloss-term')
    expect(wrapper.text()).toContain('A. Author')
    expect(wrapper.find('.mwnf-credits__citation').text()).toContain('in Discover Islamic Art')
    expect(wrapper.find('.mwnf-related .mwnf-list__name').text()).toBe('Mosque lamp')
    expect(wrapper.find('.mwnf-related .mwnf-list__meta').text()).toContain('Same workshop')
    expect(wrapper.find('.mwnf-record__back').text()).toContain('Back to results')
    expect(wrapper.find('.mwnf-media').exists()).toBe(true)
  })

  it('reads a monument and an object with different fields when the spec is a function', async () => {
    const { wrapper } = await mountView(RecordView, {
      props: {
        spec: { ...spec, fields: ({ record }) => (record.id === 'o2' ? [{ key: 'type', label: 'sheet.field.type', value: 'type' }] : spec.fields) },
        id: 'o2',
      },
      route: '/objects/o2',
    })
    await settle(() => wrapper.findAll('.mwnf-sheet__label').length > 0)
    expect(wrapper.findAll('.mwnf-sheet__label').map((l) => l.text())).toEqual(['Type'])
  })

  it('opens the glossary popover on a marked term', async () => {
    const { wrapper } = await mountView(RecordView, { props: { spec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.find('.gloss-term').exists())
    await wrapper.find('.gloss-term').trigger('click')
    await settle(() => wrapper.find('.mwnf-popover').exists())
    expect(wrapper.find('.mwnf-popover').text()).toContain('An angular Arabic script.')
  })

  it('shows the not-found view for an id the entity does not carry', async () => {
    const { wrapper } = await mountView(RecordView, { props: { spec, id: 'nope' }, route: '/objects/nope' })
    await nextTick()
    expect(wrapper.find('.vc-not-found').exists()).toBe(true)
  })
})

// The views are a promise to the websites' configurations: what is exported
// from `/views` is what `config.views` names.
describe('the views entry point', () => {
  it('exports the three composed views and no shell', async () => {
    const entry = await import('../src/views/index.js')
    expect(Object.keys(entry).sort()).toEqual(['CatalogueResultsView', 'HomeView', 'RecordView'])
    vi.restoreAllMocks()
  })
})
