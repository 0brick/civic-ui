<script setup>
import { LanguageSwitcher, TopBar } from 'civic-ui'
</script>

<template>
  <TopBar :links="[{ label: 'Accessibility', href: '#' }, { label: 'Press', href: '#' }]">
    <LanguageSwitcher :languages="[{ code: 'en', label: 'EN' }, { code: 'de', label: 'DE', href: '#' }]" current="en" />
  </TopBar>
</template>
