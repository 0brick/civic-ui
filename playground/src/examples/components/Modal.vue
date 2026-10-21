<script setup>
import { ref } from 'vue'
import { AppButton, Modal } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <AppButton variant="outline" @click="open = true">Open modal</AppButton>
  <Modal v-model="open" title="Confirm action">
    <p>Are you sure you want to continue? This action cannot be undone.</p>
    <template #footer="{ close }">
      <AppButton variant="ghost" @click="close">Cancel</AppButton>
      <AppButton variant="primary" @click="close">Confirm</AppButton>
    </template>
  </Modal>
</template>
