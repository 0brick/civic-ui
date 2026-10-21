// WCAG 4.1.3: toasts are rendered into live regions that already exist
// before the first toast arrives, instead of bringing their own role along.
import { describe, it, expect, afterEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ToastContainer from '../../src/components/feedback/ToastContainer.vue'
import Toast from '../../src/components/feedback/Toast.vue'
import { useToast } from '../../src/composables/useToast.js'

const body = () => new DOMWrapper(document.body)

describe('ToastContainer live regions', () => {
  const toast = useToast()
  afterEach(() => {
    toast.toasts.splice(0).forEach((t) => toast.dismiss(t.id))
    document.body.innerHTML = ''
  })

  it('renders an assertive and a polite region before any toast exists', () => {
    mount(ToastContainer, { attachTo: document.body })
    const regions = body().findAll('.cui-toast-region')
    expect(regions.map((r) => r.attributes('aria-live'))).toEqual(['assertive', 'polite'])
    expect(body().findAll('.cui-toast')).toHaveLength(0)
  })

  it('puts urgent toasts in the assertive region and the rest in the polite one', async () => {
    mount(ToastContainer, { attachTo: document.body, global: { stubs: { transition: false } } })
    toast.success('Saved.')
    toast.danger('Failed.')
    toast.warning('Careful.')
    await nextTick()
    const [assertive, polite] = body().findAll('.cui-toast-region')
    expect(assertive.findAll('.cui-toast').map((t) => t.text())).toEqual([expect.stringContaining('Failed.'), expect.stringContaining('Careful.')])
    expect(polite.findAll('.cui-toast').map((t) => t.text())).toEqual([expect.stringContaining('Saved.')])
  })

  it('the toasts inside carry no live role of their own', async () => {
    mount(ToastContainer, { attachTo: document.body, global: { stubs: { transition: false } } })
    toast.danger('Failed.')
    await nextTick()
    const el = body().find('.cui-toast')
    expect(el.attributes('role')).toBeUndefined()
    expect(el.attributes('aria-live')).toBeUndefined()
  })

  it('a standalone Toast keeps its own role', () => {
    expect(mount(Toast, { props: { variant: 'danger' } }).attributes('role')).toBe('alert')
    expect(mount(Toast, { props: { variant: 'success' } }).attributes('role')).toBe('status')
  })
})
