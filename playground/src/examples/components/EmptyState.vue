<script setup>
import { AppButton, EmptyState } from 'civic-ui'
</script>

<template>
  <div style="border: 1px solid var(--cui-border); border-radius: var(--cui-radius-md);">
    <EmptyState title="No results" text="Adjust your filters or reset the search.">
      <AppButton variant="outline" size="sm">Reset filters</AppButton>
    </EmptyState>
  </div>
</template>
