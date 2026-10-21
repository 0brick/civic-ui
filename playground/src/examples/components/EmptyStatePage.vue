<script setup>
import { EmptyState } from 'civic-ui'
</script>

<template>
  <EmptyState
    size="page"
    :heading-level="1"
    icon="error"
    title="Page not found"
    text="The page may have moved or no longer exists."
    :action="{ label: 'Back to the home page', href: '#' }"
  />
</template>
