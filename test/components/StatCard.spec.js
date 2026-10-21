import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '../../src/components/content/StatCard.vue'
import StatsSection from '../../src/sections/StatsSection.vue'

describe('StatCard for content', () => {
  it('keeps the dashboard tile as default', () => {
    const wrapper = mount(StatCard, { props: { label: 'Open cases', value: 12 } })
    expect(wrapper.classes()).toContain('cui-stat-card--dashboard')
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('renders highlight with an accent color and an action', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Annual fee', value: '€20', appearance: 'highlight', color: 'secondary', action: { label: 'Become a member', href: '/membership' } }
    })
    expect(wrapper.classes()).toContain('cui-stat-card--highlight')
    expect(wrapper.attributes('style')).toContain('--cui-stat-card-accent: #02767f')
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/membership')
    expect(link.text()).toContain('Become a member')
  })

  it('shows progress towards a goal', () => {
    const wrapper = mount(StatCard, { props: { label: 'Donations', value: '€9,000', goal: 15000, current: 9000, unit: '€' } })
    const bar = wrapper.find('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('9000')
    expect(bar.attributes('aria-valuemax')).toBe('15000')
    expect(bar.attributes('aria-label')).toMatch(/^60% of 15.000 € reached$/)
  })

  it('caps the bar at the goal and takes a custom label', () => {
    const wrapper = mount(StatCard, { props: { label: 'S', value: 'x', goal: 100, current: 140, progressLabel: 'Goal exceeded' } })
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.find('[role="progressbar"]').attributes('aria-label')).toBe('Goal exceeded')
  })
})

describe('StatsSection background/columns', () => {
  const stats = [
    { value: '€15,000', label: 'Building costs' },
    { value: '120', label: 'Students' }
  ]

  it('keeps the dark band by default', () => {
    const wrapper = mount(StatsSection, { props: { stats } })
    expect(wrapper.classes()).toContain('cui-section--dark')
    expect(wrapper.find('.cui-grid').classes()).toContain('cui-grid--4')
  })

  it('takes a light theme key and a fixed column count', () => {
    const wrapper = mount(StatsSection, { props: { stats, background: 'light', columns: 2 } })
    expect(wrapper.classes()).not.toContain('cui-section--dark')
    expect(wrapper.attributes('data-cui-theme')).toBeUndefined()
    expect(wrapper.attributes('style')).toContain('--cui-stats-bg: #ffffff')
    expect(wrapper.find('.cui-grid').classes()).toContain('cui-grid--2')
  })

  it('marks a dark theme key as dark', () => {
    expect(mount(StatsSection, { props: { stats, background: 'tertiary' } }).attributes('data-cui-theme')).toBe('dark')
  })
})

describe('StatCard trend direction (WCAG 1.3.1)', () => {
  it('spells out a fall, which is shown unsigned', () => {
    const trend = mount(StatCard, { props: { label: 'Visitors', value: 980, trend: -2.1 } }).find('.cui-stat-card__trend')
    expect(trend.text()).toContain('Down by 2.1%')
    expect(trend.find('.cui-visually-hidden').text()).toBe('Down by')
  })

  it('spells out a rise', () => {
    const trend = mount(StatCard, { props: { label: 'Visitors', value: 980, trend: 4.2 } }).find('.cui-stat-card__trend')
    expect(trend.text()).toContain('Up by 4.2%')
  })

  it('adds nothing for an unchanged value', () => {
    const trend = mount(StatCard, { props: { label: 'Visitors', value: 980, trend: 0 } }).find('.cui-stat-card__trend')
    expect(trend.find('.cui-visually-hidden').exists()).toBe(false)
  })
})

