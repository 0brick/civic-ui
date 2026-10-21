<script setup>
import { computed, ref } from 'vue'
import { AppButton, Radio, RadioGroup } from 'civic-ui'

const slot = ref(null)
const submitted = ref(false)
const error = computed(() => (submitted.value && !slot.value ? 'Choose a time slot.' : ''))
</script>

<template>
  <form class="cui-stack" novalidate @submit.prevent="submitted = true">
    <RadioGroup v-model="slot" legend="Time slot" required inline :error="error">
      <Radio value="09:00" label="09:00" />
      <Radio value="10:00" label="10:00" />
      <Radio value="11:00" label="11:00" />
    </RadioGroup>
    <div>
      <AppButton type="submit">Book</AppButton>
    </div>
  </form>
</template>
