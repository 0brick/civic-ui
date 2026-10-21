<script setup>
import { AlertBanner } from 'civic-ui'
</script>

<template>
  <AlertBanner variant="neutral" :dismissible="false" fixed text="Nordholm Resident Portal">
    <template #icon>
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path
          d="M10 2.2l6.8 3v4.6c0 4.2-2.7 7.6-6.8 8.9-4.1-1.3-6.8-4.7-6.8-8.9V5.2l6.8-3z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linejoin="round"
        />
        <path d="M7 10l2.2 2.2L13.4 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </template>
  </AlertBanner>
</template>
