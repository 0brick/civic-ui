<script setup>
import { ref } from 'vue'
import { AppButton, Sidebar } from 'civic-ui'

const icon =
  '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 8h14" stroke="currentColor" stroke-width="1.6"/></svg>'

const items = [
  { label: 'Overview', icon, active: true, href: '#' },
  { label: 'Tickets', icon, href: '#' },
  { label: 'Reports', icon, href: '#' },
  { label: 'Settings', icon, href: '#' }
]

const collapsed = ref(false)
</script>

<template>
  <div style="height: 340px; border: 1px solid var(--cui-border); border-radius: var(--cui-radius-md); overflow: hidden; display: flex;">
    <Sidebar :items="items" :collapsed="collapsed">
      <template #header><strong>Example App</strong></template>
      <template #footer>
        <AppButton variant="ghost" size="sm" block @click="collapsed = !collapsed">
          {{ collapsed ? 'Expand' : 'Collapse' }}
        </AppButton>
      </template>
    </Sidebar>
  </div>
</template>
