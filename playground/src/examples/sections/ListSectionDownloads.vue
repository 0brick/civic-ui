<script setup>
import { ListSection } from 'civic-ui'
</script>

<template>
  <ListSection
    item-type="download"
    eyebrow="Service"
    title="Forms & fact sheets"
    :items="[
      { title: 'Resident Parking Permit Application', fileType: 'PDF', fileSize: '180 KB', href: '#' },
      { title: 'Business Registration', fileType: 'PDF', fileSize: '240 KB', href: '#' },
      { title: 'Privacy Notice: Online Applications', fileType: 'PDF', fileSize: '95 KB', href: '#' }
    ]"
  />
</template>
