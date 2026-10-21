<script setup>
import { ref } from 'vue'
import { RangeSlider } from 'civic-ui'

const parks = ref(35)
const roads = ref(60)
</script>

<template>
  <div class="cui-stack" style="max-width: 360px;">
    <RangeSlider v-model="parks" label="Parks & Recreation budget share" :min="0" :max="100" :step="5" :value-text="(v) => `${v} %`" />
    <RangeSlider v-model="roads" label="Road Maintenance budget share" :min="0" :max="100" :step="5" :value-text="(v) => `${v} %`" />
  </div>
</template>
