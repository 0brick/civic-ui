<script setup>
import { ref } from 'vue'
import { TagInput } from 'civic-ui'

const tags = ref(['design-system', 'vue'])
</script>

<template>
  <div style="max-width: 420px;">
    <TagInput v-model="tags" label="Tags" />
  </div>
</template>
