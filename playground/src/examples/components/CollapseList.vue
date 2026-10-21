<script setup>
import { ref } from 'vue'
import { Collapse } from 'civic-ui'

const openFees = ref(true)
const openDocuments = ref(false)
</script>

<template>
  <div style="max-width: 560px; display: flex; flex-direction: column; gap: 1.6rem;">
    <Collapse v-model="openFees" label="Fees for this service">
      <p>Issuing a new ID card costs €37.00 (€22.80 for applicants under 24).</p>
    </Collapse>
    <Collapse v-model="openDocuments" label="Required documents">
      <p>Bring your expired ID or passport and one biometric photo, no older than six months.</p>
    </Collapse>
  </div>
</template>
