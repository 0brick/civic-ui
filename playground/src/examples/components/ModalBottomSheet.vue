<script setup>
import { ref } from 'vue'
import { AppButton, Modal } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <AppButton variant="outline" @click="open = true">Open bottom sheet</AppButton>
  <Modal v-model="open" placement="bottom" handle title="Quick actions">
    <p>A typical mobile pattern for a short list of actions.</p>
  </Modal>
</template>
