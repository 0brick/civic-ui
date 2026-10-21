<script setup>
import { ref } from 'vue'
import { ListSection } from 'civic-ui'
import mobility from '../../assets/photos/mobility.jpg'
import school from '../../assets/photos/school.jpg'

const page = ref(1)
</script>

<template>
  <ListSection
    v-model:page="page"
    eyebrow="City Hall"
    title="Latest news"
    :total-pages="4"
    :items="[
      { date: 'Sep 8, 2026', category: 'City Council', title: 'Council approves expansion of the bike lane network', excerpt: 'By 2028, 40 additional kilometers of bike lanes will reach every district.', image: mobility, href: '#' },
      { date: 'Aug 29, 2026', category: 'Education', title: 'New childcare center opens in Ostpark', excerpt: 'The facility offers space for 90 children and opens with the new school year.', image: school, href: '#' }
    ]"
  />
</template>
