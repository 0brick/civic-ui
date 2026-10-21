<script setup>
import { StepsSection } from 'civic-ui'
</script>

<template>
  <StepsSection
    layout="grid"
    eyebrow="Benefits"
    title="Why work for the city"
    :steps="[
      { title: 'Flexible hours', text: 'Flextime and remote work by arrangement.' },
      { title: 'Retirement plan', text: 'Employer-funded pension, standard across public service.' },
      { title: 'Learning budget', text: 'A personal training allowance, renewed every year.' },
      { title: 'Transit pass', text: 'A subsidized public transit pass for every employee.' },
      { title: 'Family friendly', text: 'On-site childcare spots and flexible parental leave.' },
      { title: 'Wellness programs', text: 'Company sports, checkups, and an annual wellness day.' }
    ]"
  />
</template>
