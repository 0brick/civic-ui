<script setup>
import { Dropdown } from 'civic-ui'
</script>

<template>
  <div style="display: inline-flex; padding: 1.2rem 1.6rem; border: 1px solid var(--cui-border); border-radius: var(--cui-radius-md); background: var(--cui-bg-subtle);">
    <Dropdown trigger-variant="chevron-label" label="Solutions">
      <a href="#">For Teams</a>
      <a href="#">For Agencies</a>
      <a href="#">For Enterprises</a>
    </Dropdown>
  </div>
</template>
