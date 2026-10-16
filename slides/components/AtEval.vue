<script setup>
import { useSlideContext } from '@slidev/client'

// The evaluation protocol, top to bottom. Left: what we did. Right: which data or tag it used.
// Click 0: the first version. Click 1: the second version, tested on programs never seen before.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0.15 })
const rows = [
  { step: 'develop first version', what: 'point to point runs', fill: '#adf0c7', k: 0 },
  { step: 'freeze it', what: 'git tag, no more changes', fill: '#6eea9e', k: 0 },
  { step: 'evaluate once', what: 'allreduce runs', fill: '#adf0c7', k: 0 },
  { step: 'develop second version', what: 'every run seen so far', fill: '#adf0c7', k: 1 },
  { step: 'freeze it', what: 'git tag, no more changes', fill: '#6eea9e', k: 1 },
  { step: 'evaluate once', what: 'alltoall and miniFE, new', fill: '#adf0c7', k: 1 },
]
const ry = (i) => 10 + i * 100
</script>

<template>
  <svg class="dg" viewBox="0 0 1300 610" width="1300" height="610">
    <defs>
      <marker id="at-ev" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g v-for="(r, i) in rows" :key="i" class="step" :style="on(r.k)">
      <rect x="0" :y="ry(i)" width="440" height="70" :fill="r.fill" stroke="#1a1a1a" stroke-width="2" />
      <text x="220" :y="ry(i) + 44" text-anchor="middle" class="t">{{ r.step }}</text>
      <line v-if="i < rows.length - 1" x1="220" x2="220" :y1="ry(i) + 70" :y2="ry(i) + 98" stroke="#333333" stroke-width="2" marker-end="url(#at-ev)" />
      <rect x="620" :y="ry(i)" width="680" height="70" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="960" :y="ry(i) + 44" text-anchor="middle" class="t">{{ r.what }}</text>
      <line x1="620" x2="442" :y1="ry(i) + 35" :y2="ry(i) + 35" stroke="#333333" stroke-width="2" marker-end="url(#at-ev)" />
    </g>
  </svg>
</template>
