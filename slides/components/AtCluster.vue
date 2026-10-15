<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: two nodes, each with a program, UCX and eight HCAs joined by eight rails.
// Click 1: UCX sends a large message over two of the eight rails.
const { $clicks } = useSlideContext()
const hcas = [0, 1, 2, 3, 4, 5, 6, 7]
const hy = (i) => 70 + i * 64
const used = (i) => i === 0 || i === 3
const fill = (i) => ($clicks.value >= 1 ? (used(i) ? '#6eea9e' : '#e7e7e7') : '#adf0c7')
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
</script>

<template>
  <svg class="dg" viewBox="0 0 1300 600" width="1300" height="600">
    <defs>
      <marker id="at-cl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <!-- Node A -->
    <rect x="0" y="0" width="560" height="600" fill="#aeacac" stroke="#1a1a1a" stroke-width="2" />
    <text x="20" y="40" class="l">Node A</text>
    <rect x="30" y="80" width="300" height="90" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
    <text x="180" y="133" text-anchor="middle" class="t">MPI program</text>
    <line x1="180" y1="170" x2="180" y2="258" stroke="#333333" stroke-width="2" marker-end="url(#at-cl)" />
    <rect x="30" y="260" width="300" height="90" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
    <text x="180" y="313" text-anchor="middle" class="t">UCX</text>
    <g v-for="i in hcas" :key="'a' + i">
      <rect x="390" :y="hy(i)" width="150" height="48" :fill="fill(i)" stroke="#1a1a1a" stroke-width="2" />
      <text x="465" :y="hy(i) + 32" text-anchor="middle" class="s">HCA {{ i }}</text>
    </g>

    <!-- Node B -->
    <rect x="740" y="0" width="560" height="600" fill="#aeacac" stroke="#1a1a1a" stroke-width="2" />
    <text x="1280" y="40" text-anchor="end" class="l">Node B</text>
    <rect x="970" y="80" width="300" height="90" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
    <text x="1120" y="133" text-anchor="middle" class="t">MPI program</text>
    <line x1="1120" y1="170" x2="1120" y2="258" stroke="#333333" stroke-width="2" marker-end="url(#at-cl)" />
    <rect x="970" y="260" width="300" height="90" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
    <text x="1120" y="313" text-anchor="middle" class="t">UCX</text>
    <g v-for="i in hcas" :key="'b' + i">
      <rect x="760" :y="hy(i)" width="150" height="48" :fill="fill(i)" stroke="#1a1a1a" stroke-width="2" />
      <text x="835" :y="hy(i) + 32" text-anchor="middle" class="s">HCA {{ i }}</text>
    </g>

    <!-- Rails -->
    <text x="650" y="50" text-anchor="middle" class="s">8 rails</text>
    <line v-for="i in hcas" :key="'r' + i" x1="540" x2="760" :y1="hy(i) + 24" :y2="hy(i) + 24" stroke="#333333" stroke-width="2" />

    <!-- UCX picks two rails -->
    <g class="step" :style="on(1)">
      <path d="M330,272 H360 V94 H388" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#at-cl)" />
      <line x1="330" y1="286" x2="388" y2="286" stroke="#333333" stroke-width="2" marker-end="url(#at-cl)" />
      <path d="M970,272 H940 V94 H912" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#at-cl)" />
      <line x1="970" y1="286" x2="912" y2="286" stroke="#333333" stroke-width="2" marker-end="url(#at-cl)" />
    </g>
  </svg>
</template>
