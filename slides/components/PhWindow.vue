<script setup>
import { useSlideContext } from '@slidev/client'

// Why the receiver's sequence is shifted: rank 3 posts the 81,920 B receive early,
// before its own period starts, so it falls in the previous period.
// Click 1: both periods (start 48.9 us apart). Click 2: the send. Click 3: the early receive.
// Click 4: the next receive at the end of rank 3's period.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })
const XS = 380, XR = 430, XE = 1300
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1456 520" width="1456" height="520" style="overflow: visible">
    <defs>
      <marker id="ph-wn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>
    <text x="0" y="96" class="l">rank 2 送方</text>
    <text x="0" y="306" class="l">rank 3 收方</text>
    <line x1="180" x2="1440" y1="90" y2="90" stroke="#aeacac" stroke-width="2" />
    <line x1="180" x2="1440" y1="300" y2="300" stroke="#aeacac" stroke-width="2" />

    <g class="step" :style="on(1)">
      <rect :x="XS" y="56" :width="XE - XS" height="68" fill="#adf0c7" fill-opacity="0.5" stroke="#1a1a1a" stroke-width="2" />
      <text :x="XS + 12" y="46" class="s">第 95 個週期</text>
      <rect :x="XR" y="266" :width="XE + 10 - XR" height="68" fill="#adf0c7" fill-opacity="0.5" stroke="#1a1a1a" stroke-width="2" />
      <text :x="XR + 12" y="256" class="s">第 95 個週期（晚 48.9 µs 開始）</text>
    </g>
    <g class="step" :style="on(2)">
      <rect x="500" y="72" width="34" height="36" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="550" y="98" class="s">送 81,920 B</text>
    </g>
    <g class="step" :style="on(3)">
      <rect x="250" y="282" width="34" height="36" fill="#6eea9e" stroke="#c0392b" stroke-width="3" />
      <line x1="284" x2="496" y1="300" y2="110" stroke="#333333" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#ph-wn)" />
      <text x="190" y="376" class="s" style="fill: #c0392b">提前 348.3 µs 開好接收</text>
      <text x="190" y="408" class="s" style="fill: #c0392b">落在第 94 個週期</text>
    </g>
    <g class="step" :style="on(4)">
      <rect x="1250" y="282" width="34" height="36" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="1267" y="376" text-anchor="middle" class="s">下一次的接收</text>
      <text x="0" y="480" class="l">收方的週期少了這次的大訊息，多了下一次的：序列差一格</text>
    </g>
  </svg>
</template>
