import { watch, onUnmounted } from 'vue'

export function useInfiniteScrollObserver(elRef: Ref<HTMLElement | null>, callback: () => void) {
  let observer: IntersectionObserver | null = null

  const createObserver = () => {
    if (!elRef.value) return

    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback()
      }
    })

    observer.observe(elRef.value)
  }

  watch(elRef, (val) => {
    if (val) createObserver()
  })

  onUnmounted(() => {
    if (observer && elRef.value) {
      observer.unobserve(elRef.value)
    }
    observer = null
  })
}
