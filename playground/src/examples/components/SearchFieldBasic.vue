<script setup>
import { ref } from 'vue'
import { SearchField } from 'civic-ui'

const query = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <SearchField v-model="query" placeholder="Search this site…" />
  </div>
</template>
