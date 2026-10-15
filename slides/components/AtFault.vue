<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: by default a page is only mapped when it is first written, which costs a page fault.
// Click 1: MAP_POPULATE maps every page before tracing starts.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const px = (i) => 230 + i * 150
const pages = [0, 1, 2, 3, 4, 5]
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 380" width="1140" height="380">
    <defs>
      <marker id="at-pf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <text x="0" y="132" class="l">Default</text>
    <g v-for="i in pages" :key="'d' + i">
      <rect :x="px(i)" y="84" width="130" height="80" :fill="i < 2 ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
      <text :x="px(i) + 65" y="132" text-anchor="middle" class="s">page {{ i }}</text>
    </g>
    <text :x="px(2) + 65" y="36" text-anchor="middle" class="s">first write</text>
    <line :x1="px(2) + 65" :x2="px(2) + 65" y1="46" y2="80" stroke="#333333" stroke-width="2" marker-end="url(#at-pf)" />
    <text :x="px(2) + 65" y="204" text-anchor="middle" class="s">page fault</text>

    <g class="step" :style="on(1)">
      <text x="0" y="322" class="l">Pre-faulted</text>
      <g v-for="i in pages" :key="'p' + i">
        <rect :x="px(i)" y="274" width="130" height="80" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
        <text :x="px(i) + 65" y="322" text-anchor="middle" class="s">page {{ i }}</text>
      </g>
    </g>
  </svg>
</template>
