<script setup>
import { AppButton, Dropdown, LanguageSwitcher, SiteHeader } from 'civic-ui'
</script>

<template>
  <SiteHeader top-bar :utility-links="[{ label: 'Accessibility', href: '#' }, { label: 'Press', href: '#' }]">
    <template #utility>
      <LanguageSwitcher :languages="[{ code: 'en', label: 'EN' }, { code: 'de', label: 'DE', href: '#' }]" current="en" />
    </template>
    <template #brand><a href="#">City of Nordholm</a></template>
    <template #links>
      <Dropdown trigger-variant="chevron-label" label="Services">
        <a href="#">Resident Services</a>
        <a href="#">Forms &amp; Permits</a>
      </Dropdown>
      <a href="#">City Hall</a>
      <Dropdown trigger-variant="chevron-label" label="Careers" highlight>
        <a href="#">Open Positions</a>
      </Dropdown>
    </template>
    <template #actions>
      <AppButton variant="accent" size="sm" href="#">Contact</AppButton>
    </template>
  </SiteHeader>
</template>
