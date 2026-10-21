<script setup>
import { LanguageSwitcher } from 'civic-ui'
</script>

<template>
  <LanguageSwitcher :languages="[{ code: 'en', label: 'EN', href: '#' }, { code: 'de', label: 'DE', href: '#' }]" current="en" />
</template>
