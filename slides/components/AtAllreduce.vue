<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: four ranks, each with its own value. Click 1: values pass around a ring.
// Click 2: every rank ends with the sum.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const vals = [3, 1, 4, 2]
const bx = (i) => i * 300
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 450" width="1140" height="450">
    <defs>
      <marker id="at-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g v-for="(v, i) in vals" :key="'r' + i">
      <rect :x="bx(i)" y="40" width="240" height="110" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text :x="bx(i) + 120" y="84" text-anchor="middle" class="l">Rank {{ i }}</text>
      <text :x="bx(i) + 120" y="128" text-anchor="middle" class="t">value {{ v }}</text>
    </g>

    <g class="step" :style="on(1)">
      <line v-for="i in [0, 1, 2]" :key="'a' + i" :x1="bx(i) + 240" :x2="bx(i) + 298" y1="95" y2="95" stroke="#333333" stroke-width="2" marker-end="url(#at-ar)" />
      <path d="M1020,150 V210 H120 V152" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#at-ar)" />
      <text x="570" y="250" text-anchor="middle" class="s">ring</text>
    </g>

    <g class="step" :style="on(2)">
      <text x="0" y="318" class="l">After allreduce</text>
      <g v-for="(v, i) in vals" :key="'s' + i">
        <rect :x="bx(i)" y="340" width="240" height="90" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
        <text :x="bx(i) + 120" y="394" text-anchor="middle" class="t">sum 10</text>
      </g>
    </g>
  </svg>
</template>
