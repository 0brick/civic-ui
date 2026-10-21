<script setup>
// Full-width banner for a single strong call to action (careers page,
// newsletter push, "apply now": the solid-color-block pattern often used
// to break up long content pages). `background` takes the same theme key /
// color as HeroSection (see src/utils/themes.js); defaults to the gold
// theme for the classic yellow CTA block. `layout="split"` (default) puts
// the text left and the buttons right from 900px up; `stacked` puts the
// buttons under the text, aligned with `align`.
import { computed } from 'vue'
import AppButton from '../components/button/AppButton.vue'
import { resolveBackground, themeColors, deriveContrastText, isDarkBackground } from '../utils/themes'
import { relativeLuminance, parseColor } from '../utils/color'

const props = defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
  background: { type: String, default: 'gold' },
  action: { type: Object, required: true }, // { label, href, newTab? }
  // A second, quieter action: an outline button, light on a dark band.
  secondaryAction: { type: Object, default: null }, // { label, href, newTab? }
  layout: { type: String, default: 'split', validator: (v) => ['split', 'stacked'].includes(v) },
  // Text (and, stacked, button) alignment. In `split` the buttons always sit
  // at the end of the row.
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) }
})

const theme = computed(() => {
  const r = resolveBackground(props.background)
  if (r?.type === 'theme') return r
  const bg = r?.bg || themeColors('gold').bg
  return { bg, ...deriveContrastText(bg) }
})

// A raw custom color has no theme key to look up: fall back to reading its
// own luminance, same threshold sectionThemes' dark entries (navy/purple/...)
// sit under, so a dark custom color gets the light-button treatment a dark
// theme key would.
const buttonVariant = computed(() => {
  const r = resolveBackground(props.background)
  if (r?.type === 'theme') return ['navy', 'purple', 'violet', 'teal', 'anthracite'].includes(r.key) ? 'accent' : 'primary'
  return relativeLuminance(parseColor(theme.value.bg)) < 0.5 ? 'accent' : 'primary'
})

// Marks a dark band so nested content (outline/ghost buttons, links, focus
// rings in a custom slot) switches to its on-dark treatment on its own.
const isDark = computed(() => isDarkBackground(theme.value.bg))
</script>

<template>
  <section
    class="cui-cta"
    :data-cui-theme="isDark ? 'dark' : undefined"
    :style="{ '--cui-cta-bg': theme.bg, '--cui-cta-text': theme.text, '--cui-cta-heading': theme.heading }"
  >
    <div class="cui-container cui-cta__inner" :class="[`cui-cta__inner--${layout}`, `cui-cta__inner--align-${align}`]">
      <div class="cui-cta__copy">
        <h2 class="cui-cta__title">{{ title }}</h2>
        <div v-if="$slots.text" class="cui-cta__text cui-cta__text--rich"><slot name="text" /></div>
        <p v-else-if="text" class="cui-cta__text">{{ text }}</p>
      </div>
      <div class="cui-cta__actions">
        <AppButton :variant="buttonVariant" size="lg" :href="action.href" :new-tab="action.newTab">{{ action.label }}</AppButton>
        <AppButton v-if="secondaryAction" variant="outline" size="lg" :href="secondaryAction.href" :new-tab="secondaryAction.newTab">
          {{ secondaryAction.label }}
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cui-cta {
  background: var(--cui-cta-bg);
}

.cui-cta__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-5);
  padding-block: var(--cui-space-7);
}

.cui-cta__title {
  color: var(--cui-cta-heading);
  margin-bottom: var(--cui-space-2);
}

.cui-cta__text {
  color: var(--cui-cta-text);
  font-size: 1.6rem;
  margin: 0;
  max-width: 60ch;
}
.cui-cta__text--rich :slotted(p) {
  margin: 0 0 var(--cui-space-2);
}
.cui-cta__text--rich :slotted(:last-child) {
  margin-bottom: 0;
}
.cui-cta__text--rich :slotted(a) {
  color: inherit;
}

.cui-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cui-space-3);
}

/* split: text and buttons share the row, buttons at the end (wrapping
   below the text on narrow screens) */
.cui-cta__inner--split.cui-cta__inner--align-center .cui-cta__copy {
  text-align: center;
}
.cui-cta__inner--split.cui-cta__inner--align-right .cui-cta__copy {
  text-align: right;
}

/* stacked: buttons under the text */
.cui-cta__inner--stacked {
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.cui-cta__inner--stacked.cui-cta__inner--align-center {
  align-items: center;
  text-align: center;
}
.cui-cta__inner--stacked.cui-cta__inner--align-center .cui-cta__text {
  margin-inline: auto;
}
.cui-cta__inner--stacked.cui-cta__inner--align-right {
  align-items: flex-end;
  text-align: right;
}
.cui-cta__inner--stacked.cui-cta__inner--align-right .cui-cta__text {
  margin-inline-start: auto;
}
.cui-cta__inner--stacked.cui-cta__inner--align-center .cui-cta__actions {
  justify-content: center;
}
.cui-cta__inner--stacked.cui-cta__inner--align-right .cui-cta__actions {
  justify-content: flex-end;
}
</style>
