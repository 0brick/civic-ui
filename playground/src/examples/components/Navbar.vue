<script setup>
import { AppButton, Navbar } from 'civic-ui'
</script>

<template>
  <Navbar :sticky="false">
    <template #brand><a href="#">Acme Inc.</a></template>
    <template #links>
      <a href="#">Product</a>
      <a href="#">Pricing</a>
      <a href="#">Docs</a>
    </template>
    <template #actions>
      <AppButton variant="accent" size="sm">Sign up</AppButton>
    </template>
  </Navbar>
</template>
