<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const caseNumber = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <TextInput
      v-model="caseNumber"
      label="Case number"
      required
      error="Enter the case number shown on your notice."
    />
  </div>
</template>
