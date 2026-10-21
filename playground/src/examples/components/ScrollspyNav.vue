<script setup>
import { ScrollspyNav } from 'civic-ui'
</script>

<template>
  <p style="color: var(--cui-text-muted); margin-top: 0;">Scroll this page: the active link tracks the section in view.</p>
  <div class="cui-cluster" style="align-items: flex-start; gap: 2.4rem;">
    <ScrollspyNav
      :items="[
        { id: 'spy-overview', label: 'Overview' },
        { id: 'spy-pricing', label: 'Pricing' },
        { id: 'spy-faq', label: 'FAQ' }
      ]"
      sticky
    />
    <div>
      <section id="spy-overview" style="min-height: 40vh;">
        <h3>Overview</h3>
        <p>A short introduction to the product lives here.</p>
      </section>
      <section id="spy-pricing" style="min-height: 40vh;">
        <h3>Pricing</h3>
        <p>Plan details and pricing tiers live here.</p>
      </section>
      <section id="spy-faq" style="min-height: 40vh;">
        <h3>FAQ</h3>
        <p>Common questions live here.</p>
      </section>
    </div>
  </div>
</template>
