// WCAG 2.1.1: a row action is reachable by keyboard; a real link (rowLink)
// or a button (row-click) in the first cell, stretched over the row.
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import DataTable from '../../src/components/content/DataTable.vue'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' }
]
const rows = [
  { id: 1, name: 'Ada', city: 'London' },
  { id: 2, name: 'Grace', city: 'New York' }
]

describe('DataTable row actions', () => {
  it('renders no row control without rowLink or row-click', () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })
    expect(wrapper.find('.cui-table__row-action').exists()).toBe(false)
    expect(wrapper.find('table').classes()).not.toContain('cui-table--row-action')
  })

  it('rowLink turns the first cell into a real link per row', () => {
    const wrapper = mount(DataTable, { props: { columns, rows, rowLink: (row) => `/people/${row.id}` } })
    const links = wrapper.findAll('tbody a.cui-table__row-action')
    expect(links.map((a) => a.attributes('href'))).toEqual(['/people/1', '/people/2'])
    expect(links[0].text()).toBe('Ada')
    expect(wrapper.find('table').classes()).toContain('cui-table--row-action')
  })

  it('rowLink accepts { href, newTab } and skips rows that return nothing', () => {
    const wrapper = mount(DataTable, {
      props: { columns, rows, rowLink: (row) => (row.id === 1 ? { href: 'https://example.org/ada', newTab: true, onclick: 'x' } : null) }
    })
    const links = wrapper.findAll('tbody a')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('target')).toBe('_blank')
    expect(links[0].attributes('onclick')).toBeUndefined()
  })

  it('keeps a cell slot inside the row link', () => {
    const wrapper = mount(DataTable, {
      props: { columns, rows, rowLink: (row) => `/people/${row.id}` },
      slots: { 'cell-name': ({ value }) => h('strong', value) }
    })
    expect(wrapper.find('tbody a strong').text()).toBe('Ada')
  })

  it('a row-click listener gets a keyboard-operable button in the first cell', async () => {
    const clicked = []
    const wrapper = mount(DataTable, { props: { columns, rows, onRowClick: (row) => clicked.push(row.id) } })
    const buttons = wrapper.findAll('tbody button.cui-table__row-action')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].attributes('type')).toBe('button')
    await buttons[1].trigger('click')
    expect(clicked).toEqual([2])
  })

  it('clicking another cell control does not fire row-click (no handler on the <tr>)', async () => {
    const clicked = []
    const wrapper = mount(DataTable, { props: { columns, rows, selectable: true, onRowClick: (row) => clicked.push(row.id) } })
    await wrapper.find('tbody tr').trigger('click')
    await wrapper.find('tbody input[type="checkbox"]').trigger('change')
    expect(clicked).toEqual([])
    expect(wrapper.emitted('update:selected')).toEqual([[[1]]])
  })
})
