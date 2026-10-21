<script setup>
import { StatCard } from 'civic-ui'
</script>

<template>
  <div class="cui-grid cui-grid--4">
    <StatCard label="Open tickets" value="128" :trend="4.2" trend-label="vs. last week" invert />
    <StatCard label="Avg. resolution time" value="3.4 days" :trend="-8.1" trend-label="vs. last week" invert />
    <StatCard label="Resolved" value="812" :trend="12.6" trend-label="this month" />
    <StatCard label="Overdue" value="6" :trend="0" trend-label="unchanged" invert />
  </div>
</template>
