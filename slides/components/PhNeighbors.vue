<script setup>
import { useSlideContext } from '@slidev/client'

// LU: every rank runs the same number of periods, but a rank with fewer neighbours
// makes fewer calls in each period, so it has fewer units.
// Click 1: the periods line up (2 each). Click 2: unit counts differ. Click 3: caption.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const ranks = [
  { name: 'rank 0', note: '角落，2 個鄰居', u: 2 },
  { name: 'rank 1', note: '邊上，3 個鄰居', u: 3 },
  { name: 'rank 5', note: '中間，4 個鄰居', u: 4 },
]
const PX = 330, PW = 520
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1456 470" width="1456" height="470" style="overflow: visible">
    <g v-for="(r, i) in ranks" :key="i">
      <text x="0" :y="i * 120 + 40" class="l">{{ r.name }}</text>
      <text x="0" :y="i * 120 + 72" class="s m">{{ r.note }}</text>
      <g v-for="p in 2" :key="p">
        <rect :x="PX + (p - 1) * (PW + 30)" :y="i * 120" :width="PW" height="80"
          :fill="$clicks >= 1 ? '#adf0c7' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" style="transition: fill 0.35s" />
        <g class="step" :style="on(2)">
          <line v-for="k in r.u - 1" :key="k" :x1="PX + (p - 1) * (PW + 30) + (PW / r.u) * k" :x2="PX + (p - 1) * (PW + 30) + (PW / r.u) * k"
            :y1="i * 120 + 6" :y2="i * 120 + 74" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="6 5" />
        </g>
      </g>
      <g class="step" :style="on(2)">
        <text :x="PX + 2 * PW + 60" :y="i * 120 + 50" class="t">{{ r.u * 2 }} 個單位</text>
      </g>
    </g>
    <g class="step" :style="on(1)">
      <text :x="PX + PW / 2" y="388" text-anchor="middle" class="t">第 1 圈</text>
      <text :x="PX + PW * 1.5 + 30" y="388" text-anchor="middle" class="t">第 2 圈</text>
    </g>
    <g class="step" :style="on(3)">
      <text x="0" y="450" class="l">圈數相同：可以對齊。單位數不同：按單位逐個比就會出錯。</text>
    </g>
  </svg>
</template>
