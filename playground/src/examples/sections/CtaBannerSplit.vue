<script setup>
import { CtaBanner } from 'civic-ui'
</script>

<template>
  <!-- Two actions in the split layout on a dark band: the secondary outline
       button turns light automatically. -->
  <CtaBanner
    background="primary"
    layout="split"
    title="Become a sponsor"
    text="A school place costs 25 euros a month: every sponsorship makes a lasting difference."
    :action="{ label: 'Start a sponsorship', href: '#' }"
    :secondary-action="{ label: 'How it works', href: '#' }"
  />
</template>
