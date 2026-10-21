<script setup>
// Renders one API reference table on a component/section doc page: props,
// events, or slots. Shape depends on `kind` so callers can pass plain
// {name, ...} rows without repeating column headers everywhere.
const props = defineProps({
  kind: { type: String, required: true }, // 'props' | 'events' | 'slots'
  rows: { type: Array, required: true }
})

const headers = {
  props: ['Prop', 'Type', 'Default', 'Notes'],
  events: ['Event', 'Payload', 'Notes'],
  slots: ['Slot', 'Notes']
}[props.kind]

const titles = { props: 'Props', events: 'Events', slots: 'Slots' }
</script>

<template>
  <div class="cui-api-table">
    <h3>{{ titles[kind] }}</h3>
    <div class="cui-api-table__scroll">
      <table>
        <thead>
          <tr>
            <th v-for="h in headers" :key="h">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name">
            <td><code>{{ row.name }}</code></td>
            <template v-if="kind === 'props'">
              <td class="cui-api-table__type">{{ row.type }}</td>
              <td><code v-if="row.default !== undefined">{{ row.default }}</code></td>
              <td>{{ row.notes }}</td>
            </template>
            <template v-else-if="kind === 'events'">
              <td class="cui-api-table__type">{{ row.payload }}</td>
              <td>{{ row.notes }}</td>
            </template>
            <template v-else>
              <td>{{ row.notes }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.cui-api-table + .cui-api-table {
  margin-top: var(--cui-space-5);
}

.cui-api-table h3 {
  font-size: 1.6rem;
  margin: 0 0 var(--cui-space-3);
}

.cui-api-table__scroll {
  overflow-x: auto;
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.3rem;
}

th,
td {
  text-align: left;
  padding: var(--cui-space-2) var(--cui-space-3);
  vertical-align: top;
  border-bottom: 1px solid var(--cui-border);
}

thead th {
  background: var(--cui-bg-subtle);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cui-text-muted);
  white-space: nowrap;
}

tbody tr:last-child td {
  border-bottom: none;
}

td code,
th code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.2rem;
  background: var(--cui-bg-subtle);
  padding: 0.1rem 0.5rem;
  border-radius: var(--cui-radius-sm);
  color: var(--cui-heading);
}

.cui-api-table__type {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.2rem;
  color: var(--cui-text-muted);
  white-space: nowrap;
}

</style>
