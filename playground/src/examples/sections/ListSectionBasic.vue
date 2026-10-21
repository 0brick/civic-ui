<script setup>
import { ListSection } from 'civic-ui'
</script>

<template>
  <ListSection
    title="Latest news"
    :items="[
      { title: 'Council approves expansion of the bike lane network', excerpt: 'By 2028, 40 additional kilometers of bike lanes will reach every district.', href: '#' },
      { title: 'New childcare center opens in Ostpark', excerpt: 'The facility offers space for 90 children and opens with the new school year.', href: '#' }
    ]"
  />
</template>
