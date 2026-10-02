<script setup>
import { useSlideContext } from '@slidev/client'

// Click 0: snprintf's steps. Click 1: copy_name's steps. Click 2: the 28-byte name field.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const name = 'ucp_worker_progress'
const cells = Array.from({ length: 28 }, (_, i) => i)
const cx = (i) => 10 + i * 40
</script>

<template>
  <svg class="dg" viewBox="0 0 1140 430" width="1140" height="430">
    <defs>
      <marker id="dg-sn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>

    <g class="step" :style="on(0)">
      <text x="0" y="68" class="t">snprintf</text>
      <rect x="190" y="30" width="230" height="60" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="305" y="68" text-anchor="middle" class="t">parse format</text>
      <line x1="420" y1="60" x2="458" y2="60" stroke="#333333" stroke-width="2" marker-end="url(#dg-sn)" />
      <rect x="460" y="30" width="140" height="60" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="530" y="68" text-anchor="middle" class="t">copy</text>
      <line x1="600" y1="60" x2="638" y2="60" stroke="#333333" stroke-width="2" marker-end="url(#dg-sn)" />
      <rect x="640" y="30" width="120" height="60" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="700" y="68" text-anchor="middle" class="t">NUL</text>
      <text x="790" y="68" class="t">61 ns</text>
    </g>

    <g class="step" :style="on(1)">
      <text x="0" y="168" class="t">copy_name</text>
      <rect x="190" y="130" width="230" height="60" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="305" y="168" text-anchor="middle" class="t">strnlen</text>
      <line x1="420" y1="160" x2="458" y2="160" stroke="#333333" stroke-width="2" marker-end="url(#dg-sn)" />
      <rect x="460" y="130" width="140" height="60" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="530" y="168" text-anchor="middle" class="t">memcpy</text>
      <line x1="600" y1="160" x2="638" y2="160" stroke="#333333" stroke-width="2" marker-end="url(#dg-sn)" />
      <rect x="640" y="130" width="120" height="60" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="700" y="168" text-anchor="middle" class="t">NUL</text>
      <text x="790" y="168" class="t">no parsing</text>
    </g>

    <g class="step" :style="on(2)">
      <text x="10" y="262" class="l">Name field in one record, 28 bytes, same from both</text>
      <g v-for="i in cells" :key="i">
        <rect :x="cx(i)" y="280" width="40" height="56"
          :fill="i < name.length ? '#adf0c7' : i === name.length ? '#6eea9e' : '#e7e7e7'"
          stroke="#1a1a1a" stroke-width="2" />
        <text v-if="i < name.length" :x="cx(i) + 20" y="316" text-anchor="middle" class="s">{{ name[i] }}</text>
        <text v-else-if="i === name.length" :x="cx(i) + 20" y="316" text-anchor="middle" class="s">\0</text>
      </g>
      <line :x1="cx(0)" :x2="cx(name.length) - 4" y1="356" y2="356" stroke="#333333" stroke-width="2" />
      <text :x="(cx(0) + cx(name.length)) / 2" y="392" text-anchor="middle" class="s">api name</text>
      <line :x1="cx(name.length + 1) + 4" :x2="cx(27) + 40" y1="356" y2="356" stroke="#333333" stroke-width="2" />
      <text :x="(cx(name.length + 1) + cx(27) + 40) / 2" y="392" text-anchor="middle" class="s">old bytes kept</text>
    </g>
  </svg>
</template>
