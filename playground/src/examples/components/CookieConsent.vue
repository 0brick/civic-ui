<script setup>
import { computed } from 'vue'
import { AppButton, CookieConsent, useCookieConsent } from 'civic-ui'

// useCookieConsent persists the visitor's choice and is what a real page
// checks before loading analytics/marketing scripts: CookieConsent itself
// only renders the banner and emits the choice, see its header comment.
const { consent, accept, reject, reset } = useCookieConsent()
const open = computed(() => consent.value === null)
</script>

<template>
  <p style="margin: 0 0 12px; color: var(--cui-text-muted); font-size: 1.3rem;">
    This banner is fixed to the bottom of the browser viewport, not to this preview box: scroll down if you don't see it.
  </p>
  <AppButton v-if="consent" variant="outline" @click="reset">Show cookie banner again</AppButton>
  <CookieConsent :model-value="open" @accept="accept" @reject="reject" />
</template>
