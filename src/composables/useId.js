// Stable, unique-per-instance id for wiring aria-* attributes between a
// control and its label/panel, without forcing every consumer to pass one.
let counter = 0

export function useId(prefix = 'au') {
  counter += 1
  return `${prefix}-${counter}`
}
