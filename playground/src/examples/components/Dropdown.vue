<script setup>
import { AppButton, Dropdown } from 'civic-ui'
</script>

<template>
  <Dropdown>
    <template #trigger><AppButton variant="outline">Options <span aria-hidden="true">▾</span></AppButton></template>
    <a href="#">Edit</a>
    <a href="#">Duplicate</a>
    <button type="button">Delete</button>
  </Dropdown>
</template>
