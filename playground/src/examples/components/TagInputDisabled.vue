<script setup>
import { ref } from 'vue'
import { TagInput } from 'civic-ui'

const keywords = ref(['road-closure', 'district-4'])
</script>

<template>
  <div style="max-width: 420px;">
    <TagInput v-model="keywords" label="Submitted keywords" disabled />
  </div>
</template>
