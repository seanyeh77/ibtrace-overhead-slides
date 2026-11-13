<script setup>
import { useSlideContext } from '@slidev/client'

// Network calibration, top to bottom. One step per click.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const steps = [
  { t: '一份 trace', s: '注入狀態，開 tracer 的那次執行' },
  { t: '計畫：取一圈的通訊', s: '每個 rank 列出這一圈送給誰、收誰的、多大' },
  { t: '重播：只做通訊，不做計算', s: '4 種網卡設定各重播 3 次，共 12 次' },
  { t: '每種設定的每圈時間與固定成本', s: '換設定能省多少 = 每圈差 × 圈數 + 固定成本差' },
]
const BW = 900, BH = 92, X = 260
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1436 560" width="1436" height="560" style="overflow: visible">
    <defs>
      <marker id="ph-cal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>
    <g v-for="(s, i) in steps" :key="i" class="step" :style="on(i)">
      <rect :x="X" :y="i * 136" :width="BW" :height="BH" :fill="i === 3 ? '#6eea9e' : i === 0 ? '#e7e7e7' : '#adf0c7'" stroke="#1a1a1a" stroke-width="2" />
      <text :x="X + BW / 2" :y="i * 136 + 40" text-anchor="middle" class="l">{{ s.t }}</text>
      <text :x="X + BW / 2" :y="i * 136 + 74" text-anchor="middle" class="s">{{ s.s }}</text>
      <line v-if="i > 0" :x1="X + BW / 2" :x2="X + BW / 2" :y1="i * 136 - 42" :y2="i * 136 - 4" stroke="#333333" stroke-width="2" marker-end="url(#ph-cal)" />
    </g>
  </svg>
</template>
