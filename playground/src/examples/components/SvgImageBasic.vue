<script setup>
import { SvgImage } from 'civic-ui'
import crest from '../../assets/icons/city-crest.svg'
</script>

<template>
  <p style="display: flex; align-items: center; gap: 0.8rem; font-size: 2rem; font-weight: 700; margin: 0">
    <SvgImage :src="crest" contrast="theme" />
    City of Nordholm
  </p>
</template>
