<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: input to compare, with the golden files. Click 1: the two outcomes.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const box = (x, y, w, fill = '#adf0c7') => ({ x, y, width: w, height: 60, fill, stroke: '#1a1a1a', 'stroke-width': 2 })
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 560" width="1140" height="560">
    <defs>
      <marker id="dg-gd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g class="step" :style="on(0)">
      <rect v-bind="box(200, 0, 260)" />
      <text x="330" y="38" text-anchor="middle" class="t">fixed input</text>
      <line x1="330" y1="60" x2="330" y2="98" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
      <rect v-bind="box(200, 100, 260)" />
      <text x="330" y="138" text-anchor="middle" class="t">analysis tools</text>
      <line x1="330" y1="160" x2="330" y2="198" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
      <rect v-bind="box(200, 200, 260)" />
      <text x="330" y="238" text-anchor="middle" class="t">output</text>
      <line x1="330" y1="260" x2="330" y2="298" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
      <rect v-bind="box(200, 300, 260)" />
      <text x="330" y="338" text-anchor="middle" class="t">byte compare</text>

      <rect v-bind="box(660, 300, 260, '#6eea9e')" />
      <text x="790" y="338" text-anchor="middle" class="t">golden files</text>
      <line x1="660" y1="330" x2="462" y2="330" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
    </g>

    <g class="step" :style="on(1)">
      <line x1="330" y1="360" x2="330" y2="410" stroke="#333333" stroke-width="2" />
      <line x1="160" y1="410" x2="500" y2="410" stroke="#333333" stroke-width="2" />
      <line x1="160" y1="410" x2="160" y2="468" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
      <line x1="500" y1="410" x2="500" y2="468" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
      <text x="148" y="448" text-anchor="end" class="s">same</text>
      <text x="512" y="448" class="s">differ</text>
      <rect v-bind="box(40, 470, 240)" />
      <text x="160" y="508" text-anchor="middle" class="t">pass</text>
      <rect v-bind="box(380, 470, 240)" />
      <text x="500" y="508" text-anchor="middle" class="t">review</text>
      <line x1="620" y1="500" x2="658" y2="500" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
      <rect v-bind="box(660, 470, 260)" />
      <text x="790" y="508" text-anchor="middle" class="t">update golden</text>
      <line x1="790" y1="470" x2="790" y2="362" stroke="#333333" stroke-width="2" marker-end="url(#dg-gd)" />
      <text x="804" y="424" class="s">if intended</text>
    </g>
  </svg>
</template>
