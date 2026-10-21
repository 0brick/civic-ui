<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const message = ref('')
</script>

<template>
  <div style="max-width: 420px;">
    <TextInput v-model="message" multiline label="Message" placeholder="Your message" />
  </div>
</template>
