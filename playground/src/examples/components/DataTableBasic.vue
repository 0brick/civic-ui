<script setup>
import { DataTable } from 'civic-ui'

const columns = [
  { key: 'name', label: 'Ticket' },
  { key: 'owner', label: 'Owner' }
]
const rows = [
  { id: 1, name: 'Ticket #4471', owner: 'A. Berger' },
  { id: 2, name: 'Ticket #4472', owner: 'C. Nowak' }
]
</script>

<template>
  <DataTable :columns="columns" :rows="rows" />
</template>
