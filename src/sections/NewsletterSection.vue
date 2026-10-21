<script setup>
// Subscribe block for a newsletter footer callout.
// Emits `submit` with the entered email: hook it up to whatever backend
// the consuming project uses.
import { onBeforeUnmount, ref, computed } from 'vue'
import TextInput from '../components/forms/TextInput.vue'
import AppButton from '../components/button/AppButton.vue'
import { t } from '../utils/i18n'

const props = defineProps({
  title: { type: String },
  text: { type: String, default: '' },
  label: { type: String },
  placeholder: { type: String },
  submitLabel: { type: String }
})
const emit = defineEmits(['submit'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  title: props.title ?? t('newsletter.title'),
  label: props.label ?? t('newsletter.label'),
  placeholder: props.placeholder ?? t('newsletter.placeholder'),
  submitLabel: props.submitLabel ?? t('newsletter.submit')
}))


// security: one `submit` per short cooldown, so a double click
// can't sign the same address up twice.
const SUBMIT_COOLDOWN = 3000
const email = ref('')
const locked = ref(false)
let unlockTimer = null
onBeforeUnmount(() => clearTimeout(unlockTimer))
function onSubmit() {
  if (locked.value) return
  locked.value = true
  unlockTimer = setTimeout(() => (locked.value = false), SUBMIT_COOLDOWN)
  emit('submit', email.value)
}
</script>

<template>
  <section class="cui-section cui-section--subtle">
    <div class="cui-container cui-newsletter">
      <div class="cui-newsletter__copy">
        <h2>{{ L.title }}</h2>
        <p v-if="text">{{ text }}</p>
      </div>
      <form class="cui-newsletter__form" @submit.prevent="onSubmit">
        <TextInput v-model="email" type="email" name="email" :placeholder="L.placeholder" :label="L.label" required autocomplete="email" maxlength="254" />
        <AppButton type="submit" variant="primary" :disabled="locked" focusable-when-disabled>{{ L.submitLabel }}</AppButton>
      </form>
    </div>
  </section>
</template>

<style scoped>
.cui-newsletter {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--cui-space-5);
}

.cui-newsletter__copy {
  max-width: 420px;
}

.cui-newsletter__form {
  display: flex;
  align-items: flex-end;
  gap: var(--cui-space-3);
  flex-wrap: wrap;
}

.cui-newsletter__form :deep(.cui-field) {
  min-width: 260px;
}
</style>
