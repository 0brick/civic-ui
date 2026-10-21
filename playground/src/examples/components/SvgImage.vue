<script setup>
import { SvgImage } from 'civic-ui'
import crest from '../../assets/icons/city-crest.svg'

const backgrounds = [
  { label: 'White', bg: '#ffffff' },
  { label: 'Navy', bg: '#001d35' },
  { label: 'Gold', bg: '#ffed3e' },
  { label: 'Teal', bg: '#00606e' }
]
</script>

<template>
  <div class="cui-cluster">
    <div
      v-for="b in backgrounds"
      :key="b.label"
      :style="{ background: b.bg, padding: '2.4rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,.08)' }"
    >
      <SvgImage :src="crest" contrast="auto" height="56" :alt="`City crest on ${b.label.toLowerCase()}`" />
    </div>
  </div>
</template>
