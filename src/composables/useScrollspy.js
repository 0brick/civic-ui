// Tracks which of a set of section ids is currently in view, using
// IntersectionObserver (cheaper and jank-free compared to a scroll
// listener). Feed the returned `activeId` into any nav to highlight the
// current section: see <ScrollspyNav> for the ready-made version.
import { ref, toValue, onMounted, onBeforeUnmount, watch } from 'vue'

// `ids` may be a plain array, a ref, or a getter: normalized via toValue()
// so a caller whose id list loads or changes after mount (e.g. async
// sections) still gets re-observed instead of stuck on a stale array
// captured once at setup time.
export function useScrollspy(ids, { rootMargin = '-20% 0px -70% 0px' } = {}) {
  const activeId = ref(toValue(ids)[0] ?? null)
  let observer = null

  function setup() {
    observer?.disconnect()
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) activeId.value = visible.target.id
      },
      { rootMargin, threshold: 0 }
    )

    toValue(ids).forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
  }

  onMounted(setup)
  watch(() => toValue(ids), setup)
  onBeforeUnmount(() => observer?.disconnect())

  return { activeId }
}
