<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: the parent's two pages. Click 1: fork and the child's copies. Click 2: getpid.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 560" width="1140" height="560">
    <defs>
      <marker id="dg-wp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g class="step" :style="on(0)">
      <rect x="0" y="20" width="400" height="390" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="20" y="56" class="l">Parent</text>
      <rect x="30" y="90" width="340" height="100" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="200" y="130" text-anchor="middle" class="s">normal page</text>
      <text x="200" y="168" text-anchor="middle" class="t">pid 4242</text>
      <rect x="30" y="240" width="340" height="100" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="200" y="280" text-anchor="middle" class="s">WIPEONFORK page</text>
      <text x="200" y="318" text-anchor="middle" class="t">pid 4242</text>
    </g>

    <g class="step" :style="on(1)">
      <line x1="400" y1="215" x2="538" y2="215" stroke="#333333" stroke-width="2" marker-end="url(#dg-wp)" />
      <text x="470" y="200" text-anchor="middle" class="t">fork</text>
      <rect x="540" y="20" width="600" height="530" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <text x="560" y="56" class="l">Child</text>
      <rect x="570" y="90" width="340" height="100" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="740" y="130" text-anchor="middle" class="s">normal page</text>
      <text x="740" y="168" text-anchor="middle" class="t">pid 4242</text>
      <text x="930" y="150" class="t">stale</text>
      <rect x="570" y="240" width="340" height="100" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="740" y="280" text-anchor="middle" class="s">WIPEONFORK page</text>
      <text x="740" y="318" text-anchor="middle" class="t">pid 0</text>
      <text x="930" y="300" class="t">zeroed</text>
    </g>

    <g class="step" :style="on(2)">
      <line x1="740" y1="340" x2="740" y2="428" stroke="#333333" stroke-width="2" marker-end="url(#dg-wp)" />
      <text x="754" y="392" class="s">getpid</text>
      <rect x="570" y="430" width="340" height="80" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="740" y="480" text-anchor="middle" class="t">pid 4243</text>
    </g>
  </svg>
</template>
