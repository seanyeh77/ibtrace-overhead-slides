<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Measured value with its 95 % interval, beside a predicted value, per category.
// Click 1 shows the predictions.
const props = defineProps({
  cats: { type: Array, required: true }, // [['rc_mlx5', '8 B'], ...]
  measured: { type: Array, required: true }, // [{ v, lo, hi }]
  predicted: { type: Array, required: true }, // [v]
  max: { type: Number, required: true },
  step: { type: Number, required: true },
  unit: { type: String, default: 'µs' },
  width: { type: Number, default: 1320 },
  height: { type: Number, default: 600 },
})
const { $clicks } = useSlideContext()

const M = { l: 96, r: 16, t: 84, b: 92 }
const pw = computed(() => props.width - M.l - M.r)
const ph = computed(() => props.height - M.t - M.b)
const gw = computed(() => pw.value / props.cats.length)
const y = (v) => M.t + ph.value * (1 - v / props.max)
const cx = (i) => M.l + gw.value * i + gw.value / 2
const ticks = computed(() => {
  const out = []
  for (let v = 0; v <= props.max + 1e-9; v += props.step) out.push(+v.toFixed(6))
  return out
})
</script>

<template>
  <svg class="chart" :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height">
    <g>
      <line :x1="M.l" :x2="M.l + 40" y1="32" y2="32" stroke="#1a1a1a" stroke-width="2" />
      <line :x1="M.l + 20" :x2="M.l + 20" y1="18" y2="46" stroke="#1a1a1a" stroke-width="2" />
      <rect :x="M.l + 10" y="22" width="20" height="20" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text :x="M.l + 56" y="42" class="c-lg">Measured C2 - C0 with 95 % CI</text>
    </g>
    <g :style="{ opacity: $clicks >= 1 ? 1 : 0.15 }" class="c-bar">
      <rect :x="M.l + 530" y="20" width="24" height="24" fill="#fff" stroke="#0f766e" stroke-width="4" />
      <text :x="M.l + 570" y="42" class="c-lg">Predicted: busy calls x 39.8 ns</text>
    </g>
    <text x="0" :y="M.t - 18" class="c-unit">{{ unit }}</text>
    <g v-for="t in ticks" :key="'t' + t">
      <line :x1="M.l" :x2="width - M.r" :y1="y(t)" :y2="y(t)" stroke="#e2e5e9" stroke-width="1.5" />
      <text :x="M.l - 14" :y="y(t) + 8" text-anchor="end" class="c-tick">{{ t }}</text>
    </g>
    <line :x1="M.l" :x2="width - M.r" :y1="y(0)" :y2="y(0)" stroke="#1a1a1a" stroke-width="2" />
    <g v-for="(c, i) in cats" :key="i">
      <text :x="cx(i)" :y="height - M.b + 36" text-anchor="middle" class="c-cat">{{ c[0] }}</text>
      <text :x="cx(i)" :y="height - M.b + 68" text-anchor="middle" class="c-cat2">{{ c[1] }}</text>
      <line :x1="cx(i) - 26" :x2="cx(i) - 26" :y1="y(measured[i].lo)" :y2="y(measured[i].hi)" stroke="#1a1a1a" stroke-width="2" />
      <line :x1="cx(i) - 38" :x2="cx(i) - 14" :y1="y(measured[i].lo)" :y2="y(measured[i].lo)" stroke="#1a1a1a" stroke-width="2" />
      <line :x1="cx(i) - 38" :x2="cx(i) - 14" :y1="y(measured[i].hi)" :y2="y(measured[i].hi)" stroke="#1a1a1a" stroke-width="2" />
      <rect :x="cx(i) - 37" :y="y(measured[i].v) - 11" width="22" height="22" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <g class="c-bar" :style="{ opacity: $clicks >= 1 ? 1 : 0 }">
        <rect :x="cx(i) + 14" :y="y(predicted[i]) - 12" width="24" height="24" fill="#fff" stroke="#0f766e" stroke-width="4" />
        <text :x="cx(i) + 48" :y="y(predicted[i]) + 8" class="c-val">{{ predicted[i].toFixed(2) }}</text>
      </g>
    </g>
  </svg>
</template>
