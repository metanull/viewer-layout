import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from '@metanull/viewer-core/i18n'
import { loadEntities, useDataPackage } from '@metanull/viewer-core'
import { CatalogueResultsView, EssayView, HomeView, RecordView, LinkListView, TextPageView } from '../src/views/index.js'
import { layoutTexts } from './helpers.js'

// The composed views render a real page out of the fixture package behind
// `@inventory-data`: an `objects` entity with dates, a country, tags and
// related records, and a glossary. These texts stand in for the website's
// catalogue — the shared bundle plus its own file.
const texts = {
  ...layoutTexts,
  'core.action.viewDetails': 'View details',
  'core.action.back': 'Back',
  'core.action.empty': 'Nothing to show.',
  'core.status.loading': 'Loading…',
  'catalogue.facet.any': 'Any',
  'catalogue.facet.country': 'Country',
  'catalogue.facet.fromYear': 'From year',
  'catalogue.facet.keyword': 'Keyword',
  'catalogue.facet.keywordPlaceholder': 'Search…',
  'catalogue.facet.epm': 'European partners',
  'catalogue.filter.heading': 'Filter',
  'catalogue.results.itemsFound': 'Items found',
  'catalogue.results.noResults': 'No results',
  'catalogue.results.noResultsFilter': 'No items match the selected filter.',
  'record.action.backToResults': 'Back to results',
  'record.citation.in': 'in',
  'record.related.items': 'Related items',
  'exhibition.theme.previous': 'Previous',
  'exhibition.theme.next': 'Next',
  'exhibition.theme.inThisTheme': 'In This Theme',
  'exhibition.theme.seeAllInTheme': 'See all Items in this Theme',
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
  'site.further.reading': 'Further reading',
  'site.about.heading': 'About',
  'site.about.body': 'Information about this collection.',
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
      { path: '/theme/:id', name: 'theme', component: { template: '<p>theme</p>' } },
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
  await loadEntities(['objects', 'glossary', 'collections'])
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
      slots: { aside: '<template #aside="{ pageInfo, goToPage }"><p class="aside">{{ pageInfo.total }} in the aside</p><button class="own-page" @click="goToPage(2)">2</button></template>' },
      route: '/objects',
    })
    await settle(() => wrapper.text().includes('Items found'))
    expect(wrapper.find('.aside').text()).toBe('4 in the aside')
    // A second pagination of the website's own turns the same pages.
    await wrapper.find('.own-page').trigger('click')
    await settle(() => router.currentRoute.value.query.page === '2')
    expect(router.currentRoute.value.query.page).toBe('2')
    await wrapper.find('.mwnf-facet__select').setValue('c-sy')
    await settle(() => router.currentRoute.value.query.country === 'c-sy')
    expect(router.currentRoute.value.query.country).toBe('c-sy')
  })

  it('hands the whole list to a site rule that narrows it — a keyword index, say', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, narrow: (list, filters) => (filters.country ? list : list.filter((r) => r.id === 'o2')) } },
      route: '/objects',
    })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    expect(wrapper.findAll('.mwnf-list__name').map((n) => n.text())).toEqual(['Mosque lamp'])
  })

  it('types into a query control and narrows through narrow when it is submitted', async () => {
    const { wrapper, router } = await mountView(CatalogueResultsView, {
      props: {
        spec: {
          entity: 'objects',
          keys: ['q'],
          controls: [{ key: 'q', type: 'query', label: 'catalogue.facet.keyword', placeholder: 'catalogue.facet.keywordPlaceholder' }],
          narrow: (list, filters) => (filters.q ? list.filter((r) => r.id === 'o2') : list),
          recordRoute: 'objects-detail',
        },
      },
      route: '/objects',
    })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    await wrapper.find('.mwnf-facet__select').setValue('lamp')
    await wrapper.find('form').trigger('submit')
    await settle(() => router.currentRoute.value.query.q === 'lamp')
    expect(router.currentRoute.value.query.q).toBe('lamp')
    await settle(() => wrapper.findAll('.mwnf-list__name').length === 1)
    expect(wrapper.findAll('.mwnf-list__name').map((n) => n.text())).toEqual(['Mosque lamp'])
  })

  it('writes 1 to the URL when a checkbox control is checked in immediate mode', async () => {
    const { wrapper, router } = await mountView(CatalogueResultsView, {
      props: {
        spec: {
          entity: 'objects',
          keys: ['epm'],
          controls: [{ key: 'epm', type: 'checkbox', label: 'catalogue.facet.epm' }],
          filterMode: 'immediate',
          recordRoute: 'objects-detail',
        },
      },
      route: '/objects',
    })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    await wrapper.find('.mwnf-facet__checkbox').setValue(true)
    await settle(() => router.currentRoute.value.query.epm === '1')
    expect(router.currentRoute.value.query.epm).toBe('1')
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

  it("hands a related block of the site's own the rows and the records outside the package", async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec, id: 'o1' },
      slots: { related: '<template #related="{ records, outside }"><p class="own-related">{{ records.map((r) => r.name).join("+") }} / {{ outside.length }} outside</p></template>' },
      route: '/objects/o1',
    })
    await settle(() => wrapper.text().includes('Prepared by'))
    // The fixture relates o1 to a record it does not carry, as a gallery does.
    expect(wrapper.find('.own-related').text()).toBe('Mosque lamp / 1 outside')
    expect(wrapper.find('.mwnf-related').exists()).toBe(false)
  })

  it("gives a header of the site's own the record's languages and the switch", async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec, id: 'o1' },
      slots: { header: '<template #header="{ languages, select, text }"><p class="own-header">{{ text.name }} in {{ languages.map((l) => l.code).join("+") }}</p><button class="own-switch" @click="select(\'fr\')">fr</button></template>' },
      route: '/objects/o1',
    })
    await settle(() => wrapper.text().includes('Prepared by'))
    expect(wrapper.find('.own-header').text()).toContain('in en+fr')
    await wrapper.find('.own-switch').trigger('click')
    await settle(() => wrapper.find('.own-header').text().includes('Bol'))
    expect(wrapper.find('.own-header').text()).toContain('Bol glaçuré')
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

// LinkListView: groups of categorized links
describe('LinkListView', () => {
  it('renders title, grouped links with notes, and back link', async () => {
    const { wrapper } = await mountView(LinkListView, {
      props: {
        spec: {
          title: 'site.further.reading',
          groups: [
            {
              heading: 'catalogue.facet.country',
              links: [
                { label: 'Egypt', href: '#/country/c-eg', note: 'Lower Nile' },
                { label: 'Syria', href: '#/country/c-sy' },
              ],
            },
          ],
          back: { label: 'record.action.backToResults', href: '#/results' },
        },
      },
    })
    expect(wrapper.find('.mwnf-link-list__title').text()).toBe('Further reading')
    expect(wrapper.find('.mwnf-link-list__heading').text()).toBe('Country')
    const links = wrapper.findAll('.mwnf-link-list__link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('Egypt')
    expect(links[0].attributes('href')).toBe('#/country/c-eg')
    expect(wrapper.find('.mwnf-link-list__note').text()).toBe('Lower Nile')
    expect(wrapper.find('.mwnf-link-list__back').text()).toContain('Back to results')
  })

  it('filters out groups with no links and shows empty state', async () => {
    const { wrapper } = await mountView(LinkListView, {
      props: {
        spec: {
          title: 'site.further.reading',
          groups: [{ heading: 'catalogue.facet.country', links: [] }],
          empty: 'core.action.empty',
        },
      },
    })
    expect(wrapper.find('.mwnf-link-list__empty').exists()).toBe(true)
    expect(wrapper.find('.mwnf-link-list__groups').exists()).toBe(false)
  })
})

// TextPageView: heading and markdown body with prose styling
describe('TextPageView', () => {
  it('renders heading, prose body with entry name, and back link', async () => {
    const { wrapper } = await mountView(TextPageView, {
      props: {
        spec: {
          heading: 'site.about.heading',
          body: 'site.about.body',
          back: { label: 'record.action.backToResults', href: '#/' },
        },
      },
    })
    expect(wrapper.find('.mwnf-text-page__heading').text()).toBe('About')
    // Body text is fetched from catalogue
    expect(wrapper.find('.mwnf-prose').exists()).toBe(true)
    expect(wrapper.find('.mwnf-text-page__back').text()).toContain('Back to results')
  })

  it('renders nothing without a heading and supports back: true for history back', async () => {
    const { wrapper } = await mountView(TextPageView, {
      props: {
        spec: {
          body: 'site.about.body',
          back: true,
        },
      },
    })
    expect(wrapper.find('.mwnf-text-page__heading').exists()).toBe(false)
    expect(wrapper.find('.mwnf-text-page__back').exists()).toBe(true)
  })
})

describe('EssayView', () => {
  // The fixture tree (`test-tree-root`): theme-a (page-a1[o1], page-a2[o2],
  // page-a3[]) and theme-b (page-b1[o3]), with a third child (extra-a) that
  // is not a theme — `childType: ['theme', 'page']` holds every level to its
  // own type, the way sharinghistory's themes-and-chapters and DXA's
  // themes-and-subthemes both need.
  const spec = {
    tree: { purpose: 'test-tree-root', childType: ['theme', 'page'] },
    entity: 'objects',
    route: 'theme',
    glossary: true,
    items: { route: 'objects-detail' },
    panel: {},
    navigation: 'tree',
    breadcrumb: true,
    tabs: true,
  }

  it('renders the essay — the breadcrumb, the tabs, the quote, the glossary in the body, and the selected item panel', async () => {
    const { wrapper } = await mountView(EssayView, { props: { spec, id: 'page-a1' }, route: '/theme/page-a1' })
    await settle(() => wrapper.find('.mwnf-essay__quote').exists())

    expect(wrapper.find('h1').text()).toContain('Page A1')
    expect(wrapper.find('.mwnf-essay__quote').text()).toBe('An opening page.')
    // The description carries a glossary term with no `glossary_ids` column
    // of its own to read: `glossaryTermsForText` scans the whole glossary.
    expect(wrapper.find('.mwnf-essay__prose').html()).toContain('gloss-term')

    const crumbs = wrapper.findAll('.mwnf-essay__breadcrumb-link').map((c) => c.text())
    expect(crumbs).toEqual(['Test Tree Root', 'Theme A'])

    // page-a3's English title is the importer's synthesized "Page 999" — real
    // here, since this spec sets no `placeholder` rule to catch it.
    const tabs = wrapper.findAll('.mwnf-essay__tab').map((tab) => tab.text())
    expect(tabs).toEqual(['Page A1', 'Page A2', 'Page 999'])
    expect(wrapper.find('.mwnf-essay__tab--active').text()).toBe('Page A1')

    // The panel: page-a1's only item is o1, whose translation renders through
    // the same Markdown pipeline as everywhere else.
    expect(wrapper.find('.mwnf-essay__panel-name').html()).toContain('Glazed <em>bowl</em>')
    expect(wrapper.find('.mwnf-essay__panel-link').attributes('href')).toBe('/objects/o1')
  })

  it("crosses a branch boundary in 'tree' navigation and stays inside the parent in 'siblings'", async () => {
    const { wrapper: treeWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false }, id: 'page-a3' },
      route: '/theme/page-a3',
    })
    await settle(() => treeWrapper.find('.mwnf-essay__nav').exists())
    // theme-a's last page is followed by theme-b itself in the flattened
    // walk — decision D2: the walk crosses the branch "for free".
    expect(treeWrapper.find('.mwnf-essay__nav-link--next').attributes('href')).toBe('/theme/theme-b')

    const { wrapper: siblingsWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, navigation: 'siblings' }, id: 'page-a2' },
      route: '/theme/page-a2',
    })
    await settle(() => siblingsWrapper.find('.mwnf-essay__nav').exists())
    expect(siblingsWrapper.find('.mwnf-essay__nav-link--previous').attributes('href')).toBe('/theme/page-a1')
    expect(siblingsWrapper.find('.mwnf-essay__nav-link--next').attributes('href')).toBe('/theme/page-a3')

    const { wrapper: lastWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, navigation: 'siblings' }, id: 'page-a3' },
      route: '/theme/page-a3',
    })
    await settle(() => lastWrapper.find('.mwnf-essay__nav').exists())
    expect(lastWrapper.find('.mwnf-essay__nav-link--next').exists()).toBe(false)
  })

  it('falls back through the placeholder rule: a synthesized title in the record language, then English, then the internal name', async () => {
    const { wrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, placeholder: /^(Theme|Page) \d+$/ }, id: 'page-a3' },
      route: '/theme/page-a3',
    })
    // page-a3's only title, in English, is "Page 999" — synthesized, and
    // matched by the placeholder rule in both the record language and its
    // English fallback, so the heading falls back to the internal name.
    await settle(() => wrapper.find('h1').text().includes('Page A3'))
    expect(wrapper.find('h1').text()).toContain('Page A3 (unordered)')
  })

  it('renders essay only in about mode — no panel, no navigation', async () => {
    const { wrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, about: (node) => node.type === 'theme' }, id: 'theme-a' },
      route: '/theme/theme-a',
    })
    await settle(() => wrapper.find('.mwnf-essay__quote').exists())
    expect(wrapper.find('h1').text()).toContain('Theme A')
    expect(wrapper.find('.mwnf-essay__panel').exists()).toBe(false)
    expect(wrapper.find('.mwnf-essay__nav').exists()).toBe(false)
  })

  it('hands a slot the context — the node, the selected item and the items it was resolved from', async () => {
    const { wrapper } = await mountView(EssayView, {
      props: { spec, id: 'page-a1' },
      slots: { panel: '<template #panel="{ node, selected, items }"><p class="own-panel">{{ node.id }} / {{ selected.id }} / {{ items.length }}</p></template>' },
      route: '/theme/page-a1',
    })
    await settle(() => wrapper.find('.own-panel').exists())
    expect(wrapper.find('.own-panel').text()).toBe('page-a1 / o1 / 1')
    expect(wrapper.find('.mwnf-essay__panel').exists()).toBe(false)
  })
})

// The views are a promise to the websites' configurations: what is exported
// from `/views` is what `config.views` names.
describe('the views entry point', () => {
  it('exports the five views and no shell', async () => {
    const entry = await import('../src/views/index.js')
    expect(Object.keys(entry).sort()).toEqual(['CatalogueResultsView', 'EssayView', 'HomeView', 'LinkListView', 'RecordView', 'TextPageView'])
    vi.restoreAllMocks()
  })
})
