<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: the axis and one tracer span. Click 1: ibmon's counter samples on the same axis.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const samples = [250, 365, 480, 595, 710, 825, 940, 1055]
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 420" width="1140" height="420">
    <defs>
      <marker id="dg-ck" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <line x1="220" y1="350" x2="1120" y2="350" stroke="#333333" stroke-width="2" marker-end="url(#dg-ck)" />
    <text x="1120" y="396" text-anchor="end" class="t">CLOCK_MONOTONIC ns</text>

    <g class="step" :style="on(0)">
      <text x="0" y="128" class="t">tracer</text>
      <text x="420" y="58" text-anchor="middle" class="s">read 17 ns</text>
      <text x="760" y="58" text-anchor="middle" class="s">read 17 ns</text>
      <rect x="420" y="80" width="340" height="64" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="590" y="122" text-anchor="middle" class="t">one span</text>
      <text x="420" y="180" text-anchor="middle" class="t">t0</text>
      <text x="760" y="180" text-anchor="middle" class="t">t1</text>
    </g>

    <g class="step" :style="on(1)">
      <text x="0" y="268" class="t">ibmon</text>
      <rect v-for="x in samples" :key="x" :x="x - 12" y="248" width="24" height="24" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="1138" y="232" text-anchor="end" class="s">counter sample</text>
      <line x1="262" x2="353" y1="300" y2="300" stroke="#333333" stroke-width="2" />
      <text x="307" y="330" text-anchor="middle" class="s">0.52 ms</text>
    </g>
  </svg>
</template>
