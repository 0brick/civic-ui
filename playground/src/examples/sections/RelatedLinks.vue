<script setup>
import { RelatedLinks } from 'civic-ui'
</script>

<template>
  <div class="cui-container" style="padding-block: var(--cui-space-6);">
    <RelatedLinks
      title="More on this topic"
      :links="[
        { label: 'Resident Participation', href: '#', text: 'How you can help shape city projects' },
        { label: 'Urban Development Plan', href: '#', text: 'The guidelines for Nordholm through 2035' }
      ]"
    />
  </div>
</template>
