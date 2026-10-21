<script setup>
// Image avatar with an automatic initials fallback (no image / broken
// image) and an optional presence dot: the small identity chip used by
// Dropdown's `triggerVariant="user"`, comment lists, team grids, anywhere a
// person needs a face.
import { computed, ref, watch } from 'vue'
import { sanitizeMediaUrl, mediaReferrerPolicy } from '../../utils/security'
import { t } from '../../utils/i18n'

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v) },
  shape: { type: String, default: 'circle', validator: (v) => ['circle', 'square'].includes(v) },
  status: { type: String, default: '', validator: (v) => ['', 'neutral', 'online', 'offline', 'busy', 'away', 'success', 'warning', 'danger'].includes(v) },
  // The name is already visible text right next to the avatar (a byline, a
  // user menu): alt="" and no hidden name, so it isn't read out twice.
  decorative: { type: Boolean, default: false }
})

const failed = ref(false)
// security: routed through sanitizeMediaUrl so a host allowlist
// registered via configureSecurity() applies here too.
const safeSrc = computed(() => sanitizeMediaUrl(props.src))
// A new image gets a fresh chance to load instead of staying on initials.
watch(safeSrc, () => (failed.value = false))

const initials = computed(() => {
  if (!props.name) return ''
  const parts = props.name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
})
</script>

<template>
  <span class="cui-avatar" :class="[`cui-avatar--${size}`, `cui-avatar--${shape}`]">
    <img v-if="safeSrc && !failed" :src="safeSrc" :alt="decorative ? '' : name" :referrerpolicy="mediaReferrerPolicy()" @error="failed = true" />
    <span v-else class="cui-avatar__initials" aria-hidden="true">{{ initials || '?' }}</span>
    <!-- a11y (WCAG 1.1.1): only needed for the initials fallback; the img
         branch above already carries the name via its own `alt`, so adding
         this too would announce the name twice to screen readers. Exactly
         the negation of the img's v-if: a `src` that sanitizing drops renders
         initials too, and needs the name just the same. -->
    <span v-if="name && !decorative && (!safeSrc || failed)" class="cui-visually-hidden">{{ name }}</span>
    <!-- a11y (WCAG 4.1.2 / 1.4.1): the dot is decoration; an aria-label on a
         role-less span is ignored by most screen readers, so the status is
         real (visually hidden) text instead, and each status also differs
         in shape (ring, bar, crescent), not only in color. -->
    <template v-if="status">
      <span class="cui-avatar__status" :class="`cui-avatar__status--${status}`" aria-hidden="true" />
      <span class="cui-visually-hidden">{{ t(`avatar.status.${status}`) }}</span>
    </template>
  </span>
</template>

<style scoped>
.cui-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: visible;
  background: var(--cui-color-navy-700);
  color: var(--cui-color-white);
  font-weight: 700;
  line-height: 1;
  user-select: none;
}

.cui-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.cui-avatar--circle {
  border-radius: 50%;
}
.cui-avatar--square {
  border-radius: var(--cui-radius-md);
}

.cui-avatar--sm {
  width: 2.8rem;
  height: 2.8rem;
  font-size: 1.1rem;
}
.cui-avatar--md {
  width: 3.8rem;
  height: 3.8rem;
  font-size: 1.4rem;
}
.cui-avatar--lg {
  width: 5.2rem;
  height: 5.2rem;
  font-size: 1.8rem;
}
.cui-avatar--xl {
  width: 7.2rem;
  height: 7.2rem;
  font-size: 2.4rem;
}

.cui-avatar__status {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 30%;
  height: 30%;
  min-width: 8px;
  min-height: 8px;
  border-radius: 50%;
  border: 2px solid var(--cui-bg);
  overflow: hidden;
}
.cui-avatar__status--neutral {
  background: var(--cui-color-grey-500);
}
.cui-avatar__status--online,
.cui-avatar__status--success {
  background: var(--cui-color-success);
}
.cui-avatar__status--offline {
  background: var(--cui-color-grey-500);
}
.cui-avatar__status--busy,
.cui-avatar__status--danger {
  background: var(--cui-color-danger);
}
.cui-avatar__status--away,
.cui-avatar__status--warning {
  background: var(--cui-color-warning);
}

/* Shapes, so the status doesn't rest on color alone (WCAG 1.4.1):
   online/success = filled dot, neutral = filled grey dot, offline = ring,
   busy/danger = dot with a bar ("do not disturb"), away/warning = crescent. */
.cui-avatar__status--offline {
  background: var(--cui-bg);
  box-shadow: inset 0 0 0 2px var(--cui-color-grey-500);
}
.cui-avatar__status--busy::after,
.cui-avatar__status--danger::after,
.cui-avatar__status--away::after,
.cui-avatar__status--warning::after {
  content: '';
  position: absolute;
}
.cui-avatar__status--busy::after,
.cui-avatar__status--danger::after {
  left: 20%;
  right: 20%;
  top: 50%;
  height: 2px;
  margin-top: -1px;
  border-radius: 1px;
  background: var(--cui-text-on-dark);
}
.cui-avatar__status--away::after,
.cui-avatar__status--warning::after {
  top: -10%;
  left: -10%;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: var(--cui-bg);
}
</style>
