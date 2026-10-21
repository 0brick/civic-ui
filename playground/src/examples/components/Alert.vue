<script setup>
import { Alert } from 'civic-ui'
</script>

<template>
  <div class="cui-stack">
    <Alert variant="info" title="Notice">This is an informational alert.</Alert>
    <Alert variant="success" dismissible>Your changes have been saved.</Alert>
    <Alert variant="warning">Please review the highlighted fields.</Alert>
    <Alert variant="danger">Something went wrong while submitting the form.</Alert>
  </div>
</template>
