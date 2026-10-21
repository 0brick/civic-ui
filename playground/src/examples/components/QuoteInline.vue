<script setup>
import { Quote } from 'civic-ui'
</script>

<template>
  <!-- appearance="border" inside a .cui-prose column -->
  <div class="cui-prose">
    <p>The council approved the new library building in March. Construction starts in autumn and is planned to take two years.</p>
    <Quote appearance="border" name="Mayor Weber" color="secondary">
      We are not building this for ourselves, but for the next generation of readers.
    </Quote>
    <p>Until then, the temporary branch in the town hall stays open on weekdays.</p>
  </div>
</template>
