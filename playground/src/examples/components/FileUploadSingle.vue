<script setup>
import { ref } from 'vue'
import { FileUpload } from 'civic-ui'

const file = ref([])
</script>

<template>
  <div style="max-width: 480px;">
    <FileUpload
      v-model="file"
      label="Proof of residence"
      hint="One file, PDF or image, max 10 MB"
      accept="application/pdf,image/*"
      :multiple="false"
    />
  </div>
</template>
