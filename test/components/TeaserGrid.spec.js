import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TeaserGrid from '../../src/sections/TeaserGrid.vue'

const items = [{ title: 'A' }, { title: 'B' }, { title: 'C' }, { title: 'D' }]

describe('TeaserGrid', () => {
  it('defaults to three columns and accepts 2/4/auto', () => {
    expect(mount(TeaserGrid, { props: { title: 'T', items } }).find('.cui-grid').classes()).toContain('cui-grid--3')
    expect(mount(TeaserGrid, { props: { title: 'T', items, columns: 4 } }).find('.cui-grid').classes()).toContain('cui-grid--4')
    expect(mount(TeaserGrid, { props: { title: 'T', items, columns: 'auto' } }).find('.cui-grid').classes()).toContain('cui-teaser-grid__grid--auto')
  })

  it('works without a title and keeps a hidden one as the section name', () => {
    const untitled = mount(TeaserGrid, { props: { items } })
    expect(untitled.find('h2').exists()).toBe(false)
    expect(untitled.find('.cui-teaser-grid__intro').exists()).toBe(false)

    const hidden = mount(TeaserGrid, { props: { title: 'Aktuelles', titleHidden: true, items } })
    const h2 = hidden.find('h2')
    expect(h2.classes()).toContain('cui-visually-hidden')
    expect(hidden.attributes('aria-labelledby')).toBe(h2.attributes('id'))
  })

  it('takes the subtle background', () => {
    expect(mount(TeaserGrid, { props: { title: 'T', items, subtle: true } }).classes()).toContain('cui-section--subtle')
  })
})
