import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUpload from '../../src/components/forms/FileUpload.vue'

const file = (name, type, size = 10) => new File([new Uint8Array(size)], name, { type })
const drop = (wrapper, files) => wrapper.find('.cui-file-upload').trigger('drop', { dataTransfer: { files } })

describe('FileUpload limits', () => {
  it('enforces accept for dropped files and reports rejects', async () => {
    const wrapper = mount(FileUpload, { props: { accept: '.pdf,image/*' } })
    await drop(wrapper, [file('invoice.pdf.exe', 'application/x-msdownload'), file('a.pdf', 'application/pdf'), file('p.png', 'image/png')])
    expect(wrapper.emitted('update:modelValue')[0][0].map((f) => f.name)).toEqual(['a.pdf', 'p.png'])
    expect(wrapper.emitted('reject')[0][0]).toMatchObject([{ reason: 'type' }])
  })

  it('enforces maxSize and maxFiles', async () => {
    const wrapper = mount(FileUpload, { props: { maxSize: 100, maxFiles: 2, modelValue: [file('old.txt', 'text/plain')] } })
    await drop(wrapper, [file('big.txt', 'text/plain', 500), file('a.txt', 'text/plain'), file('b.txt', 'text/plain')])
    expect(wrapper.emitted('update:modelValue')[0][0].map((f) => f.name)).toEqual(['old.txt', 'a.txt'])
    expect(wrapper.emitted('reject')[0][0].map((r) => r.reason)).toEqual(['size', 'count'])
  })

  it('keeps only one file without multiple', async () => {
    const wrapper = mount(FileUpload, { props: { multiple: false } })
    await drop(wrapper, [file('a.txt', 'text/plain'), file('b.txt', 'text/plain')])
    expect(wrapper.emitted('update:modelValue')[0][0]).toHaveLength(1)
    expect(wrapper.emitted('reject')[0][0]).toMatchObject([{ reason: 'count' }])
  })
})
