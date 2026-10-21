<script setup>
import { InputGroup } from 'civic-ui'
</script>

<template>
  <div style="max-width: 360px;">
    <InputGroup label="Case reference">
      <template #prepend>AZ-</template>
      <template #default="{ id }">
        <input :id="id" type="text" placeholder="4471" />
      </template>
      <template #append>/2026</template>
    </InputGroup>
  </div>
</template>
