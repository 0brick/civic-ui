<script setup>
import { HeroSection } from 'civic-ui'
import townhall from '../../assets/photos/townhall.jpg'
</script>

<template>
  <HeroSection
    eyebrow="Citizens' Office"
    title="What you can do online"
    background="secondary"
    :image="townhall"
    image-alt="City hall building"
  >
    <template #text>
      <ul>
        <li>Apply for a new ID card or passport</li>
        <li>Register a change of address</li>
        <li>Book an appointment at the <a href="#">citizens' office</a></li>
      </ul>
    </template>
  </HeroSection>
</template>
