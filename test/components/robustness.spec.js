// CMS/API data is often missing, still loading, or reset to null by a form,
// list-driven components must render an empty state instead of crashing.
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from '../../src/components/content/DataTable.vue'
import AccordionItem from '../../src/components/content/AccordionItem.vue'
import FileUpload from '../../src/components/forms/FileUpload.vue'
import TagInput from '../../src/components/forms/TagInput.vue'
import ScrollspyNav from '../../src/components/navigation/ScrollspyNav.vue'
import Tabs from '../../src/components/navigation/Tabs.vue'

const quiet = { global: { config: { warnHandler: () => {} } } }

describe('list props that are missing or null', () => {
  it('DataTable renders its empty state without columns or rows', () => {
    const wrapper = mount(DataTable, { props: { rows: null, selected: null }, ...quiet })
    expect(wrapper.find('.cui-table').exists()).toBe(true)
  })

  it('DataTable reads cell values from own properties only', () => {
    const wrapper = mount(DataTable, { props: { columns: [{ key: 'constructor', label: 'C' }], rows: [{ id: 1 }] } })
    expect(wrapper.find('tbody td').text()).toBe('')
  })

  it('FileUpload and TagInput treat a null v-model as empty', () => {
    expect(mount(FileUpload, { props: { modelValue: null }, ...quiet }).find('.cui-file-upload__list').exists()).toBe(false)
    expect(mount(TagInput, { props: { modelValue: null }, ...quiet }).find('input').attributes('placeholder')).toBeTruthy()
  })

  it('ScrollspyNav and Tabs render empty without items', () => {
    expect(mount(ScrollspyNav, quiet).findAll('a')).toHaveLength(0)
    expect(mount(Tabs, quiet).findAll('[role="tab"]')).toHaveLength(0)
  })

  it('AccordionItem works on its own, outside an Accordion', async () => {
    const wrapper = mount(AccordionItem, { props: { title: 'Q' }, slots: { default: 'A' } })
    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })
})
