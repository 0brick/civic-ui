<script setup>
import { Breadcrumb } from 'civic-ui'
</script>

<template>
  <Breadcrumb
    :items="[
      { label: 'Home', href: '#' },
      { label: 'Citizen Services', href: '#' },
      { label: 'Permits & Licenses', href: '#' },
      { label: 'Building Permits', href: '#' },
      { label: 'Application Status' }
    ]"
  />
</template>
