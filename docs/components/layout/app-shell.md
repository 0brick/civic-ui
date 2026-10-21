# AppShell

The fastest path to a webapp screen, as opposed to a marketing page: a fixed sidebar, a top bar strip for search/notifications/a user menu, and a scrollable content area. Below 1024px the sidebar collapses into a `Modal` drawer automatically. It's the webapp counterpart to `SiteHeader` + `SiteFooter` for marketing pages.

## Import

```js
import { AppShell } from 'civic-ui'
```

## Basic usage

At minimum, `AppShell` needs sidebar content (the `sidebar` slot) and main content (the default slot). The top bar and its search/notification/user-menu slots are entirely optional:

```vue
<script setup>
import { AppShell } from 'civic-ui'
</script>

<template>
  <div style="height: 420px; border: 1px solid var(--cui-border); border-radius: var(--cui-radius-lg); overflow: hidden;">
    <AppShell title="Resident portal">
      <template #sidebar>
        <nav style="padding: var(--cui-space-4); display: flex; flex-direction: column; gap: var(--cui-space-2);">
          <a href="#" style="font-weight: 600;">Overview</a>
          <a href="#">Applications</a>
          <a href="#">Documents</a>
        </nav>
      </template>
      <h1 style="margin-top: 0;">Welcome back, Anna</h1>
      <p>Your building permit application is under review.</p>
    </AppShell>
  </div>
</template>
```

## Full application shell

A realistic dashboard screen: the `Sidebar` component for navigation, a search field and user menu in the top bar, and a data table for content:

```vue
<script setup>
import { ref, computed } from 'vue'
import {
  AppButton,
  AppShell,
  DataTable,
  Dropdown,
  NotificationCenter,
  SearchField,
  Sidebar,
  StatCard,
  StatusDot,
  Toolbar,
  useToast
} from 'civic-ui'

const toast = useToast()
const sidebarCollapsed = ref(false)

const icon =
  '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 8h14" stroke="currentColor" stroke-width="1.6"/></svg>'
const sidebarItems = [
  { label: 'Overview', icon, active: true, href: '#' },
  { label: 'Tickets', icon, href: '#' },
  { label: 'Reports', icon, href: '#' },
  { label: 'Settings', icon, href: '#' }
]

const notificationItems = ref([
  { id: 1, title: 'New ticket assigned', text: 'Ticket #4474 has been assigned to you.', time: '5 min ago', read: false },
  { id: 2, title: 'New comment', text: 'C. Nowak commented on ticket #4472.', time: '1 hour ago', read: false }
])
function markRead(id) {
  const item = notificationItems.value.find((n) => n.id === id)
  if (item) item.read = true
}
function markAllRead() {
  notificationItems.value.forEach((n) => (n.read = true))
}

const columns = [
  { key: 'name', label: 'Ticket', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true }
]
const rows = ref([
  { id: 1, name: 'Ticket #4471', status: 'open', owner: 'A. Berger' },
  { id: 2, name: 'Ticket #4472', status: 'in review', owner: 'C. Nowak' },
  { id: 3, name: 'Ticket #4473', status: 'closed', owner: 'A. Berger' }
])
const sortBy = ref('')
const sortDir = ref('asc')
const sortedRows = computed(() => {
  if (!sortBy.value) return rows.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...rows.value].sort((a, b) => (a[sortBy.value] < b[sortBy.value] ? -1 : a[sortBy.value] > b[sortBy.value] ? 1 : 0) * dir)
})
</script>

<template>
  <div style="height: 640px; border: 1px solid var(--cui-border); border-radius: var(--cui-radius-lg); overflow: hidden;">
    <AppShell title="Application">
      <template #sidebar>
        <Sidebar :items="sidebarItems" :collapsed="sidebarCollapsed">
          <template #header><strong>Example App</strong></template>
          <template #footer>
            <AppButton variant="ghost" size="sm" block @click="sidebarCollapsed = !sidebarCollapsed">
              {{ sidebarCollapsed ? 'Expand' : 'Collapse' }}
            </AppButton>
          </template>
        </Sidebar>
      </template>
      <template #topbar-start>
        <SearchField size="sm" placeholder="Search…" @search="(q) => toast.info(`Search: ${q}`)" />
      </template>
      <template #topbar-end>
        <NotificationCenter :items="notificationItems" @mark-read="markRead" @mark-all-read="markAllRead" />
        <Dropdown trigger-variant="user" name="Anna Berger" role="Administrator">
          <a href="#">Profile</a>
          <button type="button">Sign out</button>
        </Dropdown>
      </template>

      <div class="cui-grid cui-grid--3" style="margin-bottom: var(--cui-space-4);">
        <StatCard label="Open tickets" value="128" :trend="4.2" trend-label="vs. last week" invert />
        <StatCard label="Resolved" value="812" :trend="12.6" trend-label="this month" />
        <StatCard label="Overdue" value="6" :trend="0" trend-label="unchanged" invert />
      </div>

      <Toolbar style="margin-bottom: var(--cui-space-4);">
        <template #start><SearchField size="sm" placeholder="Filter tickets…" /></template>
        <template #end><AppButton variant="primary" size="sm">New ticket</AppButton></template>
      </Toolbar>

      <DataTable :columns="columns" :rows="sortedRows" v-model:sort-by="sortBy" v-model:sort-dir="sortDir" striped>
        <template #cell-status="{ value }">
          <StatusDot :status="value === 'open' ? 'warning' : value === 'closed' ? 'success' : 'neutral'" :label="value" />
        </template>
      </DataTable>
    </AppShell>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `''` | Used as the mobile offcanvas title (the drawer the sidebar collapses into below 1024px). |
| `menuLabel` | `string` | `'Menu'` | Drawer title when `title` is empty. |
| `toggleLabel` | `string` | `'Toggle navigation menu'` | Accessible name of the hamburger button. |
| `closeLabel` | `string` | `'Close dialog'` | Accessible name of the drawer's close button. |
| `skipLabel` | `string` | `'Skip to main content'` | Text of the skip link. |

## Slots

| Slot | Notes |
|---|---|
| `sidebar` | Sidebar content, shown as a fixed column on desktop and inside a drawer `Modal` below 1024px. |
| `topbar-start` | Left side of the sticky top bar: typically a search field. |
| `topbar-end` | Right side of the sticky top bar: typically notifications and a user menu. |
| `default` | Main scrollable content area. |

## Accessibility notes

`AppShell` renders its own skip link ("Skip to main content") pointing straight at the `<main>` landmark it owns, so no consumer configuration is needed to satisfy WCAG 2.4.1 (Bypass Blocks). Below 1024px, the sidebar is reachable through a labeled "Toggle navigation menu" button that opens it as a focus-trapped `Modal` drawer. The button says what it opens (`aria-haspopup="dialog"`), which element (`aria-controls`, the drawer's id) and whether it's open (`aria-expanded`).
