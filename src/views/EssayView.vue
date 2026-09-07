<script setup>
import { computed, ref, useSlots, watch } from 'vue'
import {
  NotFoundView, byId, entityRef, glossaryEntries, glossaryTermsForText, renderBlock, renderInline,
  renderPlain, useCollectionTree, useDataPackage, useGlossaryPopup, useI18n, useRecordLanguage,
} from '@metanull/viewer-core'
import GlossaryPopover from '../content/GlossaryPopover.vue'
import MediaGallery from '../content/MediaGallery.vue'
import RecordGrid from '../content/RecordGrid.vue'
import SmartLink from '../content/SmartLink.vue'

// The essay page, composed: seven sites' ExhibitionTheme / ArtIntroTheme /
// ExhibitionChapter / HistoricalBackgroundCountry / DXA's Theme, each a
// narrative over one node of a collection tree — a quote and a prose body,
// a thumbnail-driven picture panel or a plain item grid, previous/next over
// the tree, a tab strip of sibling pages, a breadcrumb, an about mode for a
// tree's own introduction page. The engine is viewer-core's
// `useCollectionTree`; the parts are the content components; what a website
// declares is a spec, as route props:
//
//   {
//     tree: useCollectionTree(...) result                       // built by the site, or:
//         | { purpose: 'exhibitions-root', childType?, entity?, order? }
//         | { rootId, childType?, entity?, order? }
//         | { themes: true | 'themes', childType? },             // a themes.json package
//     entity: 'items',                       // the tree's items
//     route: 'theme' | (node, ctx) => (to | href),   // a node's own page
//     heading: (ctx) => inline HTML,         // default: the node's own title
//     placeholder: /^(Theme|Page) \d+$/,     // a synthesized title, treated as missing
//     quote: 'quote' | false,                // field of the node's translation
//     body: 'description' | false,           // field of the node's translation
//     glossary: true | false,                // highlight glossary terms in quote + body
//     items: {
//       of: (node) => [ids],                 // default: the node's own items/item_ids/pictures
//       caption: (item, node, ctx) => ({ name?, image?, imageAlt? }),  // merged over the default
//       route: 'item' | (item, ctx) => (to | href),
//     },
//     panel: { variants: (item, ctx) => [{ url, alt, caption }], fields: (item, node, ctx) => [{ label, value }] } | false,
//     navigation: 'tree' | 'siblings' | false,   // decision D2: 'tree' crosses a branch boundary, 'siblings' stays inside
//     breadcrumb: true | false,
//     tabs: true | false,                    // the strip of sibling pages
//     about: (node) => boolean,              // a node rendered as an about page: essay only
//     numbering: 'roman' | 'decimal' | false,
//     previous, next, backTo, inThisTheme, seeAll,  // entry names, overriding the defaults below
//   }
//
// Texts are entry names, resolved through `t`: `previous`/`next` default to
// `exhibition.theme.previous`/`.next`, `backTo` to `record.action.backToResults`,
// `inThisTheme` to `exhibition.theme.inThisTheme`, `seeAll` to
// `exhibition.theme.seeAllInTheme`. Slots — `header`, `before-body`,
// `after-body`, `panel`, `thumbnails`, `aside`, `justifications`,
// `navigation`, `after` — each receive `{ node, text, language, tree, items,
// selected, select, breadcrumb, previous, next, t, tr }`. A website whose
// page is not this shape writes its own component on the same content
// components.
//
// Not every one of the seven pages fits the same slot: islamicart/baroqueart's
// multi-image "detail" selector is `panel.variants`; sharinghistory's dual
// curator/partner justifications are the `justifications` slot (the default
// panel shows none); its chapters' see-also/further-reading blocks are
// `after-body`; DXA's related-works toggle and its picture-to-parent
// indirection are `items.of`/`items.caption` plus the `thumbnails` slot for
// the toggle itself, which is unique to that family.

const props = defineProps({
  spec: { type: Object, required: true },
  id: { type: String, required: true },
})

const { t } = useI18n()
const pkg = useDataPackage()
const slots = useSlots()

function isBuiltTree(value) {
  return Boolean(value) && typeof value.walk === 'function' && typeof value.children === 'function'
}
function themesEntity(value) {
  return typeof value === 'string' ? value : 'themes'
}

const entity = props.spec.entity ?? 'items'
const treeSpec = props.spec.tree
const treeEntity = treeSpec?.entity ?? (treeSpec?.themes ? themesEntity(treeSpec.themes) : 'collections')
const tree = isBuiltTree(treeSpec)
  ? treeSpec
  : treeSpec?.themes
    ? useCollectionTree({ source: 'themes', entity: treeEntity, childType: treeSpec.childType })
    : useCollectionTree({
        purpose: treeSpec?.purpose,
        rootId: treeSpec?.rootId,
        childType: treeSpec?.childType,
        entity: treeEntity,
        order: treeSpec?.order,
      })
const treeRecords = entityRef(treeEntity)
const loaded = computed(() => treeRecords.value !== null)

const spec = computed(() => props.spec)
const node = computed(() => tree.byId.value.get(props.id) ?? null)
const parent = computed(() => tree.parents(props.id).at(-1) ?? null)
const siblings = computed(() => {
  if (parent.value) return tree.children(parent.value.id)
  const root = tree.root.value
  return root ? tree.children(root.id) : []
})
const siblingIndex = computed(() => siblings.value.findIndex((n) => n.id === props.id))

const navMode = computed(() => spec.value.navigation || false)
const previousNode = computed(() => {
  if (navMode.value === 'siblings') return siblingIndex.value > 0 ? siblings.value[siblingIndex.value - 1] : null
  if (navMode.value === 'tree') return tree.previous(props.id)
  return null
})
const nextNode = computed(() => {
  if (navMode.value === 'siblings') {
    return siblingIndex.value !== -1 && siblingIndex.value < siblings.value.length - 1 ? siblings.value[siblingIndex.value + 1] : null
  }
  if (navMode.value === 'tree') return tree.next(props.id)
  return null
})

// ── Language and the node's own translation ─────────────────────────────────

// `select` in the slot context picks the panel's item, pairing with
// `selected` — the tree node carries no language switch of its own in this
// context (unlike `RecordView`, which exposes one item's languages).
const { language, dir } = useRecordLanguage(node, { entity: treeEntity })
const text = computed(() => (node.value ? pkg.tr(treeEntity, node.value.id, language.value, 'en') : {}))

const ready = ref(false)
watch(
  () => [node.value?.id, language.value],
  async () => {
    ready.value = false
    if (!node.value) {
      ready.value = true
      return
    }
    const langs = language.value === 'en' ? ['en'] : [language.value, 'en']
    await Promise.all([treeEntity, entity].flatMap((name) => langs.map((code) => pkg.loadTranslations(name, code))))
    ready.value = true
  },
  { immediate: true },
)

function resolveTitle(n) {
  if (!n) return ''
  const placeholder = spec.value.placeholder
  const isPlaceholder = (value) => Boolean(value) && Boolean(placeholder) && placeholder.test(value)
  const own = pkg.tr(treeEntity, n.id, language.value, 'en')
  if (own.title && !isPlaceholder(own.title)) return own.title
  const en = pkg.tr(treeEntity, n.id, 'en').title
  if (en && !isPlaceholder(en)) return en
  return n.internal_name ?? n.id
}

// ── The base context: what a spec function reads, before items are resolved ─

const baseCtx = computed(() => ({
  node: node.value,
  text: text.value,
  language: language.value,
  tree,
  select,
  t,
  tr: (name, recId) => pkg.tr(name, recId, language.value, 'en'),
}))

// ── Quote, body and glossary ─────────────────────────────────────────────────

const quoteField = computed(() => (spec.value.quote === false ? '' : spec.value.quote ?? 'quote'))
const bodyField = computed(() => (spec.value.body === false ? '' : spec.value.body ?? 'description'))

const glossaryTerms = computed(() => {
  if (!spec.value.glossary || !node.value) return []
  const parts = [quoteField.value && text.value[quoteField.value], bodyField.value && text.value[bodyField.value]].filter(Boolean)
  return glossaryTermsForText(parts.join('\n\n'), language.value)
})
const glossaryList = computed(() => glossaryEntries(glossaryTerms.value))
const { active, onClick, close } = useGlossaryPopup(glossaryTerms)
const activeHtml = computed(() => (active.value ? renderBlock(active.value.definition, { breaks: true }) : ''))

const titleHtml = computed(() => {
  if (!node.value) return ''
  if (spec.value.heading) return spec.value.heading(baseCtx.value)
  return renderInline(String(resolveTitle(node.value)), { glossary: glossaryList.value })
})
const quoteHtml = computed(() => {
  const value = quoteField.value && text.value[quoteField.value]
  return value ? renderInline(String(value), { glossary: glossaryList.value }) : ''
})
const bodyHtml = computed(() => {
  const value = bodyField.value && text.value[bodyField.value]
  return value ? renderBlock(String(value), { breaks: true, glossary: glossaryList.value }) : ''
})

const isAbout = computed(() => Boolean(node.value && spec.value.about?.(node.value)))

// ── Numbering ─────────────────────────────────────────────────────────────

const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
function toRoman(num) {
  let n = num
  let out = ''
  for (const [value, symbol] of ROMAN) {
    while (n >= value) {
      out += symbol
      n -= value
    }
  }
  return out
}
const numberLabel = computed(() => {
  const mode = spec.value.numbering
  if (!mode || !node.value) return ''
  const list = siblings.value.length ? siblings.value : [node.value]
  const index = list.findIndex((n) => n.id === props.id)
  const n = index >= 0 ? index + 1 : 1
  return mode === 'roman' ? toRoman(n) : String(n)
})

// ── Items ───────────────────────────────────────────────────────────────────

function defaultItemIds(n) {
  if (!n) return []
  if (Array.isArray(n.items)) return n.items.map((entry) => (entry && typeof entry === 'object' ? entry.id : entry)).filter((v) => v != null)
  if (Array.isArray(n.item_ids)) return n.item_ids.filter((v) => v != null)
  if (Array.isArray(n.pictures)) return n.pictures.map((picture) => picture?.picture_item_id).filter((v) => v != null)
  return []
}

const itemIndex = byId(entity)
const itemIds = computed(() => {
  const of = spec.value.items?.of ?? defaultItemIds
  return node.value ? of(node.value, baseCtx.value) : []
})
const itemRecords = computed(() => itemIds.value.map((itemId) => itemIndex.value.get(itemId)).filter(Boolean))

const selectedId = ref(null)
watch(itemRecords, (list) => {
  if (!list.some((item) => item.id === selectedId.value)) selectedId.value = list[0]?.id ?? null
}, { immediate: true })
const selected = computed(() => itemRecords.value.find((item) => item.id === selectedId.value) ?? itemRecords.value[0] ?? null)
function select(itemId) {
  selectedId.value = itemId
}

function itemTo(item) {
  const routeSpec = spec.value.items?.route
  if (!routeSpec || !item) return null
  return typeof routeSpec === 'function' ? routeSpec(item, baseCtx.value) : { name: routeSpec, params: { id: item.id } }
}
function nodeTo(n) {
  const routeSpec = spec.value.route
  if (!routeSpec || !n) return null
  return typeof routeSpec === 'function' ? routeSpec(n, baseCtx.value) : { name: routeSpec, params: { id: n.id } }
}

function defaultItemCaption(item) {
  if (!item) return null
  const own = pkg.tr(entity, item.id, language.value, 'en')
  const name = own.name ?? item.internal_name ?? item.id
  return {
    name: renderInline(String(name)),
    image: item.images?.[0]?.url ?? '',
    imageAlt: renderPlain(String(name)),
  }
}

const selectedCaption = computed(() => {
  const item = selected.value
  if (!item) return null
  const base = defaultItemCaption(item)
  const override = spec.value.items?.caption?.(item, node.value, baseCtx.value)
  return { ...base, ...override }
})

const hasPanel = computed(() => Boolean(spec.value.panel))

const panelImages = computed(() => {
  const item = selected.value
  if (!item) return []
  const caption = selectedCaption.value
  const primary = item.images?.[0]?.url ? [{ url: item.images[0].url, alt: caption?.imageAlt ?? '' }] : []
  const variants = spec.value.panel?.variants?.(item, baseCtx.value) ?? []
  return [...primary, ...variants]
})
const panelFields = computed(() => {
  const item = selected.value
  if (!item || !spec.value.panel?.fields) return []
  return spec.value.panel.fields(item, node.value, baseCtx.value) ?? []
})

const gridRecords = computed(() =>
  itemRecords.value.map((item) => {
    const caption = defaultItemCaption(item)
    return { id: item.id, image: caption.image, imageAlt: caption.imageAlt, name: caption.name, meta: [], to: itemTo(item) }
  }),
)

// ── Breadcrumb, tabs, texts ───────────────────────────────────────────────

const breadcrumbList = computed(() => (spec.value.breadcrumb && node.value ? tree.parents(props.id) : []))
const tabNodes = computed(() => (spec.value.tabs ? siblings.value : []))

const previousText = computed(() => spec.value.previous ?? 'exhibition.theme.previous')
const nextText = computed(() => spec.value.next ?? 'exhibition.theme.next')
const backToText = computed(() => spec.value.backTo ?? 'record.action.backToResults')
const inThisThemeText = computed(() => spec.value.inThisTheme ?? 'exhibition.theme.inThisTheme')
const seeAllText = computed(() => spec.value.seeAll ?? 'exhibition.theme.seeAllInTheme')

// ── The slot context ────────────────────────────────────────────────────────

const ctx = computed(() => ({
  ...baseCtx.value,
  items: itemRecords.value,
  selected: selected.value,
  breadcrumb: breadcrumbList.value,
  previous: previousNode.value,
  next: nextNode.value,
}))

const hasSide = computed(() => !isAbout.value && (hasPanel.value || itemRecords.value.length > 0 || Boolean(slots.aside)))
</script>

<template>
  <NotFoundView v-if="loaded && !node" />

  <article v-else-if="node" class="mwnf-essay" :class="{ 'mwnf-essay--about': isAbout }" :dir="dir || undefined" @click="onClick">
    <slot name="header" v-bind="ctx">
      <p v-if="breadcrumbList.length" class="mwnf-essay__breadcrumb">
        <span class="mwnf-essay__breadcrumb-label">{{ t(backToText) }}</span>
        <template v-for="crumb in breadcrumbList" :key="crumb.id">
          <SmartLink v-if="nodeTo(crumb)" :to="nodeTo(crumb)" class="mwnf-essay__breadcrumb-link">{{ resolveTitle(crumb) }}</SmartLink>
          <span v-else class="mwnf-essay__breadcrumb-link">{{ resolveTitle(crumb) }}</span>
        </template>
      </p>

      <div v-if="tabNodes.length > 1" class="mwnf-essay__tabs" role="tablist" :aria-label="t(inThisThemeText)">
        <SmartLink
          v-for="tab in tabNodes"
          :key="tab.id"
          :to="nodeTo(tab)"
          class="mwnf-essay__tab"
          :class="{ 'mwnf-essay__tab--active': tab.id === id }"
        >{{ resolveTitle(tab) }}</SmartLink>
      </div>

      <h1 class="mwnf-essay__title">
        <span v-if="numberLabel" class="mwnf-essay__number">{{ numberLabel }}</span>
        <span v-html="titleHtml"></span>
      </h1>
    </slot>

    <div class="mwnf-essay__body">
      <div class="mwnf-essay__main">
        <p v-if="!ready" class="mwnf-essay__status">{{ t('core.status.loading') }}</p>
        <p v-if="quoteHtml" class="mwnf-essay__quote" v-html="quoteHtml"></p>

        <slot name="before-body" v-bind="ctx" />

        <div v-if="bodyHtml" class="mwnf-essay__prose mwnf-sheet__block" v-html="bodyHtml"></div>

        <slot name="after-body" v-bind="ctx" />

        <slot v-if="!isAbout" name="justifications" v-bind="ctx" />

        <div v-if="!isAbout && navMode && (previousNode || nextNode)" class="mwnf-essay__nav">
          <slot name="navigation" v-bind="ctx">
            <SmartLink v-if="previousNode" :to="nodeTo(previousNode)" class="mwnf-essay__nav-link mwnf-essay__nav-link--previous">← {{ t(previousText) }}</SmartLink>
            <span v-else class="mwnf-essay__nav-spacer"></span>
            <SmartLink v-if="nextNode" :to="nodeTo(nextNode)" class="mwnf-essay__nav-link mwnf-essay__nav-link--next">{{ t(nextText) }} →</SmartLink>
          </slot>
        </div>
      </div>

      <div v-if="hasSide" class="mwnf-essay__side">
        <slot name="panel" v-bind="ctx">
          <div v-if="hasPanel && selectedCaption" class="mwnf-essay__panel">
            <MediaGallery :images="panelImages" />
            <h3 class="mwnf-essay__panel-name" v-html="selectedCaption.name"></h3>
            <p v-for="(field, index) in panelFields" :key="index" class="mwnf-essay__panel-field">
              <span v-if="field.label" class="mwnf-essay__panel-label">{{ field.label }}</span>
              <span v-html="field.value"></span>
            </p>
            <SmartLink v-if="itemTo(selected)" :to="itemTo(selected)" class="mwnf-essay__panel-link">{{ t(seeAllText) }} →</SmartLink>
          </div>
        </slot>

        <slot name="thumbnails" v-bind="ctx">
          <ul v-if="hasPanel && itemRecords.length > 1" class="mwnf-essay__thumbs">
            <li v-for="item in itemRecords" :key="item.id">
              <button
                type="button"
                class="mwnf-essay__thumb"
                :class="{ 'mwnf-essay__thumb--active': item.id === selected?.id }"
                @click="select(item.id)"
              >
                <img v-if="item.images?.[0]?.url" :src="item.images[0].url" alt="" loading="lazy" />
              </button>
            </li>
          </ul>
          <RecordGrid v-else-if="!hasPanel && gridRecords.length" :records="gridRecords" />
        </slot>

        <slot name="aside" v-bind="ctx" />
      </div>
    </div>

    <slot name="after" v-bind="ctx" />

    <GlossaryPopover :term="active" :html="activeHtml" :dir="dir" @close="close" />
  </article>

  <p v-else class="mwnf-essay__status">{{ t('core.status.loading') }}</p>
</template>
