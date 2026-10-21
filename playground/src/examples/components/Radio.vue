<script setup>
import { ref } from 'vue'
import { Radio } from 'civic-ui'

const plan = ref('standard')
</script>

<template>
  <div class="cui-cluster">
    <Radio v-model="plan" value="basic" name="plan" label="Basic" />
    <Radio v-model="plan" value="standard" name="plan" label="Standard" />
    <Radio v-model="plan" value="pro" name="plan" label="Pro" />
  </div>
</template>
