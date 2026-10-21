<script setup>
import { ref } from 'vue'
import { Switch } from 'civic-ui'

const notifications = ref(true)
</script>

<template>
  <Switch v-model="notifications" label="Email notifications" />
</template>
