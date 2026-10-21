<script setup>
import { ScrollspyNav } from 'civic-ui'
</script>

<template>
  <p style="color: var(--cui-text-muted); margin-top: 0;">A boxed table of contents with a title, as you'd use alongside a policy or ordinance document.</p>
  <div class="cui-grid cui-grid--aside cui-grid--aside-start">
    <ScrollspyNav
      title="Contents"
      appearance="card"
      sticky
      scroll-offset="2rem"
      :items="[
        { id: 'policy-purpose', label: 'Purpose' },
        { id: 'policy-scope', label: 'Scope' },
        { id: 'policy-definitions', label: 'Definitions' },
        { id: 'policy-obligations', label: 'Obligations' },
        { id: 'policy-enforcement', label: 'Enforcement' }
      ]"
    />
    <div>
      <section id="policy-purpose" style="min-height: 30vh;">
        <h3>Purpose</h3>
        <p>Why this ordinance exists and the problem it addresses.</p>
      </section>
      <section id="policy-scope" style="min-height: 30vh;">
        <h3>Scope</h3>
        <p>Who and what the ordinance applies to.</p>
      </section>
      <section id="policy-definitions" style="min-height: 30vh;">
        <h3>Definitions</h3>
        <p>Terms used throughout the document.</p>
      </section>
      <section id="policy-obligations" style="min-height: 30vh;">
        <h3>Obligations</h3>
        <p>What affected parties are required to do.</p>
      </section>
      <section id="policy-enforcement" style="min-height: 30vh;">
        <h3>Enforcement</h3>
        <p>How compliance is monitored and violations are handled.</p>
      </section>
    </div>
  </div>
</template>
