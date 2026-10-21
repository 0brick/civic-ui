<script setup>
import { ref } from 'vue'
import { AppButton, Modal } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <AppButton variant="outline" @click="open = true">Open filters</AppButton>
  <Modal v-model="open" placement="end" title="Filters">
    <p>Offcanvas-style content: filters, a shopping cart, or a secondary menu.</p>
  </Modal>
</template>
