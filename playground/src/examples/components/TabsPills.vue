<script setup>
import { Tabs } from 'civic-ui'
</script>

<template>
  <Tabs
    :tabs="[
      { id: 'open', label: 'Open' },
      { id: 'closed', label: 'Closed' },
      { id: 'archived', label: 'Archived', disabled: true }
    ]"
    pills
    fill
    style="max-width: 480px;"
  >
    <template #open>3 requests are currently open and awaiting review.</template>
    <template #closed>12 requests were closed this month.</template>
  </Tabs>
</template>
