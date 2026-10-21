<script setup>
import { ref } from 'vue'
import { Pagination } from 'civic-ui'

const page = ref(58)
</script>

<template>
  <Pagination v-model="page" :total="124" :sibling-count="2" />
</template>
