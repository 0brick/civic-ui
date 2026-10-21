<script setup>
import { ref } from 'vue'
import { FileUpload } from 'civic-ui'

const files = ref([])
</script>

<template>
  <div style="max-width: 480px;">
    <FileUpload v-model="files" label="Upload attachment" hint="PDF, max 10 MB" accept="application/pdf" />
  </div>
</template>
