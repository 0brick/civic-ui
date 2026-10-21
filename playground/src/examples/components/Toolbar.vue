<script setup>
import { AppButton, SearchField, Toolbar } from 'civic-ui'
</script>

<template>
  <Toolbar>
    <template #start>
      <SearchField size="sm" placeholder="Filter items…" />
    </template>
    <template #end>
      <AppButton variant="primary" size="sm">New item</AppButton>
    </template>
  </Toolbar>
</template>
