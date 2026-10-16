<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// One allreduce call, using the per-call averages of the case run (ms).
// busy = the rank's own time (total minus waiting); rep = repeated registration inside it.
// Click 0: before. Click 1: repeated registration removed; the slowest rank changes.
// Click 2: the per-call gain added up over 400 calls.
const { $clicks } = useSlideContext()
const busy = [0.7445, 0.8003, 0.777, 0.7843]
const rep = [0.5015, 0.5265, 0.4945, 0.507]
const after = busy.map((b, i) => b - rep[i])
const X0 = 150
const K = 1000
const ry = (i) => 80 + i * 90
const x = (v) => X0 + v * K
const xBefore = x(Math.max(...busy))
const xAfter = x(Math.max(...after))
const removed = computed(() => $clicks.value >= 1)
const fmt = (v) => v.toFixed(3)
</script>

<template>
  <svg class="dg" viewBox="0 0 1240 580" width="1240" height="580">
    <g v-for="(b, i) in busy" :key="i">
      <text x="0" :y="ry(i) + 36" class="l">Rank {{ i }}</text>
      <rect :x="X0" :y="ry(i)" :width="after[i] * K" height="56" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <rect :x="x(after[i])" :y="ry(i)" :width="rep[i] * K" height="56"
        :fill="removed ? '#ffffff' : '#6eea9e'" stroke="#1a1a1a" stroke-width="2" :stroke-dasharray="removed ? '8 6' : 'none'" />
      <text v-if="!removed" :x="x(b) - 12" :y="ry(i) + 36" text-anchor="end" class="s">{{ fmt(b) }}</text>
      <text v-else :x="x(after[i]) - 12" :y="ry(i) + 36" text-anchor="end" class="s">{{ fmt(after[i]) }}</text>
    </g>
    <text :x="x(after[0]) + (rep[0] * K) / 2" y="66" text-anchor="middle" class="s" :style="{ opacity: removed ? 0 : 1 }">repeated registration</text>

    <line :x1="xBefore" :x2="xBefore" y1="70" y2="440" stroke="#333333" stroke-width="2" stroke-dasharray="6 6" />
    <text :x="xBefore" y="470" text-anchor="middle" class="s">slowest before</text>
    <g class="step" :style="{ opacity: removed ? 1 : 0 }">
      <line :x1="xAfter" :x2="xAfter" y1="70" y2="440" stroke="#333333" stroke-width="2" stroke-dasharray="6 6" />
      <text :x="xAfter" y="470" text-anchor="middle" class="s">slowest after</text>
      <line :x1="xAfter" :x2="xBefore" y1="30" y2="30" stroke="#1a1a1a" stroke-width="2" />
      <line :x1="xAfter" :x2="xAfter" y1="20" y2="40" stroke="#1a1a1a" stroke-width="2" />
      <line :x1="xBefore" :x2="xBefore" y1="20" y2="40" stroke="#1a1a1a" stroke-width="2" />
      <rect :x="(xAfter + xBefore) / 2 - 150" y="14" width="300" height="32" fill="#ffffff" />
      <text :x="(xAfter + xBefore) / 2" y="38" text-anchor="middle" class="t">gain 0.518 ms</text>
    </g>
    <g class="step" :style="{ opacity: $clicks >= 2 ? 1 : 0 }">
      <text x="0" y="530" class="t">0.518 ms × 400 calls ≈ 207 ms</text>
      <text x="0" y="566" class="s">averages shown; summed call by call: 210.1 ms</text>
    </g>
  </svg>
</template>
