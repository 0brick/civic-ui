import { describe, it, expect, beforeEach } from 'vitest'
import {
  configureSecurity,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeMediaUrl,
  sanitizeCssUrl,
  hasOwn,
  _resetSecurityForTests
} from '../../src/utils/security.js'

describe('sanitizeUrl', () => {
  beforeEach(() => configureSecurity({ sanitizeHtml: null, sanitizeUrl: null, sanitizeMediaUrl: null }))

  it('passes through ordinary links unchanged', () => {
    expect(sanitizeUrl('https://example.org/page')).toBe('https://example.org/page')
    expect(sanitizeUrl('/relative/path')).toBe('/relative/path')
    expect(sanitizeUrl('#fragment')).toBe('#fragment')
    expect(sanitizeUrl('mailto:a@example.org')).toBe('mailto:a@example.org')
    expect(sanitizeUrl('tel:+491234')).toBe('tel:+491234')
  })

  it('blocks javascript:, vbscript: and data: schemes', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#')
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#')
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
  })

  it('blocks obfuscated schemes using control chars/whitespace/case', () => {
    expect(sanitizeUrl('  javascript:alert(1)')).toBe('#')
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('#')
    expect(sanitizeUrl('java\tscript:alert(1)')).toBe('#')
    expect(sanitizeUrl('\njavascript:alert(1)')).toBe('#')
  })

  it('leaves non-string/empty values untouched', () => {
    expect(sanitizeUrl('')).toBe('')
    expect(sanitizeUrl(null)).toBe(null)
    expect(sanitizeUrl(undefined)).toBe(undefined)
  })

  it('defers to a custom sanitizer registered via configureSecurity', () => {
    configureSecurity({ sanitizeUrl: (v) => `custom:${v}` })
    expect(sanitizeUrl('https://example.org')).toBe('custom:https://example.org')
  })
})

describe('sanitizeMediaUrl', () => {
  beforeEach(() => configureSecurity({ sanitizeHtml: null, sanitizeUrl: null, sanitizeMediaUrl: null }))

  it('allows data:image URIs (legitimate inline previews)', () => {
    expect(sanitizeMediaUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
  })

  it('blocks scriptable schemes', () => {
    expect(sanitizeMediaUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeMediaUrl('vbscript:msgbox(1)')).toBe('')
  })
})

describe('sanitizeCssUrl', () => {
  it('wraps a safe value in a quoted url()', () => {
    expect(sanitizeCssUrl('/images/hero.jpg')).toBe('url("/images/hero.jpg")')
  })

  it('escapes quotes and backslashes', () => {
    expect(sanitizeCssUrl('/images/"evil".jpg')).toBe('url("/images/\\"evil\\".jpg")')
  })

  it('falls back to none for a blocked/empty value', () => {
    expect(sanitizeCssUrl('javascript:alert(1)')).toBe('none')
    expect(sanitizeCssUrl('')).toBe('none')
  })
})

describe('sanitizeHtml', () => {
  it('is an identity passthrough by default', () => {
    expect(sanitizeHtml('<svg></svg>')).toBe('<svg></svg>')
  })

  it('defers to a custom sanitizer once registered', () => {
    configureSecurity({ sanitizeHtml: (raw) => raw.replace(/</g, '') })
    expect(sanitizeHtml('<svg>')).toBe('svg>')
    configureSecurity({ sanitizeHtml: null })
  })
})

describe('hasOwn', () => {
  it('is true only for the object\'s own keys', () => {
    expect(hasOwn({ a: 1 }, 'a')).toBe(true)
    expect(hasOwn({ a: 1 }, 'b')).toBe(false)
  })

  it('does not fall through to Object.prototype for dangerous keys', () => {
    expect(hasOwn({}, 'constructor')).toBe(false)
    expect(hasOwn({}, 'toString')).toBe(false)
    expect(hasOwn({}, '__proto__')).toBe(false)
  })
})

describe('sanitizeUrl / sanitizeMediaUrl hardening', () => {
  beforeEach(() => _resetSecurityForTests())

  it('checks non-string values as the string Vue would render', () => {
    expect(sanitizeUrl(['javascript:alert(1)'])).toBe('#')
    expect(sanitizeUrl({ toString: () => 'javascript:alert(1)' })).toBe('#')
    expect(sanitizeUrl(new URL('https://example.org/a'))).toBe('https://example.org/a')
    expect(sanitizeUrl({ toString: () => { throw new Error('x') } })).toBe('#')
    expect(sanitizeMediaUrl(['javascript:alert(1)'])).toBe('')
  })

  it('passes the normalized string to a custom sanitizer', () => {
    const seen = []
    configureSecurity({ sanitizeUrl: (v) => (seen.push(v), v) })
    sanitizeUrl(['https://x.example'])
    expect(seen).toEqual(['https://x.example'])
  })

  it('allows only http/https/mailto/tel and scheme-less links by default', () => {
    for (const bad of ['file:///etc/passwd', 'ms-msdt:/id PCWDiagnostic', 'search-ms:query=x', 'intent://x#Intent;end', 'blob:https://x/1']) {
      expect(sanitizeUrl(bad), bad).toBe('#')
    }
    expect(sanitizeUrl('//cdn.example/x')).toBe('//cdn.example/x')
    expect(sanitizeUrl('?page=2')).toBe('?page=2')
  })

  it('lets a host extend the scheme allowlist', () => {
    configureSecurity({ allowedUrlSchemes: ['https:', 'sms:'] })
    expect(sanitizeUrl('sms:+491234')).toBe('sms:+491234')
    expect(sanitizeUrl('http://example.org')).toBe('#')
  })

  it('allows blob: and data:image media, but not data:text/html', () => {
    expect(sanitizeMediaUrl('blob:https://x/1')).toBe('blob:https://x/1')
    expect(sanitizeMediaUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
    expect(sanitizeMediaUrl('data:text/html,<script>')).toBe('')
    expect(sanitizeMediaUrl('file:///x.png')).toBe('')
  })
})

describe('configureSecurity fails closed', () => {
  beforeEach(() => _resetSecurityForTests())

  it('throws for a sanitizer that is not a function', () => {
    expect(() => configureSecurity({ sanitizeHtml: { sanitize: (v) => v } })).toThrow(TypeError)
  })

  it('can be locked against later changes', () => {
    configureSecurity({ sanitizeHtml: (v) => v }, { lock: true })
    expect(() => configureSecurity({ sanitizeHtml: null })).toThrow(/locked/)
  })
})

describe('built-in sanitizeHtml default', () => {
  beforeEach(() => _resetSecurityForTests())

  it('keeps simple rich text: headings, paragraphs, lists, links, tables, code', () => {
    const html = '<h2 id="intro">Intro</h2><p>A <strong>b</strong> <a href="/x" target="_blank">link</a></p><ul><li>one</li></ul><table><tr><td colspan="2"><code>x</code></td></tr></table>'
    const out = sanitizeHtml(html)
    for (const part of ['<h2 id="intro">', '<strong>b</strong>', 'href="/x"', 'rel="noopener noreferrer"', '<li>one</li>', 'colspan="2"', '<code>x</code>']) {
      expect(out, part).toContain(part)
    }
  })

  it('unwraps unknown elements but keeps their text', () => {
    expect(sanitizeHtml('<section><font color="red">Hallo</font></section>')).toBe('Hallo')
  })

  it('keeps ordinary SVG icon markup', () => {
    const svg = '<svg viewBox="0 0 20 20" fill="none"><path d="M3 6h14" stroke="currentColor" stroke-width="1.8"></path></svg>'
    const out = sanitizeHtml(svg)
    expect(out).toContain('<path d="M3 6h14"')
    expect(out).toContain('viewBox="0 0 20 20"')
  })

  it('drops event handlers, scripts, external url() and non-local <use>', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).not.toContain('onerror')
    expect(sanitizeHtml('<svg><script>alert(1)</script><path d="M0 0"/></svg>')).not.toContain('script')
    expect(sanitizeHtml('<svg><rect fill="url(https://tracker/p.gif)"/></svg>')).not.toContain('tracker')
    expect(sanitizeHtml('<svg><rect fill="url(#grad)"/></svg>')).toContain('url(#grad)')
    expect(sanitizeHtml('<svg><use href="https://evil/sprite.svg#x"/></svg>')).not.toContain('evil')
    expect(sanitizeHtml('<svg style="background:url(//x)"><path/></svg>')).toBe('<svg><path></path></svg>')
    expect(sanitizeHtml('<a href="javascript:1">x</a>')).toBe('<a href="#">x</a>')
    expect(sanitizeHtml('<iframe src="https://evil"></iframe><form action="//evil"><input name="cookie"></form>ok')).toBe('ok')
    expect(sanitizeHtml('<img name="cookie" src="/a.png">')).not.toContain('name=')
    expect(sanitizeHtml('<img src="javascript:alert(1)">')).not.toContain('javascript')
  })
})

describe('RelatedLinks per-link tag', () => {
  it('ignores element names outside the link allowlist', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: RelatedLinks } = await import('../../src/sections/RelatedLinks.vue')
    const wrapper = mount(RelatedLinks, { props: { links: [{ label: 'x', href: 'https://attacker.example/', tag: 'base' }, { label: 'y', href: '/y', tag: 'a' }] } })
    expect(wrapper.find('base').exists()).toBe(false)
    expect(wrapper.findAll('a')).toHaveLength(2)
  })
})

describe('media sinks use sanitizeMediaUrl and a referrer policy', () => {
  beforeEach(() => _resetSecurityForTests())

  it('applies a host media allowlist to every <img>/<video> sink', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: Card } = await import('../../src/components/content/Card.vue')
    const { default: Avatar } = await import('../../src/components/content/Avatar.vue')
    const { default: AppButton } = await import('../../src/components/button/AppButton.vue')
    const { default: HeroSection } = await import('../../src/sections/HeroSection.vue')
    const { default: MediaTextSection } = await import('../../src/sections/MediaTextSection.vue')
    configureSecurity({ sanitizeMediaUrl: (v) => (v.startsWith('https://cdn.example/') ? v : '') })
    const tracker = 'https://tracker.example/p.gif'
    const srcs = [
      mount(Card, { props: { title: 'T', media: tracker } }).find('img'),
      mount(Avatar, { props: { src: tracker, name: 'A B' } }).find('img'),
      mount(AppButton, { props: { icon: tracker }, slots: { default: 'x' } }).find('img'),
      mount(HeroSection, { props: { title: 'H', image: tracker } }).find('img'),
      mount(MediaTextSection, { props: { title: 'M', image: tracker } }).find('img')
    ]
    for (const img of srcs) expect(img.exists() ? img.attributes('src') || '' : '').not.toContain('tracker')
    const video = mount(HeroSection, { props: { title: 'H', stage: true, video: tracker, videoPoster: tracker } }).find('video')
    expect(video.attributes('src') || '').not.toContain('tracker')
    expect(video.attributes('poster') || '').not.toContain('tracker')
  })

  it('sets referrerpolicy on images, configurable', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: Card } = await import('../../src/components/content/Card.vue')
    const img = () => mount(Card, { props: { title: 'T', media: 'https://img.example/a.jpg' } }).find('img')
    expect(img().attributes('referrerpolicy')).toBe('strict-origin-when-cross-origin')
    configureSecurity({ referrerPolicy: 'no-referrer' })
    expect(img().attributes('referrerpolicy')).toBe('no-referrer')
    expect(() => configureSecurity({ referrerPolicy: 'bogus' })).toThrow(TypeError)
  })
})
