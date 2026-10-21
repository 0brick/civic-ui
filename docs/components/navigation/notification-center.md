# NotificationCenter

A bell-icon dropdown for a webapp header: an unread-count badge, a scrollable list of notifications, and a "mark all read" affordance. Feed it plain data: it doesn't track read state itself, it just emits back which item (or "all") was acknowledged.

## Import

```js
import { NotificationCenter } from 'civic-ui'
```

## Basic usage

`items` is the only prop. Without listening for its events, items stay as passed in:

```vue
<script setup>
import { NotificationCenter } from 'civic-ui'

const items = [
  { id: 1, title: 'New ticket assigned', time: '5 min ago', read: false },
  { id: 2, title: 'Report ready', time: 'yesterday', read: true }
]
</script>

<template>
  <NotificationCenter :items="items" />
</template>
```

## Marking items read

Listen for `mark-read` and `mark-all-read` and update your own data, `NotificationCenter` re-renders from whatever `items` you pass back in:

```vue
<script setup>
import { ref } from 'vue'
import { NotificationCenter } from 'civic-ui'

const items = ref([
  { id: 1, title: 'New ticket assigned', text: 'Ticket #4474 has been assigned to you.', time: '5 min ago', read: false },
  { id: 2, title: 'New comment', text: 'C. Nowak commented on ticket #4472.', time: '1 hour ago', read: false },
  { id: 3, title: 'Report ready', text: 'The weekly report has been generated.', time: 'yesterday', read: true }
])

function markRead(id) {
  const item = items.value.find((n) => n.id === id)
  if (item) item.read = true
}
function markAllRead() {
  items.value.forEach((n) => (n.read = true))
}
</script>

<template>
  <NotificationCenter :items="items" @mark-read="markRead" @mark-all-read="markAllRead" />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ id, title, text?, time?, read? }[]` | `[]` | `text` and `time` are optional secondary lines; `read` controls the unread dot and whether the item counts toward the badge. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `mark-read` | `id` | Fires when a single notification row is clicked. |
| `mark-all-read` | | Fires when "Mark all read" is clicked (only shown while there's at least one unread item). |

## Accessibility notes

Each notification is a real `<button>`. Unread rows start their accessible name with "Unread:" (`notifications.unreadItem`) and are described by "Mark as read" (`notifications.markRead`), so read/unread isn't conveyed by the dot and the bolder title alone (WCAG 1.3.1). The bell's name includes the unread count.
