import { ref, watch, onMounted, onUnmounted } from 'vue'

// Progress 0 -> 1 over `dur` ms, restarted every time `src` changes (a click).
export function useProgress(src, dur = 1500) {
  const p = ref(1)
  let raf = 0
  const run = () => {
    cancelAnimationFrame(raf)
    const t0 = performance.now()
    p.value = 0
    const f = (now) => {
      p.value = Math.min(1, (now - t0) / dur)
      if (p.value < 1) raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
  }
  watch(src, run)
  onMounted(run)
  onUnmounted(() => cancelAnimationFrame(raf))
  return p
}

// Elapsed ms since mount, updated every frame, for looping motion.
export function useClock() {
  const t = ref(0)
  let raf = 0
  const t0 = performance.now()
  const f = (now) => {
    t.value = now - t0
    raf = requestAnimationFrame(f)
  }
  onMounted(() => { raf = requestAnimationFrame(f) })
  onUnmounted(() => cancelAnimationFrame(raf))
  return t
}

export const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
// Progress of a sub-interval [a, b] of 0..1
export const seg = (p, a, b) => ease(clamp((p - a) / (b - a), 0, 1))
