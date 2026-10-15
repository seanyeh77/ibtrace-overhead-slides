<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: the run with the bottleneck. Click 1: the same run after the action.
// Click 2: the difference is the gain of that action.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 400" width="1140" height="400">
    <defs>
      <marker id="at-dl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <text x="0" y="88" class="l">With bottleneck</text>
    <rect x="260" y="40" width="800" height="80" fill="#aeacac" stroke="#1a1a1a" stroke-width="2" />
    <text x="660" y="90" text-anchor="middle" class="t">T 100 ms</text>

    <g class="step" :style="on(1)">
      <text x="0" y="228" class="l">After the action</text>
      <rect x="260" y="180" width="656" height="80" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="588" y="230" text-anchor="middle" class="t">T 82 ms</text>
    </g>

    <g class="step" :style="on(2)">
      <line x1="916" y1="262" x2="916" y2="330" stroke="#333333" stroke-width="2" stroke-dasharray="6 6" />
      <line x1="1060" y1="122" x2="1060" y2="330" stroke="#333333" stroke-width="2" stroke-dasharray="6 6" />
      <line x1="920" y1="310" x2="1056" y2="310" stroke="#333333" stroke-width="2" marker-start="url(#at-dl)" marker-end="url(#at-dl)" />
      <text x="988" y="370" text-anchor="middle" class="t">ΔT 18 ms</text>
    </g>
  </svg>
</template>
