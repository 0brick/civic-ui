<script setup>
import { AppButton, Select, SearchField, Toolbar } from 'civic-ui'
</script>

<template>
  <Toolbar>
    <template #start>
      <SearchField size="sm" placeholder="Search applications…" />
      <Select
        label="Status"
        :options="[{ value: '', label: 'All statuses' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]"
      />
    </template>
    <template #end>
      <AppButton variant="outline" size="sm">Export CSV</AppButton>
      <AppButton variant="primary" size="sm">New application</AppButton>
    </template>
  </Toolbar>
</template>
