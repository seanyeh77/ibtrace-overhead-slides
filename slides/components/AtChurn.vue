<script setup>
import { useSlideContext } from '@slidev/client'

// One allreduce call, drawn as a loop that repeats on the next call.
// Click 0: allocate and register. Click 1: the allreduce itself.
// Click 2: free, and glibc gives the memory back. Click 3: UCX drops the registration, and the loop repeats.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const W = 380
const H = 100
</script>

<template>
  <svg class="dg" viewBox="0 0 1300 420" width="1300" height="420">
    <defs>
      <marker id="at-ch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g class="step" :style="on(0)">
      <rect x="0" y="40" :width="W" :height="H" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="190" y="98" text-anchor="middle" class="t">malloc 1 MiB</text>
      <line x1="380" y1="90" x2="458" y2="90" stroke="#333333" stroke-width="2" marker-end="url(#at-ch)" />
      <rect x="460" y="40" :width="W" :height="H" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="650" y="98" text-anchor="middle" class="t">register on each HCA</text>
    </g>

    <g class="step" :style="on(1)">
      <line x1="840" y1="90" x2="918" y2="90" stroke="#333333" stroke-width="2" marker-end="url(#at-ch)" />
      <rect x="920" y="40" :width="W" :height="H" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="1110" y="98" text-anchor="middle" class="t">allreduce</text>
    </g>

    <g class="step" :style="on(2)">
      <line x1="1110" y1="140" x2="1110" y2="298" stroke="#333333" stroke-width="2" marker-end="url(#at-ch)" />
      <rect x="920" y="300" :width="W" :height="H" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="1110" y="358" text-anchor="middle" class="t">free</text>
      <line x1="920" y1="350" x2="842" y2="350" stroke="#333333" stroke-width="2" marker-end="url(#at-ch)" />
      <rect x="460" y="300" :width="W" :height="H" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="650" y="358" text-anchor="middle" class="t">glibc returns memory</text>
    </g>

    <g class="step" :style="on(3)">
      <line x1="460" y1="350" x2="382" y2="350" stroke="#333333" stroke-width="2" marker-end="url(#at-ch)" />
      <rect x="0" y="300" :width="W" :height="H" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="190" y="358" text-anchor="middle" class="t">UCX drops registration</text>
      <line x1="190" y1="300" x2="190" y2="142" stroke="#333333" stroke-width="2" marker-end="url(#at-ch)" />
      <text x="206" y="228" class="s">next call</text>
    </g>
  </svg>
</template>
