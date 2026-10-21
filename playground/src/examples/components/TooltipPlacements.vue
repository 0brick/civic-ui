<script setup>
import { AppButton, Tooltip } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster">
    <Tooltip text="Shown above the button" placement="top">
      <AppButton variant="outline" size="sm">Top</AppButton>
    </Tooltip>
    <Tooltip text="Shown below the button" placement="bottom">
      <AppButton variant="outline" size="sm">Bottom</AppButton>
    </Tooltip>
    <Tooltip text="Shown left of the button" placement="left">
      <AppButton variant="outline" size="sm">Left</AppButton>
    </Tooltip>
    <Tooltip text="Shown right of the button" placement="right">
      <AppButton variant="outline" size="sm">Right</AppButton>
    </Tooltip>
  </div>
</template>
