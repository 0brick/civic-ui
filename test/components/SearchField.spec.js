import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchField from '../../src/components/forms/SearchField.vue'

describe('SearchField', () => {
  // Two search landmarks on a page (site search + a table filter) must be
  // told apart in a screen reader's landmark list.
  it('names its search landmark with the label', () => {
    const wrapper = mount(SearchField, { props: { label: 'Filter tickets' } })
    expect(wrapper.attributes('role')).toBe('search')
    expect(wrapper.attributes('aria-label')).toBe('Filter tickets')
    expect(wrapper.find('label').text()).toBe('Filter tickets')
  })

  it('falls back to the catalog label', () => {
    expect(mount(SearchField).attributes('aria-label')).toBe('Search')
  })
})
