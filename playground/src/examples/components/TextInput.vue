<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const email = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <TextInput v-model="email" label="Email" type="email" placeholder="you@example.com" hint="We will never share this." />
  </div>
</template>
