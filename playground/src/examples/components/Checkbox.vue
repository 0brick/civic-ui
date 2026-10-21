<script setup>
import { ref } from 'vue'
import { Checkbox } from 'civic-ui'

const agree = ref(false)
const selected = ref([])
</script>

<template>
  <div class="cui-stack" style="max-width: 360px;">
    <Checkbox v-model="agree" label="I agree to the terms of service" />
    <Checkbox v-model="selected" value="a" label="Option A" />
    <Checkbox v-model="selected" value="b" label="Option B" />
  </div>
</template>
