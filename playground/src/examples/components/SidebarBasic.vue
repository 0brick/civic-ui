<script setup>
import { Sidebar } from 'civic-ui'

const items = [
  { label: 'Overview', active: true, href: '#' },
  { label: 'Tickets', href: '#' },
  { label: 'Reports', href: '#' },
  { label: 'Settings', href: '#' }
]
</script>

<template>
  <div style="height: 340px; border: 1px solid var(--cui-border); border-radius: var(--cui-radius-md); overflow: hidden; display: flex;">
    <Sidebar :items="items" />
  </div>
</template>
