<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Why the model cuts a loop into units. Three ranks, one pass of the loop, three exchanges.
// Each exchange waits for the slowest rank, so the time of a piece = the slowest rank's work.
const { $clicks } = useSlideContext()
const c = computed(() => $clicks.value)
const work = computed(() => [
  [300, 250, 300],
  [c.value >= 4 ? 250 : 380, 200, 250],
  [250, 320, 280],
])
const X0 = 250, K = 1
const len = computed(() => [0, 1, 2].map((u) => Math.max(...work.value.map((r) => r[u]))))
const start = computed(() => [0, 1, 2, 3].map((u) => X0 + len.value.slice(0, u).reduce((a, b) => a + b, 0)))
const slow = (r, u) => work.value[r][u] === len.value[u]
const caps = [
  '每個 rank 一圈裡做三段計算（灰），每段之後要和鄰居交換資料',
  '交換的時候，資料要等對方算完才拿得到',
  '所以算得快的 rank 只能停下來等（白色虛線）',
  '每一段花多久，只由那一段最慢的 rank 決定（綠）',
  '如果 rank 1 的第 1 段快 130，這一段只快 80：rank 0 變成最慢的',
  '所以要在每次交換切開，逐段找最慢的人：每一段就是一個「單位」',
]
const total = computed(() => len.value.reduce((a, b) => a + b, 0))
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 600" width="1576" height="600" style="overflow: visible">
    <g v-for="(row, r) in work" :key="r">
      <text x="0" :y="r * 110 + 46" class="l">rank {{ r }}</text>
      <g v-for="(w, u) in row" :key="u">
        <rect :x="start[u]" :y="r * 110" :width="w" height="70"
          :fill="c >= 3 && slow(r, u) ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2"
          style="transition: all 0.4s" />
        <rect v-if="c >= 2 && w < len[u]" :x="start[u] + w" :y="r * 110 + 10" :width="len[u] - w" height="50"
          fill="#ffffff" stroke="#888888" stroke-width="2" stroke-dasharray="6 5" style="transition: all 0.4s" />
        <text v-if="c >= 2 && len[u] - w > 70" :x="start[u] + w + (len[u] - w) / 2" :y="r * 110 + 43" text-anchor="middle" class="s m">等待</text>
      </g>
    </g>
    <g class="step" :style="{ opacity: c >= 1 ? 1 : 0 }">
      <line v-for="u in 3" :key="u" :x1="start[u]" :x2="start[u]" y1="-6" y2="306" stroke="#0f766e" stroke-width="3" style="transition: all 0.4s" />
      <text v-for="u in 3" :key="'t' + u" :x="start[u]" y="336" text-anchor="middle" class="s" style="fill: #0f766e; transition: all 0.4s">交換 {{ u }}</text>
    </g>
    <g class="step" :style="{ opacity: c >= 3 ? 1 : 0 }">
      <text v-for="u in 3" :key="'l' + u" :x="start[u - 1] + len[u - 1] / 2" y="380" text-anchor="middle" class="t" style="transition: all 0.4s">{{ len[u - 1] }}</text>
      <text :x="X0 + total + 30" y="380" class="t">整圈 {{ total }}</text>
    </g>
    <g class="step" :style="{ opacity: c >= 5 ? 1 : 0 }">
      <rect v-for="u in 3" :key="'b' + u" :x="start[u - 1] + 4" y="400" :width="len[u - 1] - 8" height="30" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text v-for="u in 3" :key="'bt' + u" :x="start[u - 1] + len[u - 1] / 2" y="423" text-anchor="middle" class="s">單位 {{ u }}</text>
    </g>
    <text x="0" y="500" class="l">{{ caps[Math.min(c, 5)] }}</text>
    <text x="0" y="550" class="s m">Step {{ Math.min(c, 5) + 1 }} / 6　數字是示意，單位 µs</text>
  </svg>
</template>
