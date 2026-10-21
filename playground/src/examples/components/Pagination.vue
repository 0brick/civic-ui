<script setup>
import { ref } from 'vue'
import { Pagination } from 'civic-ui'

const page = ref(3)
</script>

<template>
  <Pagination v-model="page" :total="12" />
</template>
