<script setup>
import { useSlideContext } from '@slidev/client'

// Common optimizations, one row per software or hardware layer.
// kind: 'cov' = ibtrace suggest evaluates it today; 'open' = a normal user can change it, not covered yet;
// 'hard' = needs the cluster admin or root, or the tracer cannot see it.
// Click 0: covered vs not covered. Click 1: grey out the ones out of reach. Click 2: the next candidates.
const { $clicks } = useSlideContext()
const layers = [
  { name: 'Application', items: [['overlap comm', 'open'], ['merge messages', 'open'], ['reuse buffers', 'open']] },
  { name: 'MPI', items: [['collective algorithm', 'open', 1], ['rank placement', 'open', 1], ['UCC / HCOLL', 'open']] },
  { name: 'UCX', items: [['more rails', 'cov'], ['fewer rails', 'cov'], ['transport', 'open'], ['rndv threshold', 'open', 1]] },
  { name: 'System', items: [['keep buffers', 'cov'], ['free the CPU', 'cov'], ['NUMA binding', 'cov'], ['huge pages', 'hard'], ['CPU freq, IRQ', 'hard']] },
  { name: 'Network', items: [['avoid traffic', 'cov'], ['adaptive routing', 'hard'], ['congestion ctrl', 'hard'], ['SHARP', 'hard']] },
  { name: 'GPU (NCCL)', items: [['GPUDirect RDMA', 'hard'], ['NCCL tuning', 'hard']] },
]
const CW = 12.6
const X0 = 210
const GAP = 14
const ry = (i) => 20 + i * 88
const boxes = layers.map((l) => {
  let x = X0
  return l.items.map(([label, kind, next]) => {
    const w = Math.round(label.length * CW + 34)
    const b = { label, kind, next: !!next, x, w }
    x += w + GAP
    return b
  })
})
const fill = (b) => (b.kind === 'cov' ? '#6eea9e' : b.kind === 'hard' && $clicks.value >= 1 ? '#e7e7e7' : '#ffffff')
const dash = (b) => (b.kind === 'hard' && $clicks.value >= 1 ? '8 6' : 'none')
const ink = (b) => (b.kind === 'hard' && $clicks.value >= 1 ? '#66707c' : '#1a1a1a')
const legend = [
  { label: 'evaluated by ibtrace', fill: '#6eea9e', dash: 'none', k: 0, x: 0 },
  { label: 'not covered', fill: '#ffffff', dash: 'none', k: 0, x: 320 },
  { label: 'needs admin, or not visible', fill: '#e7e7e7', dash: '8 6', k: 1, x: 530 },
]
</script>

<template>
  <svg class="dg" viewBox="0 0 1240 620" width="1240" height="620">
    <g v-for="(l, i) in layers" :key="i">
      <text x="0" :y="ry(i) + 36" class="l">{{ l.name }}</text>
      <line x1="0" x2="1240" :y1="ry(i) + 72" :y2="ry(i) + 72" stroke="#e2e5e9" stroke-width="1.5" />
      <g v-for="(b, j) in boxes[i]" :key="j">
        <rect :x="b.x" :y="ry(i)" :width="b.w" height="56" :fill="fill(b)" :stroke="b.next && $clicks >= 2 ? '#0f766e' : '#1a1a1a'"
          :stroke-width="b.next && $clicks >= 2 ? 5 : 2" :stroke-dasharray="dash(b)" />
        <text :x="b.x + b.w / 2" :y="ry(i) + 36" text-anchor="middle" class="s" :style="{ fill: ink(b) }">{{ b.label }}</text>
      </g>
    </g>
    <g v-for="(g, i) in legend" :key="'lg' + i" class="step" :style="{ opacity: $clicks >= g.k ? 1 : 0 }">
      <rect :x="g.x" y="566" width="30" height="30" :fill="g.fill" stroke="#1a1a1a" stroke-width="2" :stroke-dasharray="g.dash" />
      <text :x="g.x + 42" y="589" class="s">{{ g.label }}</text>
    </g>
    <g class="step" :style="{ opacity: $clicks >= 2 ? 1 : 0 }">
      <rect x="950" y="566" width="30" height="30" fill="#ffffff" stroke="#0f766e" stroke-width="5" />
      <text x="992" y="589" class="s">next candidates</text>
    </g>
  </svg>
</template>
