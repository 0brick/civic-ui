<script setup>
import { AppButton } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster">
    <AppButton variant="primary">Primary</AppButton>
    <AppButton variant="accent">Accent</AppButton>
    <AppButton variant="quaternary">Quaternary</AppButton>
    <AppButton variant="outline">Outline</AppButton>
    <AppButton variant="ghost">Ghost</AppButton>
    <AppButton variant="link">Link</AppButton>
    <AppButton variant="danger">Danger</AppButton>
    <AppButton variant="primary" loading>Loading</AppButton>
    <AppButton variant="primary" disabled>Disabled</AppButton>
  </div>
</template>
