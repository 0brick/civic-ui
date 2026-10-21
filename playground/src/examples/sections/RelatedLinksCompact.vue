<script setup>
import { RelatedLinks } from 'civic-ui'
</script>

<template>
  <div class="cui-container" style="padding-block: var(--cui-space-6);">
    <RelatedLinks
      :links="[
        { label: 'Waste Collection Schedule', href: '#' },
        { label: 'Report a Pothole', href: '#' },
        { label: 'Apply for a Building Permit', href: '#' },
        { label: 'Public Transit Map', href: '#' }
      ]"
    />
  </div>
</template>
