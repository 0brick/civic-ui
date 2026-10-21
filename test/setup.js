// jsdom doesn't implement IntersectionObserver, which useReveal/useScrollspy
// rely on for scroll-triggered animation and nav-highlighting. A no-op stub
// is enough for components to mount; behavior of the observer itself isn't
// under test here.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

globalThis.IntersectionObserver = IntersectionObserverStub
