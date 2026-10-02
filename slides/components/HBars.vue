<script setup>
import { useSlideContext } from '@slidev/client'

// Horizontal bars in one or more side-by-side panels.
// reveal: panel i appears on click i (panel 0 is always shown).
const props = defineProps({
  panels: { type: Array, required: true }, // [{ title, max, items: [{ label, v, hot }] }]
  unit: { type: String, default: 'ns' },
  panelW: { type: Number, default: 660 },
  labelW: { type: Number, default: 220 },
  rowH: { type: Number, default: 64 },
  gapX: { type: Number, default: 56 },
  reveal: Boolean,
})
const { $clicks } = useSlideContext()

const top = 72
const valW = 110
const barMax = () => props.panelW - props.labelW - valW
const rows = () => Math.max(...props.panels.map((p) => p.items.length))
const height = () => top + rows() * props.rowH + 8
const width = () => props.panels.length * props.panelW + (props.panels.length - 1) * props.gapX
const px = (i) => i * (props.panelW + props.gapX)
const shown = (i) => !props.reveal || i <= $clicks.value
const fmt = (v) => (v >= 100 ? Math.round(v) : v.toFixed(1))
</script>

<template>
  <svg class="chart" :viewBox="`0 0 ${width()} ${height()}`" :width="width()" :height="height()">
    <g v-for="(p, pi) in panels" :key="pi" class="c-bar" :transform="`translate(${px(pi)},0)`" :style="{ opacity: shown(pi) ? 1 : 0.12 }">
      <text x="0" y="34" class="c-ptitle">{{ p.title }}</text>
      <line x1="0" :x2="panelW" y1="52" y2="52" stroke="#1a1a1a" stroke-width="2" />
      <g v-for="(it, i) in p.items" :key="i" :transform="`translate(0,${top + i * rowH})`">
        <text x="0" :y="rowH / 2 + 2" class="c-hlab">{{ it.label }}</text>
        <rect
          :x="labelW" :y="rowH * 0.18" :width="Math.max(3, (barMax() * it.v) / p.max)" :height="rowH * 0.64"
          :fill="it.hot ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2"
        />
        <text :x="labelW + Math.max(3, (barMax() * it.v) / p.max) + 12" :y="rowH / 2 + 2" class="c-val">{{ fmt(it.v) }} {{ unit }}</text>
      </g>
    </g>
  </svg>
</template>
