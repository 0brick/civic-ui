<script setup>
import { Navbar } from 'civic-ui'

// Data-driven nav: an item with `children` becomes a "Services ▾" dropdown on
// desktop and an expanded group in the mobile drawer (resize the preview
// below 900px and open the menu).
const items = [
  { label: 'Home', href: '#', active: true },
  {
    label: 'Services',
    children: [
      { label: 'Permits & licences', href: '#' },
      { label: 'Waste collection', href: '#' },
      { label: 'Parking', href: '#' }
    ]
  },
  { label: 'News', href: '#' },
  { label: 'Contact', href: '#' }
]
</script>

<template>
  <Navbar :sticky="false" :items="items">
    <template #brand><a href="#">Nordholm</a></template>
  </Navbar>
</template>
