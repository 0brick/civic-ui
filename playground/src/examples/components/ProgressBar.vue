<script setup>
import { ProgressBar } from 'civic-ui'
</script>

<template>
  <div class="cui-stack" style="width: 100%; max-width: 420px;">
    <ProgressBar :value="72" label="Upload progress" show-value />
    <ProgressBar :value="40" variant="accent" label="Profile completion" striped />
  </div>
</template>
