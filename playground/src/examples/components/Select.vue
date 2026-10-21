<script setup>
import { ref } from 'vue'
import { Select } from 'civic-ui'

const country = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <Select v-model="country" label="Country" placeholder="Select a country" :options="['United States', 'Germany', 'Switzerland']" />
  </div>
</template>
