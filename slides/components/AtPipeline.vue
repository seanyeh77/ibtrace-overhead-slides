<script setup>
import { useSlideContext } from '@slidev/client'

// How the dataset is made, top to bottom. Left: the step. Right: what it produces or uses.
// Click 0: before the job. Click 1: inside one Slurm job. Click 2: after the job.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0.15 })
const rows = [
  { step: 'write scenarios', what: 'states, bottleneck, action', k: 0, fill: '#adf0c7' },
  { step: 'write expectations', what: 'before any run', k: 0, fill: '#adf0c7' },
  { step: 'sbatch one job', what: 'same 4 nodes for every state', k: 1, fill: '#6eea9e' },
  { step: 'shuffle all runs', what: 'fixed seed, tracer on/off mixed', k: 1, fill: '#6eea9e' },
  { step: 'set state, run program', what: 'busy loop, numactl, ib_write_bw, UCX var', k: 1, fill: '#6eea9e' },
  { step: 'write one manifest row', what: 'state, tracer, T, exit code, lost', k: 1, fill: '#6eea9e' },
  { step: 'check every run', what: 'exit 0 and 0 records lost', k: 2, fill: '#adf0c7' },
]
const ry = (i) => 6 + i * 84 + (i >= 2 ? 40 : 0) + (i >= 6 ? 30 : 0)
</script>

<template>
  <svg class="dg" viewBox="0 0 1260 670" width="1260" height="670">
    <defs>
      <marker id="at-pl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>
    <rect x="-4" :y="ry(2) - 16" width="1268" :height="84 * 3 + 58 + 32" fill="none" stroke="#0f766e" stroke-width="2" stroke-dasharray="8 6" class="step" :style="on(1)" />
    <text x="1250" :y="ry(2) - 24" text-anchor="end" class="s m step" :style="on(1)">inside one Slurm job</text>
    <g v-for="(r, i) in rows" :key="i" class="step" :style="on(r.k)">
      <rect x="0" :y="ry(i)" width="440" height="58" :fill="r.fill" stroke="#1a1a1a" stroke-width="2" />
      <text x="220" :y="ry(i) + 37" text-anchor="middle" class="t">{{ r.step }}</text>
      <line v-if="i < rows.length - 1" x1="220" x2="220" :y1="ry(i) + 58" :y2="ry(i + 1) - 2" stroke="#333333" stroke-width="2" marker-end="url(#at-pl)" />
      <rect x="560" :y="ry(i)" width="690" height="58" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="905" :y="ry(i) + 37" text-anchor="middle" class="s">{{ r.what }}</text>
      <line x1="442" x2="558" :y1="ry(i) + 29" :y2="ry(i) + 29" stroke="#333333" stroke-width="2" />
    </g>
  </svg>
</template>
