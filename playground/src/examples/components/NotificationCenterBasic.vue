<script setup>
import { NotificationCenter } from 'civic-ui'

const items = [
  { id: 1, title: 'New ticket assigned', time: '5 min ago', read: false },
  { id: 2, title: 'Report ready', time: 'yesterday', read: true }
]
</script>

<template>
  <NotificationCenter :items="items" />
</template>
