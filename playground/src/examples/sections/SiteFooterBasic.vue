<script setup>
import { SiteFooter } from 'civic-ui'
</script>

<template>
  <SiteFooter
    :columns="[{ title: 'Services', links: [{ label: 'Resident Services', href: '#' }, { label: 'Forms & Permits', href: '#' }] }]"
    copyright="© 2026 City of Nordholm (sample data)."
  />
</template>
