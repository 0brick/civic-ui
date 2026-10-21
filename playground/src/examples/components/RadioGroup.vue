<script setup>
import { ref } from 'vue'
import { RadioGroup } from 'civic-ui'

const contact = ref('mail')
</script>

<template>
  <RadioGroup
    v-model="contact"
    legend="How should we contact you?"
    :options="[
      { value: 'mail', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'post', label: 'Letter', disabled: true }
    ]"
    hint="We only use this for your request."
  />
</template>
