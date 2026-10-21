<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <!-- A single contact card: role above the name, labelled email/phone,
       no avatar. -->
  <div style="max-width: 360px;">
    <Card
      layout="person"
      appearance="outlined"
      eyebrow="Citizens' Office"
      title="Anna Berger"
      email="buergerbuero.anna.berger@nordholm.example"
      phone="0049 30 1234 5678"
      avatar="none"
      show-labels
    />
  </div>
</template>
