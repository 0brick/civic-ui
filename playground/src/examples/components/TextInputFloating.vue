<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const email = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <TextInput v-model="email" floating label="Email address" type="email" />
  </div>
</template>
