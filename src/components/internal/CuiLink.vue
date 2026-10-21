<script setup>
// The one data-driven link element (see utils/links.js → resolveLink): the
// configured router link component for internal paths, a plain <a> with a
// sanitized href (and target/rel for `newTab`) for everything else. Class,
// aria-label and listeners fall through to the rendered element.
import { computed } from 'vue'
import { resolveLink } from '../../utils/links'

const props = defineProps({
  href: { type: String, default: null },
  newTab: { type: Boolean, default: false },
  tag: { type: [String, Object, Function], default: null },
  to: { type: [String, Object], default: null }
})

const link = computed(() => resolveLink(props.href, props.newTab, props.tag, props.to))
</script>

<template>
  <component :is="link.is" v-bind="link.attrs"><slot /></component>
</template>
