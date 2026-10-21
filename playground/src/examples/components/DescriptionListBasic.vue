<script setup>
import { DescriptionList } from 'civic-ui'

const facts = [
  { term: 'Founded', value: '1998' },
  { term: 'Members', value: '214' },
  { term: 'Registered office', value: 'Nordholm' },
  { term: 'Website', value: 'example.org', href: 'https://example.org', newTab: true }
]
</script>

<template>
  <DescriptionList :items="facts" />
</template>
