<script setup>
import { AppButton, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <div class="cui-cluster">
    <AppButton variant="outline" @click="toast.info('This is an info toast.')">Show info toast</AppButton>
    <AppButton variant="outline" @click="toast.success('Saved successfully.', { title: 'Success' })">Show success toast</AppButton>
    <AppButton variant="outline" @click="toast.danger('Your changes could not be saved.', { title: 'Error' })">Show error toast</AppButton>
  </div>
</template>
