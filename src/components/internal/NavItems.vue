<script setup>
// Navbar's data-driven `items`: plain links, and items with `children`
// rendered as a chevron-label Dropdown (an expanded group in the drawer).
import Dropdown from '../navigation/Dropdown.vue'
import CuiLink from './CuiLink.vue'
import NewTabHint from './NewTabHint.vue'

defineProps({
  items: { type: Array, default: () => [] }, // [{ label, href?, newTab?, active?, children? }]
  linkTag: { type: [String, Object], default: null }
})
</script>

<template>
  <template v-for="item in items" :key="item.label">
    <Dropdown v-if="item.children && item.children.length" trigger-variant="chevron-label" :label="item.label">
      <CuiLink
        v-for="child in item.children"
        :key="child.label"
        :href="child.href"
        :new-tab="child.newTab"
        :tag="child.tag || linkTag"
        :aria-current="child.active ? 'page' : undefined"
      >
        {{ child.label }}<NewTabHint v-if="child.newTab" />
      </CuiLink>
    </Dropdown>
    <CuiLink
      v-else
      :href="item.href"
      :new-tab="item.newTab"
      :tag="item.tag || linkTag"
      :aria-current="item.active ? 'page' : undefined"
    >
      {{ item.label }}<NewTabHint v-if="item.newTab" />
    </CuiLink>
  </template>
</template>
