<script setup>
import { useSlideContext } from '@slidev/client'

// One pair: the state with the bottleneck and the state after the action, each run 10 times
// without the tracer (grey) and 10 times with it (green).
// Click 0: the 40 runs. Click 1: untraced runs give the answer. Click 2: traced runs give the prediction.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const states = [
  { name: 'with bottleneck', y: 40 },
  { name: 'after the action', y: 250 },
]
const sq = (j) => 300 + j * 44
</script>

<template>
  <svg class="dg" viewBox="0 0 1260 560" width="1260" height="560">
    <defs>
      <marker id="at-pr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>
    <g v-for="(s, i) in states" :key="i">
      <text x="0" :y="s.y + 30" class="l">{{ s.name }}</text>
      <text x="0" :y="s.y + 92" class="s m">no tracer × 10</text>
      <text x="0" :y="s.y + 152" class="s m">tracer × 10</text>
      <rect v-for="j in 10" :key="'a' + j" :x="sq(j - 1)" :y="s.y + 64" width="36" height="36" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <rect v-for="j in 10" :key="'b' + j" :x="sq(j - 1)" :y="s.y + 124" width="36" height="36" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2"
        :style="{ opacity: i === 1 && $clicks >= 2 ? 0.25 : 1 }" />
    </g>

    <g class="step" :style="on(1)">
      <line x1="740" x2="860" y1="122" y2="200" stroke="#333333" stroke-width="2" marker-end="url(#at-pr)" />
      <line x1="740" x2="860" y1="332" y2="230" stroke="#333333" stroke-width="2" marker-end="url(#at-pr)" />
      <rect x="870" y="176" width="390" height="80" fill="#ffffff" stroke="#1a1a1a" stroke-width="2" />
      <text x="1065" y="208" text-anchor="middle" class="t">median − median</text>
      <text x="1065" y="240" text-anchor="middle" class="s">= measured ΔT (answer)</text>
    </g>
    <g class="step" :style="on(2)">
      <line x1="740" x2="860" y1="182" y2="440" stroke="#333333" stroke-width="2" marker-end="url(#at-pr)" />
      <rect x="870" y="420" width="390" height="80" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="1065" y="452" text-anchor="middle" class="t">model reads 10 traces</text>
      <text x="1065" y="484" text-anchor="middle" class="s">median = predicted gain</text>
      <text x="1065" y="540" text-anchor="middle" class="s m">compare with the answer</text>
    </g>
  </svg>
</template>
