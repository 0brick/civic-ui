<script setup>
// Bell-icon dropdown for a webapp header: unread count badge, a scrollable
// list of notifications, and a "mark all read" affordance. Feed it plain
// data; it emits back which item (or "all") was acknowledged.
import { computed } from 'vue'
import Dropdown from './Dropdown.vue'
import EmptyState from '../content/EmptyState.vue'
import { t } from '../../utils/i18n'
import { useId } from '../../composables/useId'

const props = defineProps({
  items: { type: Array, default: () => [] } // [{ id, title, text, time, read }]
})
const emit = defineEmits(['mark-read', 'mark-all-read'])

const unreadCount = computed(() => props.items.filter((n) => !n.read).length)
// Shared description for the unread rows' buttons: what pressing one does.
const markReadHintId = useId('cui-notif-hint')
</script>

<template>
  <Dropdown align="end" class="cui-notif-center">
    <template #trigger="{ open }">
      <!-- a11y (WCAG 4.1.2): aria-label overrides all descendant text for the
           accessible name, so the visible "9+" badge below would otherwise be
           invisible to screen readers: fold the count into the label itself. -->
      <button
        type="button"
        class="cui-notif-center__trigger"
        :aria-expanded="String(open)"
        :aria-label="unreadCount ? t('notifications.unread', { count: unreadCount }) : t('notifications.title')"
      >
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path d="M5 8a5 5 0 0110 0c0 4 1.5 5 1.5 5h-13S5 12 5 8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M8 16a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span v-if="unreadCount" class="cui-notif-center__badge" aria-hidden="true">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </button>
    </template>

    <div class="cui-notif-center__panel" @click.stop>
      <div class="cui-notif-center__header">
        <p>{{ t('notifications.title') }}</p>
        <button v-if="unreadCount" type="button" class="cui-notif-center__mark-all" @click="emit('mark-all-read')">{{ t('notifications.markAllRead') }}</button>
      </div>
      <span :id="markReadHintId" hidden>{{ t('notifications.markRead') }}</span>
      <ul v-if="items.length" class="cui-notif-center__list">
        <!-- a11y (WCAG 2.1.1): a real <button> per row, so marking a
             notification read works by keyboard. -->
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="cui-notif-center__item"
            :class="{ 'cui-notif-center__item--unread': !item.read }"
            :aria-describedby="item.read ? undefined : markReadHintId"
            @click="emit('mark-read', item.id)"
          >
            <span class="cui-notif-center__dot" aria-hidden="true" />
            <!-- a11y (WCAG 1.3.1): read/unread is otherwise only the dot and
                 the bolder title: say it in words, first in the name. -->
            <span v-if="!item.read" class="cui-visually-hidden">{{ `${t('notifications.unreadItem')} ` }}</span>
            <span class="cui-notif-center__body">
              <span class="cui-notif-center__item-title">{{ item.title }}</span>
              <span v-if="item.text" class="cui-notif-center__item-text">{{ item.text }}</span>
              <span v-if="item.time" class="cui-notif-center__item-time">{{ item.time }}</span>
            </span>
          </button>
        </li>
      </ul>
      <EmptyState v-else :title="t('notifications.emptyTitle')" :text="t('notifications.emptyText')" />
    </div>
  </Dropdown>
</template>

<style scoped>
.cui-notif-center__trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: inherit;
  cursor: pointer;
  transition: background-color var(--cui-duration) var(--cui-ease);
}
.cui-notif-center__trigger:hover {
  background: var(--cui-bg-muted);
}

.cui-notif-center__badge {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  min-width: 1.7rem;
  height: 1.7rem;
  padding: 0 0.3rem;
  border-radius: var(--cui-radius-pill);
  background: var(--cui-color-danger);
  color: var(--cui-color-white);
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--cui-bg);
}

.cui-notif-center__panel {
  width: min(360px, 80vw);
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.cui-notif-center__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.6rem 1rem;
  border-bottom: 1px solid var(--cui-border);
  font-weight: 700;
  font-size: 1.4rem;
}

.cui-notif-center__mark-all {
  border: none;
  background: none;
  color: var(--cui-link);
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
}
.cui-notif-center__mark-all:hover {
  text-decoration: underline;
}

.cui-notif-center__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}

.cui-notif-center__item {
  display: flex;
  width: 100%;
  gap: var(--cui-space-3);
  padding: 1.2rem 0.6rem;
  border: none;
  border-bottom: 1px solid var(--cui-border);
  margin: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--cui-duration-fast) var(--cui-ease);
}
.cui-notif-center__list li:last-child .cui-notif-center__item {
  border-bottom: none;
}
.cui-notif-center__item:hover {
  background: var(--cui-bg-subtle);
}

.cui-notif-center__dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 0.5rem;
  border-radius: 50%;
  background: transparent;
}
.cui-notif-center__item--unread .cui-notif-center__dot {
  background: var(--cui-color-teal);
}

.cui-notif-center__body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.cui-notif-center__item-title {
  font-size: 1.3rem;
  font-weight: 700;
}
.cui-notif-center__item--unread .cui-notif-center__item-title {
  color: var(--cui-heading);
}

.cui-notif-center__item-text {
  font-size: 1.2rem;
  color: var(--cui-text-muted);
}

.cui-notif-center__item-time {
  font-size: 1.1rem;
  /* grey-500 alone reads ~4:1 on white: short of the 4.5:1 AA text minimum
     text-muted is guaranteed to clear (see utils/palette.js). */
  color: var(--cui-text-muted);
}
</style>
