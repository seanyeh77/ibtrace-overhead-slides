<script setup>
// One row per bottleneck kind: the median ratio as a dot, the range across pairs as a line.
// A dashed line at 1 marks "the tracer does not change the gain".
const props = defineProps({
  rows: { type: Array, required: true }, // [{ label, med, lo, hi }]
  min: { type: Number, default: 0.5 },
  max: { type: Number, default: 1.6 },
  ticks: { type: Array, default: () => [0.5, 0.75, 1, 1.25, 1.5] },
  width: { type: Number, default: 1300 },
})
const L = 340
const R = 140
const top = 70
const rowH = 72
const x = (v) => L + ((v - props.min) / (props.max - props.min)) * (props.width - L - R)
const height = () => top + props.rows.length * rowH + 60
const axisY = () => top + props.rows.length * rowH + 6
</script>

<template>
  <svg class="chart" :viewBox="`0 0 ${width} ${height()}`" :width="width" :height="height()">
    <text :x="x(1)" y="30" text-anchor="middle" class="c-tick">no change</text>
    <line :x1="x(1)" :x2="x(1)" y1="42" :y2="axisY()" stroke="#333333" stroke-width="2" stroke-dasharray="6 6" />
    <g v-for="(r, i) in rows" :key="i" :transform="`translate(0,${top + i * rowH})`">
      <line x1="0" :x2="width" :y1="rowH" :y2="rowH" stroke="#e2e5e9" stroke-width="1.5" />
      <text x="0" :y="rowH / 2 + 8" class="c-hlab">{{ r.label }}</text>
      <line v-if="r.lo !== undefined" :x1="x(r.lo)" :x2="x(r.hi)" :y1="rowH / 2" :y2="rowH / 2" stroke="#1a1a1a" stroke-width="3" />
      <rect :x="x(r.med) - 12" :y="rowH / 2 - 12" width="24" height="24" :fill="r.hot ? '#6eea9e' : '#adf0c7'" stroke="#1a1a1a" stroke-width="2" />
      <text :x="width - 10" :y="rowH / 2 + 8" text-anchor="end" class="c-val">{{ r.med.toFixed(2) }}</text>
    </g>
    <line :x1="L" :x2="width - R" :y1="axisY()" :y2="axisY()" stroke="#1a1a1a" stroke-width="2" />
    <g v-for="t in ticks" :key="t">
      <line :x1="x(t)" :x2="x(t)" :y1="axisY()" :y2="axisY() + 10" stroke="#1a1a1a" stroke-width="2" />
      <text :x="x(t)" :y="axisY() + 40" text-anchor="middle" class="c-tick">{{ t }}</text>
    </g>
  </svg>
</template>
