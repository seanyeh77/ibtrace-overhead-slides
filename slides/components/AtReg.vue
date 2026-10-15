<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: a buffer in the program's memory. Click 1: it is registered with HCA 0.
// Click 2: a second HCA needs its own registration of the same buffer.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 480" width="1140" height="480">
    <defs>
      <marker id="at-rr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <rect x="0" y="20" width="420" height="440" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
    <text x="20" y="60" class="l">Process memory</text>
    <rect x="40" y="200" width="340" height="100" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
    <text x="210" y="258" text-anchor="middle" class="t">1 MiB buffer</text>

    <g class="step" :style="on(1)">
      <path d="M380,230 H470 V120 H738" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#at-rr)" />
      <text x="604" y="104" text-anchor="middle" class="s">register 22 µs</text>
      <rect x="740" y="60" width="400" height="120" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="940" y="112" text-anchor="middle" class="t">HCA 0</text>
      <text x="940" y="150" text-anchor="middle" class="s">knows the buffer</text>
    </g>

    <g class="step" :style="on(2)">
      <path d="M380,270 H500 V380 H738" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#at-rr)" />
      <text x="619" y="364" text-anchor="middle" class="s">register 22 µs</text>
      <rect x="740" y="320" width="400" height="120" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="940" y="372" text-anchor="middle" class="t">HCA 1</text>
      <text x="940" y="410" text-anchor="middle" class="s">knows the buffer</text>
    </g>
  </svg>
</template>
