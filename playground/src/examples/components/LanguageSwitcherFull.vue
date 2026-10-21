<script setup>
import { LanguageSwitcher } from 'civic-ui'
</script>

<template>
  <LanguageSwitcher
    :languages="[
      { code: 'de', label: 'DE', href: '#' },
      { code: 'en', label: 'EN', href: '#' },
      { code: 'fr', href: '#' },
      { code: 'pl', href: '#' }
    ]"
    current="de"
  />
</template>
