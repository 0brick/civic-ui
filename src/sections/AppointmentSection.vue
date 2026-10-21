<script setup>
// A request/appointment form paired with a dark "prefer to reach us
// directly" panel: the two-track contact pattern for a service a citizen
// books or requests, rather than a general press-office contact grid (see
// ContactSection for that). The form is uncontrolled/local: it emits
// `submit` with the collected values and leaves the actual request (and
// success/error handling) to the consuming app via the `status` prop.
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import TextInput from '../components/forms/TextInput.vue'
import Checkbox from '../components/forms/Checkbox.vue'
import AppButton from '../components/button/AppButton.vue'
import Alert from '../components/feedback/Alert.vue'
import { vReveal } from '../composables/useReveal'
import { sanitizeHtml, sanitizeUrl } from '../utils/security'
import NewTabHint from '../components/internal/NewTabHint.vue'
import { t } from '../utils/i18n'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  intro: { type: String, default: '' },
  submitLabel: { type: String },
  sendingLabel: { type: String },
  status: { type: String, default: 'idle', validator: (v) => ['idle', 'sending', 'success', 'error'].includes(v) },
  successMessage: { type: String },
  errorMessage: { type: String },
  privacyText: { type: String },
  privacyLinkLabel: { type: String },
  privacyHref: { type: String, default: '#' },
  directTitle: { type: String },
  // [{ label, href, icon }], `icon` is rendered via v-html, routed through
  // sanitizeHtml() (see utils/security.js): a strict icon allowlist by
  // default, or the host's own sanitizer via configureSecurity().
  contactMethods: { type: Array, default: () => [] },
  align: { type: String, default: 'center', validator: (v) => ['left', 'center', 'right'].includes(v) },
  // Field labels: override individually (e.g. `:labels="{ name: 'Nom' }"`)
  // to translate without touching the rest of the form.
  labels: { type: Object, default: () => ({}) },
  messagePlaceholder: { type: String },
  // security: input bounds for the personal data this form
  // collects. `zipPattern` is a native `pattern` (e.g. '[0-9]{5}' for German
  // postcodes); none by default, since formats differ by country.
  zipPattern: { type: String, default: '' },
  messageMaxLength: { type: Number, default: 2000 }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  submitLabel: props.submitLabel ?? t('appointment.submit'),
  sendingLabel: props.sendingLabel ?? t('appointment.sending'),
  successMessage: props.successMessage ?? t('appointment.success'),
  errorMessage: props.errorMessage ?? t('appointment.error'),
  privacyText: props.privacyText ?? t('appointment.privacyText'),
  privacyLinkLabel: props.privacyLinkLabel ?? t('appointment.privacyLink'),
  directTitle: props.directTitle ?? t('appointment.directTitle'),
  messagePlaceholder: props.messagePlaceholder ?? t('appointment.messagePlaceholder')
}))

const FIELDS = ['name', 'phone', 'email', 'street', 'houseNumber', 'zip', 'city', 'message']
const fieldLabels = computed(() => Object.fromEntries(FIELDS.map((f) => [f, props.labels?.[f] ?? t(`appointment.${f}`)])))

const emit = defineEmits(['submit'])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  street: '',
  houseNumber: '',
  zip: '',
  city: '',
  message: '',
  privacyAccepted: false
})

// security: one `submit` per request. The form stays locked until
// the host reports progress via `status`, or for a short cooldown when it
// doesn't drive `status` at all, so a double click / Enter-mashing can't
// fire the request repeatedly.
const SUBMIT_COOLDOWN = 3000
const locked = ref(false)
let unlockTimer = null
function unlock() {
  locked.value = false
  clearTimeout(unlockTimer)
}
onBeforeUnmount(() => clearTimeout(unlockTimer))

function handleSubmit() {
  if (locked.value || props.status === 'sending') return
  locked.value = true
  unlockTimer = setTimeout(unlock, SUBMIT_COOLDOWN)
  emit('submit', { ...form })
}

// The form is local/uncontrolled (see comment above), so the component has
// to clear it itself once the consuming app reports success: otherwise a
// second visit stays pre-filled with the request that already went through.
watch(
  () => props.status,
  (status) => {
    if (status !== 'sending') unlock()
    if (status !== 'success') return
    for (const key of Object.keys(form)) form[key] = typeof form[key] === 'boolean' ? false : ''
  }
)
</script>

<template>
  <section class="cui-section">
    <div class="cui-container">
      <div v-reveal class="cui-appointment__head" :class="`cui-align-${align}`">
        <span v-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>
        <h2>{{ title }}</h2>
        <p v-if="intro">{{ intro }}</p>
      </div>

      <div class="cui-appointment__grid">
        <form class="cui-appointment__form" @submit.prevent="handleSubmit">
          <!-- a11y (WCAG 3.3.2): explain the asterisk before the first field. -->
          <p class="cui-appointment__required-hint">{{ t('appointment.requiredHint') }}</p>
          <div class="cui-appointment__row">
            <TextInput v-model="form.name" :label="fieldLabels.name" name="name" required autocomplete="name" maxlength="100" />
            <TextInput v-model="form.phone" :label="fieldLabels.phone" name="phone" type="tel" autocomplete="tel" maxlength="30" pattern="[0-9+\(\)\/ .\-]*" />
          </div>
          <TextInput v-model="form.email" :label="fieldLabels.email" name="email" type="email" required autocomplete="email" maxlength="254" />
          <div class="cui-appointment__row cui-appointment__row--street">
            <TextInput v-model="form.street" :label="fieldLabels.street" name="street" required autocomplete="address-line1" maxlength="100" />
            <!-- a11y (WCAG 1.3.5): no autocomplete token here; HTML has none
                 for a house number on its own, and address-line2 is the
                 address supplement (c/o, floor), which autofill would put
                 here instead. -->
            <TextInput v-model="form.houseNumber" :label="fieldLabels.houseNumber" name="houseNumber" required maxlength="10" />
          </div>
          <div class="cui-appointment__row cui-appointment__row--zip">
            <TextInput
              v-model="form.zip"
              :label="fieldLabels.zip"
              name="zip"
              required
              autocomplete="postal-code"
              maxlength="10"
              :pattern="zipPattern || undefined"
            />
            <TextInput v-model="form.city" :label="fieldLabels.city" name="city" required autocomplete="address-level2" maxlength="100" />
          </div>
          <TextInput
            v-model="form.message"
            multiline
            :label="fieldLabels.message"
            name="message"
            required
            :placeholder="L.messagePlaceholder"
            :maxlength="messageMaxLength > 0 ? messageMaxLength : undefined"
          />

          <Checkbox v-model="form.privacyAccepted" required>
            <template #default>
              {{ L.privacyText }}
              <a :href="sanitizeUrl(privacyHref)" target="_blank" rel="noopener noreferrer">{{ L.privacyLinkLabel }}<NewTabHint /></a>.
            </template>
          </Checkbox>

          <!-- a11y (WCAG 4.1.3): the region is always rendered and only its
               content changes: a role="status" inserted together with its
               message is often not announced at all. -->
          <div class="cui-appointment__status" role="status">
            <Alert v-if="status === 'success'" variant="success" :live="false">{{ L.successMessage }}</Alert>
            <Alert v-else-if="status === 'error'" variant="danger" :live="false">{{ L.errorMessage }}</Alert>
          </div>

          <AppButton type="submit" variant="primary" size="lg" block :loading="status === 'sending'" :disabled="locked" focusable-when-disabled>
            {{ status === 'sending' ? L.sendingLabel : L.submitLabel }}
          </AppButton>
        </form>

        <div v-reveal="100" class="cui-appointment__direct">
          <p class="cui-appointment__direct-lead">{{ L.directTitle }}</p>
          <ul class="cui-appointment__contact-list">
            <li v-for="method in contactMethods" :key="method.label">
              <a :href="sanitizeUrl(method.href)" target="_blank" rel="noopener noreferrer">
                <!-- eslint-disable-next-line vue/no-v-html -- routed through sanitizeHtml(), see utils/security.js -->
                <span v-if="method.icon" class="cui-appointment__contact-icon" aria-hidden="true" v-html="sanitizeHtml(method.icon)" />
                {{ method.label }}<NewTabHint />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cui-appointment__head {
  max-width: 640px;
  margin-bottom: var(--cui-space-7);
}
.cui-appointment__head p {
  margin-top: var(--cui-space-3);
  font-size: var(--cui-fz-lead);
  color: var(--cui-lead-color, var(--cui-text-muted));
}

.cui-appointment__grid {
  display: grid;
  gap: var(--cui-space-4);
}

.cui-appointment__status:empty {
  /* Stays in the DOM (a live region must exist before its message), but
     takes no room while there's nothing to say: cancel the form's gap. */
  margin-top: calc(-1 * var(--cui-space-4));
}

.cui-appointment__form {
  /* grid items default to min-width:auto (never shrink below content's own
     intrinsic width), without this, a field wide enough to want more room
     than the grid track has (e.g. the street/zip row at a width just under
     their own 480px/640px breakpoint) pushes the whole form past the
     viewport edge instead of the field itself wrapping/shrinking. */
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-4);
  padding: var(--cui-space-5);
  background: var(--cui-bg-subtle);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
}

.cui-appointment__row {
  display: grid;
  gap: var(--cui-space-4);
  grid-template-columns: 1fr;
}

.cui-appointment__direct {
  min-width: 0; /* see .cui-appointment__form above */
  position: relative;
  padding: var(--cui-space-6);
  background: var(--cui-color-navy);
  color: var(--cui-color-white);
  border-radius: var(--cui-radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-4);
}

.cui-appointment__direct-lead {
  font-family: var(--cui-font-sans);
  font-weight: 700;
  font-size: 1.9rem;
  letter-spacing: -0.01em;
  margin: 0;
}

.cui-appointment__contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-3);
}
.cui-appointment__contact-list a {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
  color: inherit;
  text-decoration: none;
  font-size: 1.5rem;
}
.cui-appointment__contact-list a:hover {
  text-decoration: underline;
}
.cui-appointment__contact-icon {
  flex-shrink: 0;
  display: inline-flex;
  color: var(--cui-color-sky);
}
.cui-appointment__contact-icon :deep(svg) {
  width: 1.8rem;
  height: 1.8rem;
}

@media (min-width: 480px) {
  .cui-appointment__row.cui-appointment__row--street {
    grid-template-columns: 2.2fr 1fr;
  }
  .cui-appointment__row.cui-appointment__row--zip {
    grid-template-columns: 1fr 1.8fr;
  }
}

@media (min-width: 640px) {
  .cui-appointment__row {
    grid-template-columns: 1fr 1fr;
  }
  .cui-appointment__form {
    padding: var(--cui-space-7);
  }
}

.cui-appointment__required-hint {
  margin: 0;
  font-size: 1.3rem;
  color: var(--cui-text-muted);
}

@media (min-width: 900px) {
  .cui-appointment__grid {
    grid-template-columns: 1.3fr 1fr;
    align-items: start;
  }
}
</style>
