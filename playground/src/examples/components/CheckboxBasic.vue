<script setup>
import { ref } from 'vue'
import { Checkbox } from 'civic-ui'

const subscribed = ref(false)
</script>

<template>
  <Checkbox v-model="subscribed" label="Email me about service updates" />
</template>
