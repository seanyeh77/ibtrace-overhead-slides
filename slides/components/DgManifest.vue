<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: the job's runs. Click 1: one manifest row per run. Click 2: analysis reads it.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const runs = [
  { name: 'C3 rc_mlx5 64 KiB', order: '0001', exit: '0', output: 'run_0001' },
  { name: 'C0 rc_verbs 8 B', order: '0002', exit: '0', output: 'run_0002' },
  { name: 'C4 rc_mlx5 8 B', order: '0228', exit: '1', output: 'none', bad: true },
  { name: 'C2 rc_verbs 1 MiB', order: '0229', exit: '0', output: 'run_0229' },
]
const rowY = (i) => 80 + i * 60
const cols = [
  { k: 'order', x: 480, w: 110 },
  { k: 'condition', x: 590, w: 270 },
  { k: 'exit', x: 860, w: 90 },
  { k: 'output', x: 950, w: 180 },
]
const cell = (r, k) => (k === 'condition' ? r.name.split(' ').slice(0, 2).join(' ') : r[k])
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 560" width="1140" height="560">
    <defs>
      <marker id="dg-mf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g class="step" :style="on(0)">
      <rect x="0" y="0" width="380" height="400" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="20" y="40" class="l">Slurm job, random order</text>
      <g v-for="(r, i) in runs" :key="'r' + i">
        <rect x="30" :y="rowY(i) + 4" width="310" height="52" :fill="r.bad ? '#aeacac' : '#adf0c7'" stroke="#1a1a1a" stroke-width="2" />
        <text x="185" :y="rowY(i) + 38" text-anchor="middle" class="s">{{ r.name }}</text>
      </g>
      <text x="185" y="370" text-anchor="middle" class="t">...</text>
    </g>

    <g class="step" :style="on(1)">
      <line v-for="(r, i) in runs" :key="'a' + i" x1="340" :y1="rowY(i) + 30" x2="478" :y2="rowY(i) + 30" stroke="#333333" stroke-width="2" marker-end="url(#dg-mf)" />
      <text x="432" y="96" text-anchor="middle" class="s">append</text>
      <g v-for="c in cols" :key="'h' + c.k">
        <rect :x="c.x" y="20" :width="c.w" height="60" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
        <text :x="c.x + c.w / 2" y="58" text-anchor="middle" class="s">{{ c.k }}</text>
      </g>
      <g v-for="(r, i) in runs" :key="'t' + i">
        <g v-for="c in cols" :key="c.k">
          <rect :x="c.x" :y="rowY(i)" :width="c.w" height="60" :fill="r.bad ? '#aeacac' : '#ffffff'" stroke="#1a1a1a" stroke-width="2" />
          <text :x="c.x + c.w / 2" :y="rowY(i) + 38" text-anchor="middle" class="s">{{ cell(r, c.k) }}</text>
        </g>
      </g>
      <text x="805" y="370" text-anchor="middle" class="l">manifest.csv</text>
    </g>

    <g class="step" :style="on(2)">
      <line x1="805" y1="384" x2="805" y2="468" stroke="#333333" stroke-width="2" marker-end="url(#dg-mf)" />
      <text x="819" y="432" class="s">read</text>
      <rect x="675" y="470" width="260" height="60" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="805" y="508" text-anchor="middle" class="t">analysis</text>
    </g>
  </svg>
</template>
