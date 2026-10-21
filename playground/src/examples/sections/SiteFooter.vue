<script setup>
import { SiteFooter } from 'civic-ui'
</script>

<template>
  <SiteFooter
    collapsible
    :columns="[
      { title: 'Services', links: [{ label: 'Resident Services', href: '#' }, { label: 'Forms', href: '#' }] },
      { title: 'Living in Nordholm', links: [{ label: 'Mobility', href: '#' }, { label: 'Environment', href: '#' }] },
      { title: 'City Hall', links: [{ label: 'City Council', href: '#' }, { label: 'Press', href: '#' }] }
    ]"
    :legal-links="[{ label: 'Imprint', href: '#' }, { label: 'Privacy', href: '#' }, { label: 'Accessibility', href: '#' }]"
    copyright="© 2026 City of Nordholm (sample data)."
  >
    <template #brand>
      <p><strong>City of Nordholm</strong></p>
      <p>A fictional sample city used to demonstrate the Civic UI sections.</p>
    </template>
  </SiteFooter>
</template>
