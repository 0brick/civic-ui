<script setup>
import { ListSection, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <ListSection
    item-type="job"
    eyebrow="Careers"
    title="Open positions"
    intro="Current openings across the city administration."
    :items="[
      { title: 'Resident Services Officer', department: 'Resident Services', location: 'Nordholm', type: 'Full-time', href: '#' },
      { title: 'IT Systems Administrator', department: 'Digital Services', location: 'Nordholm', type: 'Full-time', href: '#' },
      { title: 'Working Student, City Communications', department: 'Press & Communications', location: 'Nordholm', type: 'Part-time', href: '#' }
    ]"
    @search="(q) => toast.info(`Searching: ${q}`)"
  />
</template>
