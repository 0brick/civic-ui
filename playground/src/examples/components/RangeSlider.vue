<script setup>
import { ref } from 'vue'
import { RangeSlider } from 'civic-ui'

const volume = ref(40)
</script>

<template>
  <div style="max-width: 360px;">
    <RangeSlider v-model="volume" label="Volume" :min="0" :max="100" />
  </div>
</template>
