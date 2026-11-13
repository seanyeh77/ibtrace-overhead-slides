<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// The IndexError. One pass of LU's loop; ranks with fewer neighbours have fewer units.
// The network calculation takes unit k from every rank; at k = 3 rank 0 has none.
const { $clicks } = useSlideContext()
const c = computed(() => $clicks.value)
const ranks = [
  { name: 'rank 0', note: '角落，2 個鄰居', u: 2 },
  { name: 'rank 1', note: '邊上，3 個鄰居', u: 3 },
  { name: 'rank 5', note: '中間，4 個鄰居', u: 4 },
]
const X0 = 330, W = 1000
const k = computed(() => (c.value >= 1 && c.value <= 3 ? c.value : 0))
const box = (r, i) => ({ x: X0 + (W / r.u) * i, w: W / r.u })
const fill = (r, i) => {
  if (c.value >= 4) return '#adf0c7'
  if (k.value === i + 1) return '#6eea9e'
  if (k.value > i + 1) return '#adf0c7'
  return '#e7e7e7'
}
const caps = [
  'LU 的一圈：鄰居越少，交換越少，單位也越少',
  '網卡計算從第 1 個單位開始，每個 rank 都拿第 1 個',
  '第 2 個單位：三個 rank 都還有',
  '第 3 個單位：rank 0 只有 2 個，拿不到，程式中止（IndexError）',
  '修法第 1 步：把每個 rank 這一圈的單位加起來，變成一個「整圈」',
  '修法第 2 步：改成一圈一圈比；每個 rank 都有第 1 到第 254 圈，不會拿不到',
]
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1556 560" width="1556" height="560" style="overflow: visible">
    <text :x="X0" y="-0" class="s m">第 1 圈</text>
    <g v-for="(r, ri) in ranks" :key="ri">
      <text x="0" :y="ri * 110 + 64" class="l">{{ r.name }}</text>
      <text x="0" :y="ri * 110 + 96" class="s m">{{ r.note }}</text>
      <g v-if="c >= 4">
        <rect :x="X0" :y="ri * 110 + 30" :width="W" height="70" :fill="c >= 5 ? '#6eea9e' : '#adf0c7'" stroke="#1a1a1a" stroke-width="2" style="transition: fill 0.35s" />
        <text :x="X0 + W / 2" :y="ri * 110 + 74" text-anchor="middle" class="t">第 1 圈合計（{{ r.u }} 個單位加起來）</text>
      </g>
      <g v-else v-for="i in r.u" :key="i">
        <rect :x="box(r, i - 1).x" :y="ri * 110 + 30" :width="box(r, i - 1).w" height="70" :fill="fill(r, i - 1)"
          stroke="#1a1a1a" stroke-width="2" style="transition: fill 0.35s" />
        <text :x="box(r, i - 1).x + box(r, i - 1).w / 2" :y="ri * 110 + 74" text-anchor="middle" class="t">單位 {{ i }}</text>
      </g>
      <g v-if="k === 3 && r.u < 3">
        <rect :x="X0 + W + 20" :y="ri * 110 + 30" width="150" height="70" fill="#ffffff" stroke="#c0392b" stroke-width="3" stroke-dasharray="8 6" />
        <text :x="X0 + W + 95" :y="ri * 110 + 74" text-anchor="middle" class="t" style="fill: #c0392b">沒有</text>
      </g>
    </g>
    <g class="step" :style="{ opacity: c >= 5 ? 1 : 0 }">
      <line :x1="X0 + W + 30" :x2="X0 + W + 30" y1="30" y2="320" stroke="#0f766e" stroke-width="3" />
      <text :x="X0 + W + 46" y="160" class="t" style="fill: #0f766e">三個 rank</text>
      <text :x="X0 + W + 46" y="196" class="t" style="fill: #0f766e">比第 1 圈</text>
    </g>
    <text x="0" y="440" class="l" :style="{ fill: c === 3 ? '#c0392b' : '#1a1a1a' }">{{ caps[Math.min(c, 5)] }}</text>
    <text x="0" y="490" class="s m">Step {{ Math.min(c, 5) + 1 }} / 6　示意：LU 實際有 16 個 rank</text>
  </svg>
</template>
