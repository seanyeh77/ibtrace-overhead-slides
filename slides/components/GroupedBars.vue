<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Grouped vertical bars. Each category is a group, one bar per series.
// reveal: series i appears on click i (series 0 is always shown).
const props = defineProps({
  cats: { type: Array, required: true }, // [['rc_mlx5', '8 B'], ...] two label lines
  series: { type: Array, required: true }, // [{ name, fill, values: [] }]
  max: { type: Number, required: true },
  step: { type: Number, required: true },
  unit: { type: String, default: 'µs' },
  digits: { type: Number, default: 1 },
  width: { type: Number, default: 1320 },
  height: { type: Number, default: 640 },
  barW: { type: Number, default: 64 },
  reveal: Boolean,
})
const { $clicks } = useSlideContext()

const M = { l: 96, r: 16, t: 84, b: 92 }
const pw = computed(() => props.width - M.l - M.r)
const ph = computed(() => props.height - M.t - M.b)
const gw = computed(() => pw.value / props.cats.length)
const y = (v) => M.t + ph.value * (1 - v / props.max)
const ticks = computed(() => {
  const out = []
  for (let v = 0; v <= props.max + 1e-9; v += props.step) out.push(+v.toFixed(6))
  return out
})
const gap = 8
const groupW = computed(() => props.series.length * props.barW + (props.series.length - 1) * gap)
const bx = (ci, si) => M.l + gw.value * ci + (gw.value - groupW.value) / 2 + si * (props.barW + gap)
const shown = (si) => !props.reveal || si <= $clicks.value
const fmt = (v) => v.toFixed(props.digits)

// Legend: lay entries out left to right with measured-ish widths.
const legend = computed(() => {
  let x = M.l
  return props.series.map((s) => {
    const e = { ...s, x }
    x += 40 + s.name.length * 13 + 48
    return e
  })
})
</script>

<template>
  <svg class="chart" :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height">
    <g v-for="(s, si) in legend" :key="'lg' + si" :style="{ opacity: shown(si) ? 1 : 0.15 }">
      <rect :x="s.x" y="18" width="28" height="28" :fill="s.fill" stroke="#1a1a1a" stroke-width="2" />
      <text :x="s.x + 40" y="42" class="c-lg">{{ s.name }}</text>
    </g>
    <text x="0" :y="M.t - 18" class="c-unit">{{ unit }}</text>
    <g v-for="t in ticks" :key="'t' + t">
      <line :x1="M.l" :x2="width - M.r" :y1="y(t)" :y2="y(t)" stroke="#e2e5e9" stroke-width="1.5" />
      <text :x="M.l - 14" :y="y(t) + 8" text-anchor="end" class="c-tick">{{ t }}</text>
    </g>
    <line :x1="M.l" :x2="width - M.r" :y1="y(0)" :y2="y(0)" stroke="#1a1a1a" stroke-width="2" />
    <g v-for="(c, ci) in cats" :key="'c' + ci">
      <text :x="M.l + gw * ci + gw / 2" :y="height - M.b + 36" text-anchor="middle" class="c-cat">{{ c[0] }}</text>
      <text v-if="c[1]" :x="M.l + gw * ci + gw / 2" :y="height - M.b + 68" text-anchor="middle" class="c-cat2">{{ c[1] }}</text>
      <g v-for="(s, si) in series" :key="'b' + si" class="c-bar" :style="{ opacity: shown(si) ? 1 : 0 }">
        <rect
          :x="bx(ci, si)" :y="y(s.values[ci])" :width="barW" :height="y(0) - y(s.values[ci])"
          :fill="s.fill" stroke="#1a1a1a" stroke-width="2"
        />
        <text :x="bx(ci, si) + barW / 2" :y="y(s.values[ci]) - 10" text-anchor="middle" class="c-val">{{ fmt(s.values[ci]) }}</text>
      </g>
    </g>
  </svg>
</template>
