<script setup>
import { ref } from 'vue'
import { AppButton, ButtonGroup } from 'civic-ui'

const view = ref('list')
</script>

<template>
  <ButtonGroup vertical aria-label="Choose how to display nearby recycling points">
    <AppButton :variant="view === 'list' ? 'primary' : 'outline'" @click="view = 'list'">List view</AppButton>
    <AppButton :variant="view === 'map' ? 'primary' : 'outline'" @click="view = 'map'">Map view</AppButton>
  </ButtonGroup>
</template>
