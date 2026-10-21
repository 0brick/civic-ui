<script setup>
import { AppButton, ColorModeToggle, useColorMode } from 'civic-ui'

const { mode, resolved, setMode } = useColorMode()
</script>

<template>
  <div class="cui-stack">
    <div class="cui-cluster">
      <ColorModeToggle show-label />
      <AppButton size="sm" :variant="mode === 'auto' ? 'primary' : 'ghost'" @click="setMode('auto')">Follow system</AppButton>
    </div>
    <p style="margin: 0;">Chosen: <strong>{{ mode }}</strong> · showing: <strong>{{ resolved }}</strong></p>
  </div>
</template>
