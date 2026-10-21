<script setup>
import { ref, computed } from 'vue'
import { DataTable, StatusDot } from 'civic-ui'

const columns = [
  { key: 'name', label: 'Ticket', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'updated', label: 'Updated', sortable: true, align: 'right' }
]
const rows = ref([
  { id: 1, name: 'Ticket #4471', status: 'open', owner: 'A. Berger', updated: '2026-09-10' },
  { id: 2, name: 'Ticket #4472', status: 'in review', owner: 'C. Nowak', updated: '2026-09-11' },
  { id: 3, name: 'Ticket #4473', status: 'closed', owner: 'A. Berger', updated: '2026-09-08' },
  { id: 4, name: 'Ticket #4474', status: 'open', owner: 'M. Lindqvist', updated: '2026-09-12' }
])
const selected = ref([])
const sortBy = ref('updated')
const sortDir = ref('desc')

// DataTable is a display-only component: it emits sort requests but leaves
// re-ordering to the consumer (same convention as its selection/pagination
// props), so the demo has to actually sort the rows it feeds back in.
const sortedRows = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...rows.value].sort((a, b) => (a[sortBy.value] < b[sortBy.value] ? -1 : a[sortBy.value] > b[sortBy.value] ? 1 : 0) * dir)
})
</script>

<template>
  <DataTable
    v-model:selected="selected"
    v-model:sort-by="sortBy"
    v-model:sort-dir="sortDir"
    :columns="columns"
    :rows="sortedRows"
    selectable
    striped
  >
    <template #cell-status="{ value }">
      <StatusDot :status="value === 'open' ? 'warning' : value === 'closed' ? 'success' : 'neutral'" :label="value" />
    </template>
  </DataTable>
</template>
