<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Each bar is one rank's own time inside one allreduce call; the call ends when the slowest finishes.
// Click 1: rank 1 gets faster, but rank 2 is still the slowest, so the gain is 0.
// Click 2: rank 2 gets 40 faster, but rank 1 now sets the end, so the gain is 25.
const { $clicks } = useSlideContext()
const base = [60, 75, 100, 70]
const X0 = 150
const K = 8
const ry = (i) => 60 + i * 95

const now = computed(() => {
  const c = $clicks.value
  if (c === 1) return [60, 50, 100, 70]
  if (c >= 2) return [60, 75, 60, 70]
  return base
})
const endX = computed(() => X0 + Math.max(...now.value) * K)
const note = computed(() => {
  const c = $clicks.value
  if (c === 1) return { row: 1, text: 'gain 0' }
  if (c >= 2) return { row: 2, text: 'gain 25' }
  return null
})
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 470" width="1140" height="470">
    <g v-for="(b, i) in base" :key="i">
      <text x="0" :y="ry(i) + 38" class="l">Rank {{ i }}</text>
      <rect v-if="now[i] < b" :x="X0 + now[i] * K" :y="ry(i)" :width="(b - now[i]) * K" height="60" fill="#ffffff" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="8 6" />
      <rect :x="X0" :y="ry(i)" :width="now[i] * K" height="60" :fill="now[i] === Math.max(...now) ? '#6eea9e' : '#adf0c7'" stroke="#1a1a1a" stroke-width="2" />
    </g>

    <text :x="endX" y="30" text-anchor="middle" class="s">call ends</text>
    <line :x1="endX" :x2="endX" y1="42" y2="450" stroke="#333333" stroke-width="2" stroke-dasharray="6 6" />

    <text v-if="note" x="980" :y="ry(note.row) + 38" class="t">{{ note.text }}</text>
  </svg>
</template>
