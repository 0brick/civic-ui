<script setup>
import { PageIntro } from 'civic-ui'
</script>

<template>
  <PageIntro
    kicker="Careers"
    title="Join the City of Nordholm"
    text="We're hiring across public works, IT, and administration. Browse open roles and find out what it's like to work for the city."
    :action="{ label: 'View open positions', href: '#' }"
  >
    <p>New postings are added every Monday: check back regularly or sign up for job alerts.</p>
  </PageIntro>
</template>
