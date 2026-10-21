<script setup>
// Tells components slotted into a Navbar where they render: the desktop
// link row or the mobile drawer, without adding a DOM element (the
// navbar's direct-child link styles stay intact). Dropdown reads it to turn
// into an expanded link group in the drawer, and to take the nav-link
// typography in the desktop row.
import { provide } from 'vue'

const props = defineProps({
  mode: { type: String, required: true } // 'desktop' | 'mobile'
})

provide('cui-nav-context', props.mode)
</script>

<template>
  <slot />
</template>
