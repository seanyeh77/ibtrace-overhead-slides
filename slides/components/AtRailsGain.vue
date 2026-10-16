<script setup>
import { useSlideContext } from '@slidev/client'

// The model's prediction for "use 8 rails" in the case run, as a waterfall in ms.
// Click 0: transfer saved. Click 1: extra registration. Click 2: net prediction and the measured change.
const { $clicks } = useSlideContext()
const X0 = 380
const K = 3.2
const x = (v) => X0 + (v + 220) * K
const ry = (i) => 40 + i * 110
const rows = [
  { label: 'transfer saved', f: '400 × 6 × (11.8 − 5.7) µs', from: 0, to: 14.6, txt: '+14.6', fill: '#6eea9e', k: 0 },
  { label: 'extra registration', f: '400 × 4 × 3 × 31.8 µs', from: 14.6, to: -138.2, txt: '−152.8', fill: '#aeacac', k: 1 },
  { label: 'model: net', f: '+14.6 − 152.8', from: 0, to: -138.1, txt: '−138.1', fill: '#adf0c7', k: 2 },
  { label: 'measured', f: '10 untraced runs each', from: 0, to: -208.5, txt: '−208.5', fill: '#e7e7e7', k: 2 },
]
const left = (r) => Math.min(x(r.from), x(r.to))
const w = (r) => Math.abs(x(r.to) - x(r.from))
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0.12 })
</script>

<template>
  <svg class="dg" viewBox="0 0 1260 520" width="1260" height="520">
    <g v-for="(r, i) in rows" :key="i" class="step" :style="on(r.k)">
      <text x="0" :y="ry(i) + 28" class="l">{{ r.label }}</text>
      <text x="0" :y="ry(i) + 58" class="s m">{{ r.f }}</text>
      <rect :x="left(r)" :y="ry(i) + 6" :width="w(r)" height="60" :fill="r.fill" stroke="#1a1a1a" stroke-width="2" />
      <text v-if="w(r) > 140" :x="left(r) + 14" :y="ry(i) + 44" class="t">{{ r.txt }} ms</text>
      <text v-else :x="left(r) + w(r) + 12" :y="ry(i) + 44" class="t">{{ r.txt }} ms</text>
    </g>
    <line :x1="x(0)" :x2="x(0)" y1="30" y2="470" stroke="#333333" stroke-width="2" />
    <text v-for="t in [-200, -100, 0]" :key="t" :x="x(t)" y="500" text-anchor="middle" class="s m">{{ t < 0 ? '−' + (-t) : t }}</text>
    <line v-for="t in [-200, -100]" :key="'g' + t" :x1="x(t)" :x2="x(t)" y1="460" y2="474" stroke="#333333" stroke-width="2" />
  </svg>
</template>
