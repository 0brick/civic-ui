<script setup>
import { ref } from 'vue'
import { Switch } from 'civic-ui'

const email = ref(true)
const sms = ref(false)
const push = ref(false)
</script>

<template>
  <div class="cui-stack" style="max-width: 360px;">
    <Switch v-model="email" label="Email notifications" />
    <Switch v-model="sms" label="SMS notifications" />
    <Switch v-model="push" label="Push notifications (no device registered)" disabled />
  </div>
</template>
