<script setup>
import { Breadcrumb } from 'civic-ui'
</script>

<template>
  <Breadcrumb
    :items="[
      { label: 'Home', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Application Process' }
    ]"
  />
</template>
