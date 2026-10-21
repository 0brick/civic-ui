<script setup>
import { Tabs } from 'civic-ui'
</script>

<template>
  <Tabs :tabs="[{ id: 'overview', label: 'Overview' }, { id: 'details', label: 'Details' }, { id: 'docs', label: 'Documents' }]" style="max-width: 480px;">
    <template #overview>Overview content goes here.</template>
    <template #details>Detail content goes here.</template>
    <template #docs>Document content goes here.</template>
  </Tabs>
</template>
