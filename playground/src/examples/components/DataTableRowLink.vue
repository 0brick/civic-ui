<script setup>
import { DataTable } from 'civic-ui'

const columns = [
  { key: 'name', label: 'Ticket' },
  { key: 'owner', label: 'Owner' },
  { key: 'updated', label: 'Updated', align: 'right' }
]
const rows = [
  { id: 4471, name: 'Ticket #4471', owner: 'A. Berger', updated: '2026-09-10' },
  { id: 4472, name: 'Ticket #4472', owner: 'C. Nowak', updated: '2026-09-11' },
  { id: 4473, name: 'Ticket #4473', owner: 'A. Berger', updated: '2026-09-08' }
]
</script>

<template>
  <!-- The first cell becomes a real link (Tab + Enter), stretched over the row. -->
  <DataTable :columns="columns" :rows="rows" :row-link="(row) => `#ticket-${row.id}`" caption="Open tickets" />
</template>
