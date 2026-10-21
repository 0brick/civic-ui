// Theme configurator state, kept at module scope rather than inside
// ThemePage.vue so a chosen palette survives switching tabs: the palette
// stays applied to :root across the whole playground until a full page
// reload (which re-evaluates this module) or the Theme tab's Reset button.
import { reactive, ref } from 'vue'
import { presetPalettes, paletteRoles } from 'civic-ui'

export const mode = ref('preset')
export const presetKey = ref('default')
export const primaryColor = ref(presetPalettes.default.primary)

export const enabledRoles = reactive(Object.fromEntries(paletteRoles.map((r) => [r.key, r.key === 'primary'])))
export const roleValues = reactive({ ...presetPalettes.default })

export function resetThemeState() {
  mode.value = 'preset'
  presetKey.value = 'default'
  primaryColor.value = presetPalettes.default.primary
  for (const role of paletteRoles) {
    enabledRoles[role.key] = role.key === 'primary'
    roleValues[role.key] = presetPalettes.default[role.key]
  }
}
