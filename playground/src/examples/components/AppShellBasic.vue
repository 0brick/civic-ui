<script setup>
import { AppShell } from 'civic-ui'
</script>

<template>
  <div style="height: 420px; border: 1px solid var(--cui-border); border-radius: var(--cui-radius-lg); overflow: hidden;">
    <AppShell title="Resident portal">
      <template #sidebar>
        <nav aria-label="Portal" style="padding: var(--cui-space-4); display: flex; flex-direction: column; gap: var(--cui-space-2);">
          <a href="#" style="font-weight: 600;">Overview</a>
          <a href="#">Applications</a>
          <a href="#">Documents</a>
        </nav>
      </template>
      <h1 style="margin-top: 0;">Welcome back, Anna</h1>
      <p>Your building permit application is under review.</p>
    </AppShell>
  </div>
</template>
