<script setup>
import { StatCard } from 'civic-ui'
</script>

<template>
  <div class="cui-grid cui-grid--2">
    <StatCard
      appearance="highlight"
      label="Donations for the new school"
      value="€9,000"
      :goal="15000"
      :current="9000"
      unit="€"
      color="secondary"
      :action="{ label: 'Donate now', href: '#' }"
    />
    <StatCard appearance="highlight" label="Membership fee" value="€20 / year" :action="{ label: 'Become a member', href: '#' }" />
  </div>
</template>
