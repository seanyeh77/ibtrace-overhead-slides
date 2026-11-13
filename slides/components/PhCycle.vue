<script setup>
import { useSlideContext } from '@slidev/client'

// The nine stages as a loop. Click 1: stages 1-8 light up in order. Click 2: stage 9.
// Click 3: the arrow from 9 back to 1 (the next version).
const { $clicks } = useSlideContext()
const names = ['設計', '實作', '驗證實驗', '凍結', '評估協定', '試跑', '正式評估', '計分', '事後分析']
const W = 230, H = 84, GX = 40
const pos = (i) => i < 5
  ? { x: i * (W + GX), y: 40 }
  : { x: (8 - i) * (W + GX) + (W + GX) / 2, y: 330 }
const fill = (i) => {
  if (i === 8) return $clicks.value >= 2 ? '#6eea9e' : '#e7e7e7'
  return $clicks.value >= 1 ? '#adf0c7' : '#e7e7e7'
}
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1436 560" width="1436" height="560" style="overflow: visible">
    <defs>
      <marker id="ph-cy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>
    <g transform="translate(50,0)">
    <g v-for="(n, i) in names" :key="i">
      <rect :x="pos(i).x" :y="pos(i).y" :width="W" :height="H" :fill="fill(i)" stroke="#1a1a1a" stroke-width="2"
        style="transition: fill 0.35s" />
      <text :x="pos(i).x + W / 2" :y="pos(i).y + 52" text-anchor="middle" class="t">{{ i + 1 }}. {{ n }}</text>
    </g>
    <line v-for="i in 4" :key="'a' + i" :x1="pos(i - 1).x + W + 2" :x2="pos(i).x - 4" :y1="82" :y2="82"
      stroke="#333333" stroke-width="2" marker-end="url(#ph-cy)" />
    <polyline :points="`${pos(4).x + W / 2},${40 + H + 2} ${pos(4).x + W / 2},210 ${pos(5).x + W / 2},210 ${pos(5).x + W / 2},${330 - 4}`"
      fill="none" stroke="#333333" stroke-width="2" marker-end="url(#ph-cy)" />
    <line v-for="i in 3" :key="'b' + i" :x1="pos(i + 4).x - 2" :x2="pos(i + 5).x + W + 4" :y1="372" :y2="372"
      stroke="#333333" stroke-width="2" marker-end="url(#ph-cy)" />
    <g class="step" :style="{ opacity: $clicks >= 3 ? 1 : 0 }">
      <polyline :points="`${pos(8).x + W / 2},${330 + H + 2} ${pos(8).x + W / 2},500 -30,500 -30,82 ${pos(0).x - 4},82`"
        fill="none" stroke="#0f766e" stroke-width="3" marker-end="url(#ph-cy)" />
      <text :x="pos(8).x + W / 2 + 20" y="490" class="l" style="fill: #0f766e">結論成為下一版的設計</text>
    </g>
    </g>
  </svg>
</template>
