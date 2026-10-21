<script setup>
import { ref } from 'vue'
import { NotificationCenter } from 'civic-ui'

const items = ref([
  { id: 1, title: 'New ticket assigned', text: 'Ticket #4474 has been assigned to you.', time: '5 min ago', read: false },
  { id: 2, title: 'New comment', text: 'C. Nowak commented on ticket #4472.', time: '1 hour ago', read: false },
  { id: 3, title: 'Report ready', text: 'The weekly report has been generated.', time: 'yesterday', read: true }
])

function markRead(id) {
  const item = items.value.find((n) => n.id === id)
  if (item) item.read = true
}
function markAllRead() {
  items.value.forEach((n) => (n.read = true))
}
</script>

<template>
  <NotificationCenter :items="items" @mark-read="markRead" @mark-all-read="markAllRead" />
</template>
