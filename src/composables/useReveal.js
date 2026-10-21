// Scroll-into-view fade/rise animation used across full-bleed content
// sections (MediaTextSection, StepsSection…).
// A directive rather than a wrapper component, so it attaches directly to
// whatever element a section already renders: no extra markup, and a
// consumer who never uses it pays nothing for it.
const observers = new WeakMap()

export const vReveal = {
  mounted(el, binding) {
    el.classList.add('cui-reveal')
    const delay = typeof binding.value === 'number' ? binding.value : binding.value?.delay
    if (delay) el.style.transitionDelay = `${delay}ms`

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.classList.add('cui-reveal--visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    observers.set(el, observer)
  },
  unmounted(el) {
    observers.get(el)?.disconnect()
    observers.delete(el)
  }
}
