// WCAG 1.3.1: read/unread is not only the dot and a bolder title.
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationCenter from '../../src/components/navigation/NotificationCenter.vue'

const items = [
  { id: 1, title: 'New reply', text: 'Ada answered', read: false },
  { id: 2, title: 'Saved', read: true }
]

async function open() {
  const wrapper = mount(NotificationCenter, { props: { items }, attachTo: document.body })
  await wrapper.find('.cui-notif-center__trigger').trigger('click')
  return wrapper
}

describe('NotificationCenter', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('starts the name of an unread row with "Unread"', async () => {
    const wrapper = await open()
    const [unread, read] = wrapper.findAll('.cui-notif-center__item')
    expect(unread.text()).toMatch(/^Unread: New reply/)
    expect(read.text()).not.toMatch(/Unread/)
  })

  it('describes what pressing an unread row does', async () => {
    const wrapper = await open()
    const [unread, read] = wrapper.findAll('.cui-notif-center__item')
    const id = unread.attributes('aria-describedby')
    expect(id).toBeTruthy()
    expect(document.getElementById(id).textContent).toBe('Mark as read')
    expect(read.attributes('aria-describedby')).toBeUndefined()
  })

  it('still emits mark-read', async () => {
    const wrapper = await open()
    await wrapper.findAll('.cui-notif-center__item')[0].trigger('click')
    expect(wrapper.emitted('mark-read')).toEqual([[1]])
  })
})
