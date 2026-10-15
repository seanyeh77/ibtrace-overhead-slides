<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: the program talks to the HCA through UCX.
// Click 1: the HCA's port counter only knows how many bytes went out.
// Click 2: libibtrace sits between the program and UCX and records every call.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const rows = [
  ['ucp_tag_send_nbx', '3.1 µs'],
  ['ibv_reg_mr', '22 µs'],
  ['ucp_worker_progress', '0.4 µs'],
  ['ibv_dereg_mr', '10 µs'],
]
</script>

<template>
  <svg class="dg" viewBox="0 0 1300 520" width="1300" height="520">
    <defs>
      <marker id="at-tc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <rect x="0" y="20" width="360" height="80" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
    <text x="180" y="68" text-anchor="middle" class="t">MPI program</text>
    <line x1="180" y1="100" x2="180" y2="278" stroke="#333333" stroke-width="2" marker-end="url(#at-tc)" />
    <rect x="0" y="280" width="360" height="80" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
    <text x="180" y="328" text-anchor="middle" class="t">UCX and verbs</text>
    <line x1="180" y1="360" x2="180" y2="408" stroke="#333333" stroke-width="2" marker-end="url(#at-tc)" />
    <rect x="0" y="410" width="360" height="80" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
    <text x="180" y="458" text-anchor="middle" class="t">HCA</text>

    <g class="step" :style="on(1)">
      <line x1="360" y1="450" x2="758" y2="450" stroke="#333333" stroke-width="2" marker-end="url(#at-tc)" />
      <text x="560" y="434" text-anchor="middle" class="s">readable by any user</text>
      <rect x="760" y="380" width="540" height="140" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="780" y="418" class="l">Port counter</text>
      <text x="780" y="466" class="t">bytes sent 1.4 GB</text>
      <text x="780" y="502" class="s m">no call, no time</text>
    </g>

    <g class="step" :style="on(2)">
      <rect x="0" y="150" width="360" height="80" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="180" y="198" text-anchor="middle" class="t">libibtrace</text>
      <line x1="360" y1="190" x2="758" y2="190" stroke="#333333" stroke-width="2" marker-end="url(#at-tc)" />
      <text x="560" y="174" text-anchor="middle" class="s">every call with its time</text>
      <rect x="760" y="20" width="540" height="320" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="780" y="56" class="l">Trace</text>
      <g v-for="(r, i) in rows" :key="i">
        <rect x="780" :y="76 + i * 62" width="500" height="50" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
        <text x="796" :y="76 + i * 62 + 33" class="s">{{ r[0] }}</text>
        <text x="1264" :y="76 + i * 62 + 33" text-anchor="end" class="s">{{ r[1] }}</text>
      </g>
    </g>
  </svg>
</template>
