<script setup>
import { AppButton, Popover } from 'civic-ui'
</script>

<template>
  <Popover title="More information">
    <template #trigger="{ open, panelId }">
      <AppButton variant="outline" :aria-expanded="String(open)" aria-haspopup="dialog" :aria-controls="panelId">Click me</AppButton>
    </template>
    <p>Rich popover content can go here, including links and buttons.</p>
  </Popover>
</template>
