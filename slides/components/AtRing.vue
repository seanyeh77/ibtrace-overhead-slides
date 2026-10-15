<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// A ring of 12 slots, drawn flat with a wrap-around arrow. Numbers are record sequence numbers.
// Click 0: the writer is ahead of the reader. Click 1: the writer laps the reader and
// overwrites records 3 and 4 before they are read. Click 2: the reader skips to the oldest record, 5,
// and counts 3 and 4 as lost.
const { $clicks } = useSlideContext()
const N = 12
const sx = (i) => 40 + i * 100
const cx = (i) => sx(i) + 45

const state = computed(() => {
  const c = $clicks.value
  if (c <= 0) {
    const seq = Array.from({ length: N }, (_, i) => (i >= 3 && i <= 8 ? i : null))
    return { seq, write: 9, read: 3, lost: false, over: [] }
  }
  const seq = Array.from({ length: N }, (_, i) => (i <= 4 ? i + 12 : i))
  return { seq, write: 5, read: c === 1 ? 3 : 5, lost: c >= 2, over: [3, 4] }
})
const fill = (i) => {
  const s = state.value
  if ($clicks.value === 1 && s.over.includes(i)) return '#aeacac'
  if (s.seq[i] === null) return '#e7e7e7'
  return '#6eea9e'
}
</script>

<template>
  <svg class="dg" viewBox="0 0 1300 430" width="1300" height="430">
    <defs>
      <marker id="at-rg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g v-for="i in N" :key="i">
      <rect :x="sx(i - 1)" y="200" width="90" height="90" :fill="fill(i - 1)" stroke="#1a1a1a" stroke-width="2" />
      <text :x="cx(i - 1)" y="255" text-anchor="middle" class="t">{{ state.seq[i - 1] ?? '' }}</text>
    </g>

    <text :x="cx(state.write)" y="140" text-anchor="middle" class="l">write</text>
    <line :x1="cx(state.write)" :x2="cx(state.write)" y1="152" y2="196" stroke="#333333" stroke-width="2" marker-end="url(#at-rg)" />

    <text :x="cx(state.read)" y="352" text-anchor="middle" class="l">read</text>
    <line :x1="cx(state.read)" :x2="cx(state.read)" y1="330" y2="294" stroke="#333333" stroke-width="2" marker-end="url(#at-rg)" />

    <g v-if="state.lost">
      <line :x1="sx(3)" :x2="sx(4) + 90" y1="306" y2="306" stroke="#333333" stroke-width="2" />
      <text :x="(sx(3) + sx(4) + 90) / 2" y="352" text-anchor="middle" class="l">3 and 4 lost</text>
    </g>

    <path d="M1230,245 H1275 V400 H15 V245 H36" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#at-rg)" />
  </svg>
</template>
