<script setup>
import { SearchField, useToast, ToastContainer } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <div style="max-width: 360px;">
    <SearchField placeholder="Search this site…" @search="(q) => toast.info(`Search: ${q}`)" />
  </div>
</template>
