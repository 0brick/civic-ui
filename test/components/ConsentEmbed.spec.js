import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConsentEmbed from '../../src/components/content/ConsentEmbed.vue'
import { _resetCookieConsentForTests, revokeEmbedConsent } from '../../src/composables/useCookieConsent'
import { nextTick } from 'vue'

describe('ConsentEmbed', () => {
  beforeEach(() => {
    window.localStorage.clear()
    _resetCookieConsentForTests()
  })

  it('renders no iframe before consent, and names the provider', () => {
    const wrapper = mount(ConsentEmbed, { props: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'Konzert' } })
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.find('.cui-consent-embed__note').text()).toContain('YouTube (Google)')
    expect(wrapper.find('figcaption a').attributes('href')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })

  it('loads youtube-nocookie with autoplay after the click', async () => {
    const wrapper = mount(ConsentEmbed, { props: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'Konzert' }, attachTo: document.body })
    await wrapper.find('button').trigger('click')
    const iframe = wrapper.find('iframe')
    expect(iframe.attributes('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1')
    expect(iframe.attributes('title')).toBe('Konzert')
    expect(document.activeElement).toBe(iframe.element)
    wrapper.unmount()
  })

  it('adds dnt=1 for Vimeo', async () => {
    const wrapper = mount(ConsentEmbed, { props: { provider: 'vimeo', videoId: '76979871', title: 'V' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('iframe').attributes('src')).toContain('player.vimeo.com/video/76979871?dnt=1')
  })

  it('rejects an invalid video id and a non-http src', () => {
    expect(mount(ConsentEmbed, { props: { provider: 'youtube', videoId: '"><script>', title: 'T' } }).find('button').attributes('disabled')).toBeDefined()
    expect(mount(ConsentEmbed, { props: { src: 'javascript:alert(1)', title: 'T' } }).find('button').attributes('disabled')).toBeDefined()
  })

  it('takes custom texts, ratio and external link', () => {
    const wrapper = mount(ConsentEmbed, {
      props: { provider: 'osm', src: 'https://www.openstreetmap.org/export/embed.html?bbox=1,2,3,4', title: 'Map', ratio: '4/3', consentText: 'Custom note', loadLabel: 'Show map', externalLink: { label: 'Larger map', href: 'https://osm.org/x' } }
    })
    expect(wrapper.find('.cui-consent-embed__note').text()).toBe('Custom note')
    expect(wrapper.find('button').text()).toBe('Show map')
    expect(wrapper.find('.cui-consent-embed__frame').attributes('style')).toContain('aspect-ratio: 4/3')
    expect(wrapper.find('figcaption a').text()).toContain('Larger map')
  })

  it('remembers a ticked consent per provider', async () => {
    const first = mount(ConsentEmbed, { props: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'A', remember: true } })
    await first.find('input[type="checkbox"]').setValue(true)
    await first.find('button').trigger('click')
    const second = mount(ConsentEmbed, { props: { provider: 'youtube', videoId: 'abcdefghijk', title: 'B', remember: true } })
    const iframe = second.find('iframe')
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes('src')).not.toContain('autoplay')
    expect(mount(ConsentEmbed, { props: { provider: 'vimeo', videoId: '1', title: 'C', remember: true } }).find('iframe').exists()).toBe(false)
  })

  it('does not remember an unticked load', async () => {
    const first = mount(ConsentEmbed, { props: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'A', remember: true } })
    await first.find('button').trigger('click')
    expect(mount(ConsentEmbed, { props: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'B', remember: true } }).find('iframe').exists()).toBe(false)
  })

  // GDPR Art. 7(3): withdrawing as easy as consenting.
  const youtube = (extra = {}) => ({ props: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'A', remember: true, ...extra } })
  const rememberYoutube = async () => {
    const first = mount(ConsentEmbed, youtube())
    await first.find('input[type="checkbox"]').setValue(true)
    await first.find('button').trigger('click')
    return first
  }
  const revokeButton = (wrapper) => wrapper.find('.cui-consent-embed__revoke')

  it('offers no revoke button without a remembered consent', async () => {
    const wrapper = mount(ConsentEmbed, youtube())
    expect(revokeButton(wrapper).exists()).toBe(false)
    await wrapper.find('button').trigger('click') // loaded, but not remembered
    expect(revokeButton(wrapper).exists()).toBe(false)
  })

  it('revokes a remembered consent with one click in the caption', async () => {
    const first = await rememberYoutube()
    expect(revokeButton(first).text()).toBe('Stop always loading content from YouTube')
    const second = mount(ConsentEmbed, { ...youtube({ title: 'B' }), attachTo: document.body })
    await revokeButton(second).trigger('click')
    expect(window.localStorage.getItem('cui-consent-embed:youtube')).toBeNull()
    // takes effect at once, on every remembered embed of the provider
    expect(first.find('iframe').exists()).toBe(false)
    expect(second.find('iframe').exists()).toBe(false)
    expect(revokeButton(second).exists()).toBe(false)
    // focus moves to the load button instead of dropping to <body>
    await nextTick()
    expect(document.activeElement).toBe(second.find('.cui-consent-embed__panel button').element)
    expect(mount(ConsentEmbed, youtube({ title: 'C' })).find('iframe').exists()).toBe(false)
    second.unmount()
  })

  it('revokeEmbedConsent(provider) does the same from code', async () => {
    const first = await rememberYoutube()
    const vimeo = mount(ConsentEmbed, { props: { provider: 'vimeo', videoId: '76979871', title: 'V', remember: true } })
    await vimeo.find('input[type="checkbox"]').setValue(true)
    await vimeo.find('button').trigger('click')
    revokeEmbedConsent('youtube')
    await nextTick()
    expect(first.find('iframe').exists()).toBe(false)
    expect(vimeo.find('iframe').exists()).toBe(true)
  })

  it('a consent remembered by one embed loads the others on the page, without autoplay', async () => {
    const other = mount(ConsentEmbed, youtube({ videoId: 'abcdefghijk', title: 'B' }))
    expect(other.find('iframe').exists()).toBe(false)
    await rememberYoutube()
    const iframe = other.find('iframe')
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes('src')).not.toContain('autoplay')
  })
})
