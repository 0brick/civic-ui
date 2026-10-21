<script setup>
import { AppButton, SiteHeader } from 'civic-ui'
</script>

<template>
  <SiteHeader links-align="end">
    <template #brand><a href="#">City of Nordholm</a></template>
    <template #links>
      <a href="#">Services</a>
      <a href="#">City Hall</a>
      <a href="#">Contact</a>
    </template>
    <template #actions>
      <AppButton variant="accent" size="sm" href="#">Sign in</AppButton>
    </template>
  </SiteHeader>
</template>
