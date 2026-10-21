<script setup>
import { StatusDot } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster">
    <StatusDot status="online" label="Online" />
    <StatusDot status="busy" label="Busy" pulse />
    <StatusDot status="away" label="Away" />
    <StatusDot status="offline" label="Offline" />
  </div>
</template>
