<script setup>
import { SiteFooter } from 'civic-ui'
</script>

<template>
  <!-- A light footer theme with the built-in contact block: address lines,
       a mailto: and a tel: link under the brand slot. -->
  <SiteFooter
    background="light"
    :address="['Town Hall Square 1', '12345 Nordholm']"
    email="buergerbuero@nordholm.example"
    phone="+49 30 1234 5678"
    :columns="[
      { title: 'Services', links: [{ label: 'Resident Services', href: '#' }, { label: 'Forms & Permits', href: '#' }] },
      { title: 'City Hall', links: [{ label: 'Opening hours', href: '#' }, { label: 'Departments', href: '#' }] }
    ]"
    :legal-links="[{ label: 'Imprint', href: '#' }, { label: 'Privacy', href: '#' }]"
    copyright="© 2026 City of Nordholm (sample data)."
  >
    <template #brand><strong>City of Nordholm</strong></template>
  </SiteFooter>
</template>
