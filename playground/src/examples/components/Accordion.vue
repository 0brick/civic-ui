<script setup>
import { Accordion, AccordionItem } from 'civic-ui'
</script>

<template>
  <Accordion style="max-width: 560px;">
    <AccordionItem title="What does this library include?">
      Every component listed in the documentation, styled consistently.
    </AccordionItem>
    <AccordionItem title="Can I use my own colors?">
      Yes: override the CSS custom properties in tokens.css.
    </AccordionItem>
  </Accordion>
</template>
