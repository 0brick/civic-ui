<script setup>
import { ref } from 'vue'
import { Collapse } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <Collapse v-model="open" label="Show more details" style="max-width: 560px;">
    <p>Additional details, revealed by the Collapse component.</p>
  </Collapse>
</template>
