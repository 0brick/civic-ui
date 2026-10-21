<script setup>
// A layout primitive, not a styled widget: a row that keeps a search/filter
// cluster on one side and actions on the other, and stacks cleanly on
// narrow screens. Drop TextInput/Select/AppButton (or SearchField) inside.
defineProps({
  wrap: { type: Boolean, default: true }
})
</script>

<template>
  <div class="cui-toolbar" :class="{ 'cui-toolbar--wrap': wrap }">
    <div class="cui-toolbar__start"><slot name="start" /></div>
    <div class="cui-toolbar__end"><slot name="end" /></div>
  </div>
</template>

<style scoped>
.cui-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-4);
}

.cui-toolbar--wrap {
  flex-wrap: wrap;
}

.cui-toolbar__start,
.cui-toolbar__end {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  flex-wrap: wrap;
}
</style>
