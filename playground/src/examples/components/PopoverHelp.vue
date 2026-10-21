<script setup>
import { Popover } from 'civic-ui'
</script>

<template>
  <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
    <span style="font-weight: 600;">Tax identification number</span>
    <Popover title="Where do I find this?" placement="right">
      <template #trigger="{ open, panelId }">
        <button
          type="button"
          class="cui-popover-help-trigger"
          :aria-expanded="String(open)"
          aria-haspopup="dialog"
          :aria-controls="panelId"
          aria-label="Help: where to find your tax identification number"
        >?</button>
      </template>
      <p>Your 11-digit tax ID is printed on your income tax assessment notice and on any letter from your local tax office.</p>
    </Popover>
  </p>
</template>

<style scoped>
.cui-popover-help-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  border: 1.5px solid var(--cui-border);
  border-radius: 50%;
  background: var(--cui-bg-subtle);
  font-weight: 700;
  cursor: pointer;
}
</style>
