<script setup>
import { ref } from 'vue'
import { AppButton, CloseButton } from 'civic-ui'

const visible = ref(true)
</script>

<template>
  <div class="cui-cluster" style="align-items: center;">
    <CloseButton v-if="visible" label="Dismiss this message" @click="visible = false" />
    <AppButton v-else variant="outline" size="sm" @click="visible = true">Show it again</AppButton>
  </div>
</template>
