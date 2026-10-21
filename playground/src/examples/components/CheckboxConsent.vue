<script setup>
import { ref } from 'vue'
import { Checkbox } from 'civic-ui'

const agreed = ref(false)
</script>

<template>
  <div style="max-width: 420px;">
    <Checkbox v-model="agreed" required>
      I have read the <a href="#">privacy policy</a> and agree to the processing of my data.
    </Checkbox>
  </div>
</template>
