<script setup>
import { ref } from 'vue'
import { Radio } from 'civic-ui'

const slot = ref('10:00')
</script>

<template>
  <div class="cui-cluster">
    <Radio v-model="slot" value="09:00" name="appointment-slot" label="09:00 (booked)" disabled />
    <Radio v-model="slot" value="10:00" name="appointment-slot" label="10:00" />
    <Radio v-model="slot" value="11:00" name="appointment-slot" label="11:00" />
  </div>
</template>
