import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DescriptionList from '../../src/components/content/DescriptionList.vue'
import { useToast } from '../../src/composables/useToast'

const items = [
  { term: 'Account holder', value: 'Nordholm Civic Association' },
  { term: 'IBAN', value: 'DE12 3456 7890 1234 5678 90', emphasis: true, copyable: true },
  { term: 'Web', value: 'example.org', href: 'https://example.org', newTab: true }
]

describe('DescriptionList', () => {
  afterEach(() => {
    const { toasts, dismiss } = useToast()
    ;[...toasts].forEach((toast) => dismiss(toast.id))
  })

  it('renders a <dl> with one dt/dd pair per item', () => {
    const wrapper = mount(DescriptionList, { props: { items } })
    expect(wrapper.element.tagName).toBe('DL')
    expect(wrapper.findAll('dt').map((dt) => dt.text())).toEqual(['Account holder', 'IBAN', 'Web'])
    expect(wrapper.findAll('dd')).toHaveLength(3)
    expect(wrapper.classes()).toContain('cui-description-list--inline')
  })

  it('applies layout and size, and emphasis per item', () => {
    const wrapper = mount(DescriptionList, { props: { items, layout: 'stacked', size: 'lg' } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['cui-description-list--stacked', 'cui-description-list--lg']))
    expect(wrapper.findAll('dd')[1].classes()).toContain('cui-description-list__value--emphasis')
  })

  it('renders href values as links, with target/rel for newTab', () => {
    const link = mount(DescriptionList, { props: { items } }).find('dd a')
    expect(link.attributes('href')).toBe('https://example.org')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
  })

  it('copies a copyable value and confirms with a toast', async () => {
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(DescriptionList, { props: { items } })
    const button = wrapper.find('.cui-description-list__copy')
    expect(wrapper.findAll('.cui-description-list__copy')).toHaveLength(1)
    expect(button.attributes('aria-label')).toBe('Copy IBAN')
    await button.trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('DE12 3456 7890 1234 5678 90')
    expect(useToast().toasts.at(-1)).toMatchObject({ variant: 'success', message: 'IBAN copied to the clipboard' })
    vi.unstubAllGlobals()
  })
})
