<script setup>
import { Card, DescriptionList, ToastContainer } from 'civic-ui'

const bank = [
  { term: 'Account holder', value: 'Friends of the School e.V.' },
  { term: 'IBAN', value: 'DE12 3456 7890 1234 5678 90', emphasis: true, copyable: true },
  { term: 'BIC', value: 'GENODEF1XYZ', copyable: true },
  { term: 'Bank', value: 'Nordholm Savings Bank' }
]
</script>

<template>
  <Card accent="top" appearance="outlined" style="max-width: 44rem">
    <DescriptionList layout="stacked" :items="bank" />
  </Card>
  <ToastContainer />
</template>
