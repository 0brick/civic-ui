<script setup>
import { InputGroup } from 'civic-ui'
</script>

<template>
  <div style="max-width: 360px;">
    <InputGroup label="Website">
      <template #prepend>https://</template>
      <template #default="{ id }">
        <input :id="id" type="text" placeholder="example.com" />
      </template>
    </InputGroup>
  </div>
</template>
