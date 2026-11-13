<script setup>
import { useSlideContext } from '@slidev/client'

// Why the model crashed. Each rank's main loop is cut into segments; the counts differ.
// The network calculation reads segment k of every rank.
// Clicks 1-4: read segments 1..4; at segment 4, rank 1 has none -> IndexError.
const { $clicks } = useSlideContext()
const counts = [4, 3, 4]
const SW = 190, SH = 70, X0 = 170
const state = (r, u) => {
  if (u >= counts[r]) return $clicks.value >= u + 1 && r === 1 ? 'miss' : 'none'
  return $clicks.value >= u + 1 ? 'hit' : 'idle'
}
const fills = { idle: '#e7e7e7', hit: '#adf0c7', miss: '#ffffff', none: '#ffffff' }
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1056 440" width="1056" height="440" style="overflow: visible">
    <g v-for="(n, r) in counts" :key="r">
      <text x="0" :y="r * 100 + 46" class="l">rank {{ r }}</text>
      <g v-for="u in 4" :key="u">
        <rect :x="X0 + (u - 1) * (SW + 20)" :y="r * 100" :width="SW" :height="SH"
          :fill="fills[state(r, u - 1)]" :stroke="state(r, u - 1) === 'miss' ? '#c0392b' : '#1a1a1a'"
          :stroke-width="state(r, u - 1) === 'miss' ? 3 : 2" :stroke-dasharray="u > n ? '8 6' : ''"
          style="transition: fill 0.35s" />
        <text :x="X0 + (u - 1) * (SW + 20) + SW / 2" :y="r * 100 + 44" text-anchor="middle"
          :class="['t', u > n ? 'm' : '']">{{ u > n ? '沒有' : `第 ${u} 個單位` }}</text>
      </g>
    </g>
    <g class="step" :style="{ opacity: $clicks >= 1 && $clicks < 4 ? 1 : 0 }">
      <text x="0" y="370" class="l">網卡計算：第 k 個單位，每個 rank 都去讀</text>
    </g>
    <g class="step" :style="{ opacity: $clicks >= 4 ? 1 : 0 }">
      <text x="0" y="370" class="l" style="fill: #c0392b">rank 1 沒有第 4 個單位：IndexError</text>
      <text x="0" y="410" class="s m">示意：實際是 16 個 rank，單位數各不相同</text>
    </g>
  </svg>
</template>
