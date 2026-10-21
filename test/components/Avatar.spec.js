// WCAG 4.1.2 / 1.4.1: the presence status is real text, not an aria-label on
// a role-less span, and not only a color.
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '../../src/components/content/Avatar.vue'
import { configureI18n, resetI18n } from '../../src/utils/i18n'
import { de } from '../../src/locales/index.js'

describe('Avatar status', () => {
  it('exposes the status as visually hidden text and hides the dot', () => {
    const wrapper = mount(Avatar, { props: { name: 'Ada Lovelace', status: 'online' } })
    const dot = wrapper.find('.cui-avatar__status')
    expect(dot.attributes('aria-hidden')).toBe('true')
    expect(dot.attributes('aria-label')).toBeUndefined()
    const hidden = wrapper.findAll('.cui-visually-hidden').map((n) => n.text())
    expect(hidden).toEqual(['Ada Lovelace', 'Online'])
  })

  it('names every status in words', () => {
    for (const [status, text] of [['busy', 'Busy'], ['away', 'Away'], ['offline', 'Offline'], ['danger', 'Error']]) {
      const wrapper = mount(Avatar, { props: { name: 'Ada', status } })
      expect(wrapper.text()).toContain(text)
    }
  })

  it('follows the locale', () => {
    configureI18n(de)
    try {
      expect(mount(Avatar, { props: { name: 'Ada', status: 'busy' } }).text()).toContain('Beschäftigt')
    } finally {
      resetI18n()
    }
  })

  it('renders no status text without a status', () => {
    const wrapper = mount(Avatar, { props: { name: 'Ada' } })
    expect(wrapper.find('.cui-avatar__status').exists()).toBe(false)
    expect(wrapper.findAll('.cui-visually-hidden').map((n) => n.text())).toEqual(['Ada'])
  })
})
