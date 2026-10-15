<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: inputs. Click 1: each rank's time split into kinds.
// Click 2: each candidate action with its predicted gain, best first; a harmful action is negative.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const kinds = [
  { name: 'wait', fill: '#ffffff' },
  { name: 'register', fill: '#6eea9e' },
  { name: 'stall', fill: '#aeacac' },
  { name: 'compute', fill: '#adf0c7' },
]
const ranks = [
  [0.45, 0.38, 0.02, 0.15],
  [0.5, 0.36, 0.02, 0.12],
  [0.4, 0.4, 0.05, 0.15],
  [0.48, 0.37, 0.03, 0.12],
]
const BX = 470
const BW = 370
const segs = (r) => {
  let x = BX
  return r.map((f, k) => {
    const s = { x, w: f * BW, fill: kinds[k].fill }
    x += f * BW
    return s
  })
}
const actions = [
  { name: 'keep buffers', gain: '+180 ms', fill: '#adf0c7' },
  { name: 'use 8 rails', gain: '−210 ms', fill: '#aeacac' },
]
</script>

<template>
  <svg class="dg" viewBox="0 0 1300 520" width="1300" height="520">
    <defs>
      <marker id="at-md" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <rect x="0" y="20" width="280" height="480" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
    <text x="20" y="60" class="l">Inputs</text>
    <g v-for="(t, i) in ['trace', 'counters', 'config']" :key="t">
      <rect x="30" :y="100 + i * 120" width="220" height="80" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="140" :y="100 + i * 120 + 48" text-anchor="middle" class="t">{{ t }}</text>
    </g>

    <g class="step" :style="on(1)">
      <line x1="280" y1="260" x2="358" y2="260" stroke="#333333" stroke-width="2" marker-end="url(#at-md)" />
      <rect x="360" y="20" width="500" height="480" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="380" y="60" class="l">Time per rank</text>
      <g v-for="(r, i) in ranks" :key="'r' + i">
        <text x="380" :y="100 + i * 70 + 30" class="s">rank {{ i }}</text>
        <rect v-for="(s, k) in segs(r)" :key="k" :x="s.x" :y="100 + i * 70" :width="s.w" height="44" :fill="s.fill" stroke="#1a1a1a" stroke-width="2" />
      </g>
      <g v-for="(k, j) in kinds" :key="k.name">
        <rect :x="380 + (j % 2) * 230" :y="402 + Math.floor(j / 2) * 46" width="24" height="24" :fill="k.fill" stroke="#1a1a1a" stroke-width="2" />
        <text :x="416 + (j % 2) * 230" :y="422 + Math.floor(j / 2) * 46" class="s">{{ k.name }}</text>
      </g>
    </g>

    <g class="step" :style="on(2)">
      <line x1="860" y1="260" x2="938" y2="260" stroke="#333333" stroke-width="2" marker-end="url(#at-md)" />
      <rect x="940" y="20" width="360" height="480" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="960" y="60" class="l">Predicted gain</text>
      <g v-for="(a, i) in actions" :key="a.name">
        <rect x="960" :y="100 + i * 120" width="320" height="96" :fill="a.fill" stroke="#1a1a1a" stroke-width="2" />
        <text x="980" :y="100 + i * 120 + 38" class="s">{{ a.name }}</text>
        <text x="980" :y="100 + i * 120 + 76" class="t">{{ a.gain }}</text>
      </g>
    </g>
  </svg>
</template>
