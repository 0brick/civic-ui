<script setup>
import { Navbar } from 'civic-ui'
</script>

<template>
  <Navbar :sticky="false">
    <template #brand><a href="#">City of Elmshaven</a></template>
    <template #links>
      <a href="#">Services</a>
      <a href="#">Departments</a>
      <a href="#">Contact</a>
    </template>
  </Navbar>
</template>
