<script setup>
// Visually hidden "(opens in a new tab)" suffix for links with `newTab`,
// see src/utils/links.js. Internal; not exported.
import { newTabLabel } from '../../utils/links'
</script>

<template>
  <span class="cui-visually-hidden">&nbsp;{{ newTabLabel() }}</span>
</template>
