import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomePage from '../../playground/src/pages/HomePage.vue'
import { mode, presetKey, resetThemeState } from '../../playground/src/utils/themeState.js'

describe('playground HomePage hero background', () => {
  beforeEach(() => {
    resetThemeState()
  })

  it('keeps the default hero background outside preset mode', () => {
    mode.value = 'primary'
    presetKey.value = 'forest'
    const wrapper = mount(HomePage)

    expect(wrapper.text()).toContain('Academy of Fine Arts, Dresden: a few streets from where Civic UI is built')
  })

  it('switches hero media and caption for forest, burgundy and slate presets', () => {
    const cases = [
      ['forest', 'Forest theme: green urban parks and calm, nature-first public spaces'],
      ['burgundy', 'Burgundy theme: historic civic architecture in warm, rich tones'],
      ['slate', 'Slate theme: modern city skylines with calm, cool contrast']
    ]

    for (const [preset, expectedCaption] of cases) {
      mode.value = 'preset'
      presetKey.value = preset
      const wrapper = mount(HomePage)
      expect(wrapper.text()).toContain(expectedCaption)
      wrapper.unmount()
    }
  })
})
