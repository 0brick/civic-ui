<script setup>
import { AppButton, Spinner } from 'civic-ui'
</script>

<template>
  <AppButton variant="primary" disabled>
    <Spinner size="sm" label="Submitting application" />
    Submitting…
  </AppButton>
</template>
