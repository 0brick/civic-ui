<script setup>
import { ref } from 'vue'
import { Select } from 'civic-ui'

const department = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <Select
      v-model="department"
      label="Department"
      placeholder="Choose a department"
      required
      hint="Your request will be routed to this office."
      :options="[
        { value: 'building', label: 'Building Permits' },
        { value: 'waste', label: 'Waste Management' },
        { value: 'parks', label: 'Parks & Recreation' }
      ]"
    />
  </div>
</template>
