<script setup>
import { EmptyState } from 'civic-ui'
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr)); gap: 1.6rem">
    <EmptyState icon="calendar" title="No upcoming events" />
    <EmptyState icon="search" title="No results" :action="{ label: 'All news', href: '#' }" />
    <EmptyState icon="document" title="No documents yet" />
    <EmptyState icon="error" title="Couldn't load the data" />
  </div>
</template>
