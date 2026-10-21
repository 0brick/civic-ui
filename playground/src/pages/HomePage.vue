<script setup>
// The playground's landing page: a short, framework-site-style pitch for
// the library itself (hero, compliance badges, feature grid, stats, a code
// sample, a closing CTA), built entirely out of civic-ui's own sections so
// it doubles as a live example. The Sections/Components/Theme tabs and their
// pages are untouched; this only adds what the default (no-slug) route shows.
// Like any framework homepage, the hero leads with the install command.
import { ref } from 'vue'
import { HeroSection, AppButton, Badge, StatsSection, StepsSection, CtaBanner } from 'civic-ui'
import CodeBlock from '../components/CodeBlock.vue'
import { sectionCategories } from '../registry/sections'
import { componentCategories } from '../registry/components'
import academyOfFineArts from '../assets/photos/academy-of-fine-arts.jpg'

const sectionCount = sectionCategories.reduce((n, c) => n + c.items.length, 0)
const componentCount = componentCategories.reduce((n, c) => n + c.items.length, 0)

const installCommand = 'npm install civic-ui vue'
const installCopied = ref(false)
let installCopiedTimer

async function copyInstallCommand() {
  try {
    await navigator.clipboard.writeText(installCommand)
    installCopied.value = true
    clearTimeout(installCopiedTimer)
    installCopiedTimer = setTimeout(() => (installCopied.value = false), 1600)
  } catch {
    // Clipboard API unavailable (e.g. insecure context): the command is
    // still visible and selectable by hand.
  }
}

const usageSnippet = `import { HeroSection, AppButton } from 'civic-ui'
import 'civic-ui/style.css'

<template>
  <HeroSection
    title="Welcome to Nordholm"
    text="Online services, appointments and forms for residents."
    background="secondary"
    :primary-action="{ label: 'Get started', href: '/services' }"
  />
</template>`
</script>

<template>
  <div class="cui-home">
    <HeroSection
      eyebrow="Vue 3 component library for the public sector"
      title="Civic UI"
      align="center"
      stage
      full-height
      :image="academyOfFineArts"
      image-alt="The Dresden Academy of Fine Arts glass dome on the Elbe riverfront, seen from across the water"
      caption="Academy of Fine Arts, Dresden: a few streets from where Civic UI is built"
      scroll-target="#compliance"
      :primary-action="{ label: 'Get started', href: '/docs/getting-started' }"
      :secondary-action="{ label: 'Browse sections', href: '/sections' }"
    >
      <template #text>
        <p>A page-building kit for government and civic websites: semantic markup, full keyboard support, and no third-party network calls, by construction.</p>
        <div class="cui-home__install">
          <code class="cui-home__install-command"><span class="cui-home__install-prompt" aria-hidden="true">$</span> {{ installCommand }}</code>
          <AppButton variant="ghost" size="sm" @click="copyInstallCommand">
            {{ installCopied ? 'Copied' : 'Copy' }}<span class="cui-visually-hidden"> install command</span>
          </AppButton>
          <span class="cui-visually-hidden" role="status">{{ installCopied ? 'Install command copied to clipboard' : '' }}</span>
        </div>
      </template>
    </HeroSection>

    <section id="compliance" class="cui-home__compliance">
      <div class="cui-container cui-home__compliance-inner">
        <span class="cui-home__compliance-label">Checked against</span>
        <div class="cui-home__compliance-badges">
          <Badge variant="outline">WCAG 2.2 AA</Badge>
          <Badge variant="outline">EN 301 549</Badge>
          <Badge variant="outline">BITV 2.0</Badge>
          <Badge variant="outline">GDPR-safe: zero third-party requests</Badge>
        </div>
      </div>
    </section>

    <StepsSection
      eyebrow="Why Civic UI"
      title="Built the way a public-sector site actually has to ship"
      intro="Every section and component carries the same non-negotiables, so a project reusing them does not have to re-derive each one."
      layout="grid"
      :columns="3"
      :steps="[
        { title: 'Accessible by default', text: 'Real buttons and links, full keyboard operability, managed focus, and ARIA live regions: the structure, not just the look.' },
        { title: 'Private by default', text: 'Fonts are self-hosted and nothing calls out to an analytics or CDN host, so no visitor IP leaks on page load.' },
        { title: 'Prop-driven, not duplicated', text: 'Related variants live behind one discriminating prop instead of near-duplicate components, so the library stays small without losing flexibility.' },
        { title: 'Themeable by design token', text: 'Every color is a CSS custom property, with a built-in contrast-checking palette engine for safe re-skins.' },
        { title: 'Security-hardened sinks', text: 'Every v-html, URL and background-image entry point is routed through a documented sanitization layer.' },
        { title: 'Vue 3 native', text: 'Composition API and script setup throughout, with no runtime dependency beyond Vue itself.' }
      ]"
    />

    <StatsSection
      title="A full page-building kit, not just a button library"
      align="center"
      :stats="[
        { value: String(sectionCount), label: 'ready-to-drop sections' },
        { value: String(componentCount), label: 'components' },
        { value: '0', label: 'third-party network requests' },
        { value: 'MIT', label: 'open-source license' }
      ]"
    />

    <section class="cui-home__code">
      <div class="cui-container cui-home__code-inner">
        <div class="cui-home__code-copy">
          <span class="cui-eyebrow">Drop it in</span>
          <h2>Import what you need, style it with tokens</h2>
          <p>Every section and component reads from the same design tokens, so a re-skin is a CSS-variable change, not a rewrite. Full setup steps are on the Documentation tab.</p>
        </div>
        <CodeBlock :code="usageSnippet" />
      </div>
    </section>

    <CtaBanner
      title="See it all live"
      text="Props tables, copy-pasteable examples, and the compliance notes for each, right next to the code."
      background="accent"
      :action="{ label: 'Open the Sections catalog', href: '/sections' }"
    />
  </div>
</template>

<style scoped>
/* Install command in the hero: a translucent strip on the dark stage, the
   ghost AppButton picks its on-dark styling up from the hero's
   data-cui-theme="dark". */
.cui-home__install {
  display: inline-flex;
  align-items: center;
  gap: var(--cui-space-3);
  max-width: 100%;
  margin-top: var(--cui-space-5);
  padding: var(--cui-space-2) var(--cui-space-2) var(--cui-space-2) var(--cui-space-4);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(6px);
  text-align: left;
}

.cui-home__install-command {
  font-family: var(--cui-font-mono);
  font-size: 1.6rem;
  color: var(--cui-heading);
  overflow-x: auto;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .cui-home__install {
    gap: var(--cui-space-2);
    padding-left: var(--cui-space-3);
  }
  .cui-home__install-command {
    font-size: 1.3rem;
  }
}

.cui-home__install-prompt {
  color: var(--cui-accent);
  user-select: none;
}

.cui-home__compliance {
  border-bottom: 1px solid var(--cui-border);
}

.cui-home__compliance-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--cui-space-3) var(--cui-space-4);
  padding-block: var(--cui-space-5);
}

.cui-home__compliance-label {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cui-text-muted);
}

.cui-home__compliance-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cui-space-2);
}

.cui-home__code {
  padding-block: var(--cui-space-8);
}

.cui-home__code-inner {
  display: grid;
  gap: var(--cui-space-6);
  align-items: center;
}

.cui-home__code-copy p {
  color: var(--cui-text-muted);
  font-size: 1.6rem;
  line-height: 1.55;
  margin: var(--cui-space-3) 0 0;
}

@media (min-width: 900px) {
  .cui-home__code-inner {
    grid-template-columns: 0.9fr 1.1fr;
    gap: var(--cui-space-8);
  }
}
</style>
