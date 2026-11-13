<script setup>
import { useSlideContext } from '@slidev/client'

// rank 2 -> rank 3 in the replay plan. Same 63 messages, order shifted by one.
// Click 1: the sender's sequence. Click 2: the receiver's sequence.
// Click 3: in-order matching pairs the 81,920 B send with a 600 B receive -> truncated.
const { $clicks } = useSlideContext()
const send = ['81,920', '600', '600', '600', '…', '600']
const recv = ['600', '600', '600', '600', '…', '81,920']
const BW = 170, BH = 64, X0 = 210, GAP = 24
const x = (i) => X0 + i * (BW + GAP)
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const big = (v) => v === '81,920'
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1396 470" width="1396" height="470" style="overflow: visible">
    <g class="step" :style="on(1)">
      <text x="0" y="62" class="l">rank 2 送</text>
      <g v-for="(v, i) in send" :key="'s' + i">
        <rect :x="x(i)" y="20" :width="BW" :height="BH" :fill="big(v) ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
        <text :x="x(i) + BW / 2" y="62" text-anchor="middle" class="t">{{ v }}</text>
      </g>
    </g>
    <g class="step" :style="on(2)">
      <text x="0" y="292" class="l">rank 3 收</text>
      <g v-for="(v, i) in recv" :key="'r' + i">
        <rect :x="x(i)" y="250" :width="BW" :height="BH" :fill="big(v) ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
        <text :x="x(i) + BW / 2" y="292" text-anchor="middle" class="t">{{ v }}</text>
      </g>
      <text x="0" y="370" class="s m">單位 B，每對 63 則，組成相同、順序差一格</text>
    </g>
    <g class="step" :style="on(3)">
      <line :x1="x(0) + BW / 2" :x2="x(0) + BW / 2" y1="88" y2="244" stroke="#c0392b" stroke-width="3" />
      <line v-for="i in 3" :key="'p' + i" :x1="x(i) + BW / 2" :x2="x(i) + BW / 2" y1="88" y2="244" stroke="#333333" stroke-width="2" />
      <rect :x="x(0) - 4" y="246" :width="BW + 8" :height="BH + 8" fill="none" stroke="#c0392b" stroke-width="3" />
      <text x="0" y="430" class="l" style="fill: #c0392b">照順序配對：81,920 B 送進 600 B 的緩衝，MPI_ERR_TRUNCATE</text>
    </g>
  </svg>
</template>
