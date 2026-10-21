<script setup>
// One example on its own, without the docs shell: the document DetailPage
// loads into an iframe for `isolated` registry entries (a page layout like
// AppShell brings its own <main>, which must not end up nested inside the
// docs page's <main>). Mirrors the parent page's color mode and palette
// (applyPalette() writes CSS vars inline on <html>), so the preview reskins
// along with the rest of the playground.
import { shallowRef, onMounted, onUnmounted } from 'vue'
import { findComponent } from '../registry/components'
import { findSection } from '../registry/sections'

const props = defineProps({
  kind: { type: String, required: true }, // 'components' | 'sections'
  slug: { type: String, required: true },
  example: { type: Number, default: 0 }
})

const entry = props.kind === 'sections' ? findSection(props.slug) : findComponent(props.slug)
const DemoComponent = shallowRef(null)
entry?.examples[props.example]?.demo().then((mod) => { DemoComponent.value = mod.default })

const parentRoot = window.parent !== window ? window.parent.document.documentElement : null
function mirrorParent() {
  const root = document.documentElement
  for (const name of ['style', 'data-cui-mode']) {
    const value = parentRoot.getAttribute(name)
    if (value === null) root.removeAttribute(name)
    else root.setAttribute(name, value)
  }
}
let observer = null
onMounted(() => {
  if (!parentRoot) return
  mirrorParent()
  observer = new MutationObserver(mirrorParent)
  observer.observe(parentRoot, { attributes: true, attributeFilter: ['style', 'data-cui-mode'] })
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <component :is="DemoComponent" v-if="DemoComponent" />
</template>
