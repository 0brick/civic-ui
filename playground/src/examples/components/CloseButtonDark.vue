<script setup>
import { CloseButton } from 'civic-ui'
</script>

<template>
  <div style="background: var(--cui-color-navy); padding: var(--cui-space-4); border-radius: var(--cui-radius-md); display: flex; align-items: center; justify-content: space-between;">
    <span style="color: var(--cui-color-white); font-weight: 600;">Maintenance notice: online services unavailable Sunday 2-4am</span>
    <CloseButton label="Dismiss notice" dark />
  </div>
</template>
