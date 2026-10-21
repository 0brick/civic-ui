<script setup>
import { AppButton, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <AppButton @click="toast.push('Your request has been submitted.')">Show notification</AppButton>
</template>
