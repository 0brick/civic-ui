<script setup>
// Live configurator for the color-palette engine (src/utils/palette.js). Lets
// you try all four configuration modes documented in docs/theming.md#color-
// palette-configuration against the real components, with a live WCAG
// contrast report, so this page doubles as both a demo and a manual check
// that the engine holds up outside its unit tests.
//
// Applies globally (applyPalette() targets :root by default), which is the
// point: you're meant to see the *whole* playground reskin, nav bar
// included. The chosen palette deliberately stays applied when you switch
// to another tab (state lives in utils/themeState.js); only a page reload
// or the Reset button below returns to the shipped default.
import { ref, computed, watch } from 'vue'
import {
  generatePalette,
  applyPalette,
  presetPalettes,
  paletteRoles,
  themeRoles,
  deriveContrastText,
  AppButton,
  Badge,
  Alert,
  Card,
  TextInput,
  Select,
  HeroSection,
  CtaBanner,
  AlertBanner
} from 'civic-ui'
import CodeBlock from '../components/CodeBlock.vue'
import { mode, presetKey, primaryColor, enabledRoles, roleValues, resetThemeState } from '../utils/themeState'

const modes = [
  { key: 'preset', label: 'Factory-made pallet', hint: 'Select a curated, complete range.' },
  {
    key: 'primary',
    label: 'One primary color',
    hint: 'Just specify the primary color: the other colors will be derived accordingly.'
  },
  { key: 'individual', label: 'Individual colors', hint: 'Specify any roles: everything else is derived.' },
  { key: 'full', label: 'All colors', hint: 'Specify each role individually.' }
]

const themeRevision = ref(0)

const activeColors = computed(() => {
  if (mode.value === 'preset') return presetKey.value
  if (mode.value === 'primary') return { primary: primaryColor.value }
  if (mode.value === 'individual') {
    const colors = {}
    for (const role of paletteRoles) if (enabledRoles[role.key]) colors[role.key] = roleValues[role.key]
    return colors
  }
  // full
  return { ...roleValues }
})

const activeResult = computed(() => {
  try {
    return { ok: true, result: generatePalette(activeColors.value) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
})

watch(
  activeResult,
  (val) => {
    if (!val.ok) return
    applyPalette(val.result)
    themeRevision.value++
  },
  { immediate: true }
)


const codeSnippet = computed(() => {
  const colors = activeColors.value
  const arg =
    typeof colors === 'string' ? `'${colors}'` : JSON.stringify(colors, null, 2).replace(/"([a-zA-Z]+)":/g, '$1:')
  return `import { generatePalette, applyPalette } from 'civic-ui'\n\nconst palette = generatePalette(${arg})\napplyPalette(palette) // installs CSS vars + updates sectionThemes`
})

// background="…" keys with the colors the current palette actually gives them.
// The swatch's own labels are small text, so they get an AA-text ink derived
// from the swatch color: a theme's `heading` only promises the 3:1 for
// large text.
const themeKeyRows = computed(() => {
  if (!activeResult.value.ok) return []
  const themes = activeResult.value.result.sectionThemes
  const legacyToRole = Object.fromEntries(Object.entries(themeRoles).map(([role, key]) => [key, role]))
  return Object.keys(themes).map((key) => ({
    key: legacyToRole[key] || key,
    legacy: legacyToRole[key] ? key : '',
    ...themes[key],
    ink: deriveContrastText(themes[key].bg).text
  }))
})

const contrastRows = computed(() =>
  activeResult.value.ok ? Object.entries(activeResult.value.result.contrast.checks) : []
)
</script>

<template>
  <header class="cui-container theme-page__intro">
    <span class="cui-eyebrow">Configuration</span>
    <h1>Color Palette</h1>
    <p>
      Four ways to configure the library's colors: a predefined palette, just one primary color, individual roles, or
      each color separately. Anything you don't specify is professionally derived to match, and every text/background
      pair is then checked against WCAG AA and automatically corrected if necessary, in each of the four configurations.
    </p>
  </header>

  <div class="cui-container theme-page__layout">
    <aside class="theme-page__controls">
      <!-- Toggle buttons, not a tablist: each mode swaps the controls below,
           there is no tabpanel to point at. -->
      <div class="theme-page__modes" role="group" aria-label="Configuration mode">
        <button
          v-for="m in modes"
          :key="m.key"
          type="button"
          :aria-pressed="mode === m.key"
          @click="mode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
      <p class="theme-page__mode-hint">{{ modes.find((m) => m.key === mode).hint }}</p>

      <!-- Mode 1: preset -->
      <div v-if="mode === 'preset'" class="theme-page__presets" role="group" aria-label="Preset palette">
        <button
          v-for="(palette, name) in presetPalettes"
          :key="name"
          type="button"
          class="theme-page__preset"
          :aria-pressed="presetKey === name"
          @click="presetKey = name"
        >
          <span class="theme-page__preset-swatches" aria-hidden="true">
            <span :style="{ background: palette.primary }" />
            <span :style="{ background: palette.accent }" />
            <span :style="{ background: palette.secondary }" />
          </span>
          <span class="theme-page__preset-name">{{ name }}</span>
        </button>
      </div>

      <!-- Mode 2: primary only -->
      <div v-else-if="mode === 'primary'" class="theme-page__field">
        <label for="theme-primary">Primary color (Ink)</label>
        <div class="theme-page__color-input">
          <input id="theme-primary" v-model="primaryColor" type="color" />
          <code>{{ primaryColor }}</code>
        </div>
      </div>

      <!-- Mode 3: individual roles -->
      <div v-else-if="mode === 'individual'" class="theme-page__roles">
        <div v-for="role in paletteRoles" :key="role.key" class="theme-page__role">
          <label class="theme-page__role-toggle">
            <input v-model="enabledRoles[role.key]" type="checkbox" />
            {{ role.label }}
          </label>
          <input v-if="enabledRoles[role.key]" v-model="roleValues[role.key]" type="color" :aria-label="role.label" />
          <span v-else class="theme-page__auto">automatically</span>
        </div>
      </div>

      <!-- Mode 4: every role -->
      <div v-else class="theme-page__roles">
        <div v-for="role in paletteRoles" :key="role.key" class="theme-page__role">
          <label :for="`theme-full-${role.key}`">{{ role.label }}</label>
          <input :id="`theme-full-${role.key}`" v-model="roleValues[role.key]" type="color" />
        </div>
      </div>

      <p v-if="!activeResult.ok" class="theme-page__error">{{ activeResult.error }}</p>

      <AppButton variant="ghost" size="sm" @click="resetThemeState">Reset</AppButton>

      <CodeBlock :code="codeSnippet" lang="JavaScript" label="Palette configuration code" />
    </aside>

    <div class="theme-page__preview">
      <section class="theme-page__themes">
        <h2>Section themes (<code>background="…"</code>)</h2>
        <ul class="theme-page__theme-list">
          <li v-for="t in themeKeyRows" :key="t.key" :style="{ background: t.bg, color: t.ink }">
            <strong>{{ t.key }}</strong>
            <span v-if="t.legacy">= {{ t.legacy }}</span>
            <code>{{ t.bg }}</code>
          </li>
        </ul>
      </section>

      <section class="theme-page__contrast">
        <h2>Contrast Report (WCAG)</h2>
        <ul class="theme-page__contrast-list">
          <li v-for="[label, check] in contrastRows" :key="label">
            <Badge :variant="check.aaText || check.aaLarge ? 'success' : 'danger'" pill> {{ check.ratio }}:1 </Badge>
            {{ label }}
          </li>
        </ul>
      </section>

      <section :key="themeRevision" class="theme-page__demo">
        <h2>Live Preview</h2>

        <div class="theme-page__demo-block">
          <AppButton variant="primary">Primary</AppButton>
          <AppButton variant="accent">Accent</AppButton>
          <AppButton variant="quaternary">Quaternary</AppButton>
          <AppButton variant="outline">Outline</AppButton>
          <AppButton variant="ghost">Ghost</AppButton>
          <AppButton variant="danger">Delete</AppButton>
        </div>

        <div class="theme-page__demo-block">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Error</Badge>
        </div>

        <div class="theme-page__demo-block theme-page__demo-block--stack">
          <Alert variant="info" title="Note">An informative notice for citizens.</Alert>
          <Alert variant="success" title="Success">The request was successfully submitted.</Alert>
          <Alert variant="warning" title="Warning">Please review your information.</Alert>
          <Alert variant="danger" title="Error">The request could not be sent.</Alert>
        </div>

        <div class="theme-page__demo-block theme-page__demo-block--grid">
          <Card title="Online Appointment Scheduling" href="#">
            Schedule an appointment for your request in just a few minutes.
          </Card>
          <div class="theme-page__form">
            <TextInput
              label="Email"
              type="email"
              placeholder="example@email.com"
              hint="We do not share your information with third parties."
            />
            <Select label="State" placeholder="Please choose" :options="['Bavaria', 'Berlin', 'Saxony']" />
          </div>
        </div>

        <AlertBanner
          variant="info"
          text="The citizen service offices will be closed on October 3."
          :action="{ label: 'Business hours', href: '#' }"
        />

        <HeroSection size="compact" title="Your government. Digital, open, for everyone." background="primary" />
        <HeroSection size="compact" title="A second color for accent areas" background="accent" />

        <CtaBanner title="Extend your resident parking permit" :action="{ label: 'Start Renewal', href: '#' }" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.theme-page__intro {
  padding-block: var(--cui-space-7) var(--cui-space-5);
  max-width: 72ch;
}

.theme-page__intro h1 {
  margin: var(--cui-space-2) 0;
}

.theme-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
  gap: var(--cui-space-6);
  align-items: start;
  padding-bottom: var(--cui-space-8);
}

/* minmax(0, …), not a bare 1fr (= minmax(auto, 1fr)): the column must not
   grow to its widest child's min-content (the code block's longest line),
   or the page gets wider than a 320px viewport (WCAG 1.4.10). */
@media (max-width: 860px) {
  .theme-page__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

.theme-page__controls {
  position: sticky;
  top: calc(var(--cui-navbar-height, 0px) + var(--cui-space-4));
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-4);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
  padding: var(--cui-space-5);
  background: var(--cui-bg-subtle);
}

@media (max-width: 860px) {
  .theme-page__controls {
    position: static;
  }
}

.theme-page__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.theme-page__modes button {
  border: 1px solid var(--cui-border);
  background: var(--cui-bg);
  color: var(--cui-text);
  font: inherit;
  font-size: 1.3rem;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border-radius: var(--cui-radius-md);
  cursor: pointer;
}

.theme-page__modes button[aria-pressed='true'] {
  background: var(--cui-primary);
  border-color: var(--cui-primary);
  color: var(--cui-primary-contrast);
}

.theme-page__mode-hint {
  margin: 0;
  font-size: 1.3rem;
  color: var(--cui-text-muted);
}

.theme-page__presets {
  display: grid;
  gap: var(--cui-space-2);
}

.theme-page__preset {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  border: 1px solid var(--cui-border);
  background: var(--cui-bg);
  border-radius: var(--cui-radius-md);
  padding: var(--cui-space-2) var(--cui-space-3);
  cursor: pointer;
  text-align: left;
}

.theme-page__preset[aria-pressed='true'] {
  border-color: var(--cui-primary);
  box-shadow: 0 0 0 1px var(--cui-primary);
}

.theme-page__preset-swatches {
  display: flex;
}

.theme-page__preset-swatches span {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  margin-left: -0.5rem;
  border: 2px solid var(--cui-bg);
}

.theme-page__preset-swatches span:first-child {
  margin-left: 0;
}

.theme-page__preset-name {
  font-weight: 600;
  text-transform: capitalize;
}

.theme-page__field label {
  display: block;
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 0.6rem;
}

.theme-page__color-input {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
}

.theme-page__color-input input[type='color'] {
  width: 4.4rem;
  height: 3.6rem;
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-sm);
  padding: 0.2rem;
  background: var(--cui-bg);
  cursor: pointer;
}

.theme-page__roles {
  display: grid;
  gap: var(--cui-space-2);
}

.theme-page__role {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-2);
}

.theme-page__role label:not(.theme-page__role-toggle) {
  font-size: 1.3rem;
}

.theme-page__role-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
}

.theme-page__role input[type='color'] {
  width: 3.6rem;
  height: 3rem;
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-sm);
  padding: 0.2rem;
  background: var(--cui-bg);
  cursor: pointer;
}

.theme-page__auto {
  font-size: 1.2rem;
  color: var(--cui-text-muted);
  font-style: italic;
}

.theme-page__error {
  margin: 0;
  font-size: 1.3rem;
  color: var(--cui-danger-text);
  background: var(--cui-danger-bg);
  border-radius: var(--cui-radius-sm);
  padding: var(--cui-space-2) var(--cui-space-3);
}

.theme-page__themes {
  margin-bottom: var(--cui-space-6);
}
.theme-page__themes h2 {
  font-size: 1.8rem;
}
.theme-page__theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
  gap: var(--cui-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.theme-page__theme-list li {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: var(--cui-space-3);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  font-size: 1.3rem;
}
.theme-page__theme-list code {
  font-size: 1.2rem;
}

.theme-page__contrast h2,
.theme-page__demo h2 {
  font-size: 1.8rem;
  margin: 0 0 var(--cui-space-3);
}

.theme-page__contrast {
  margin-bottom: var(--cui-space-6);
}

.theme-page__contrast-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--cui-space-2);
  font-size: 1.3rem;
}

.theme-page__contrast-list li {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-sm);
  padding: 0.6rem 1rem;
}

.theme-page__demo {
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-6);
}

.theme-page__demo-block {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cui-space-3);
  align-items: center;
}

.theme-page__demo-block--stack {
  flex-direction: column;
  align-items: stretch;
}

.theme-page__demo-block--grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  align-items: start;
}

.theme-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-3);
}
</style>
