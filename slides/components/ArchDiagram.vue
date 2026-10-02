<script setup>
import { useSlideContext } from '@slidev/client'

// ibtrace architecture, Miro palette, English labels, top to bottom.
// Click 0: the call stack and the NIC. Click 1: libibtrace. Click 2: ring and ibmon.
const { $clicks } = useSlideContext()
const on = (k) => ({ opacity: $clicks.value >= k ? 1 : 0 })

const C = { outer: '#aeacac', inner: '#e7e7e7', svc: '#adf0c7', bar: '#6eea9e', ink: '#1a1a1a', line: '#333333' }
const box = (x, y, w, h, fill) => ({ x, y, width: w, height: h, fill, stroke: C.ink, 'stroke-width': 2 })
</script>

<template>
  <svg class="chart arch" viewBox="0 0 1340 790" width="1340" height="790">
    <defs>
      <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" :fill="C.line" />
      </marker>
    </defs>

    <!-- Compute node and the NIC -->
    <rect v-bind="box(0, 0, 1340, 650, C.outer)" />
    <text x="18" y="34" class="a-lab">Compute node</text>

    <rect v-bind="box(24, 52, 736, 468, C.inner)" />
    <text x="42" y="86" class="a-lab">Test process</text>

    <rect v-bind="box(60, 104, 260, 60, C.svc)" />
    <text x="190" y="142" text-anchor="middle" class="a-t">ucx_ib_test</text>
    <rect v-bind="box(60, 204, 260, 60, C.svc)" />
    <text x="190" y="242" text-anchor="middle" class="a-t">UCP</text>
    <rect v-bind="box(60, 304, 260, 60, C.svc)" />
    <text x="190" y="342" text-anchor="middle" class="a-t">UCT</text>
    <rect v-bind="box(140, 424, 180, 60, C.svc)" />
    <text x="230" y="462" text-anchor="middle" class="a-t">verbs</text>

    <line x1="190" y1="164" x2="190" y2="202" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
    <line x1="190" y1="264" x2="190" y2="302" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
    <!-- rc_verbs: UCT -> verbs -> HCA -->
    <line x1="230" y1="364" x2="230" y2="422" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
    <text x="242" y="402" class="a-s">rc_verbs</text>
    <line x1="230" y1="484" x2="230" y2="558" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
    <!-- rc_mlx5: UCT -> HCA, past verbs -->
    <line x1="90" y1="364" x2="90" y2="558" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
    <text x="100" y="402" class="a-s">rc_mlx5</text>

    <rect v-bind="box(60, 560, 1232, 60, C.bar)" />
    <text x="676" y="598" text-anchor="middle" class="a-t">HCA with port counters</text>

    <line x1="676" y1="622" x2="676" y2="712" :stroke="C.line" stroke-width="2" marker-start="url(#arw)" marker-end="url(#arw)" />
    <text x="690" y="676" class="a-s">InfiniBand link</text>
    <rect v-bind="box(556, 714, 240, 60, C.inner)" />
    <text x="676" y="752" text-anchor="middle" class="a-t">Peer node</text>

    <!-- Click 1: the tracer -->
    <g class="c-bar" :style="on(1)">
      <rect v-bind="box(470, 204, 270, 280, C.svc)" />
      <text x="605" y="334" text-anchor="middle" class="a-t">libibtrace</text>
      <text x="605" y="370" text-anchor="middle" class="a-s">LD_PRELOAD</text>
      <line x1="320" y1="234" x2="470" y2="234" :stroke="C.line" stroke-width="2" />
      <text x="395" y="220" text-anchor="middle" class="a-s">intercept</text>
      <line x1="320" y1="334" x2="470" y2="334" :stroke="C.line" stroke-width="2" />
      <line x1="320" y1="454" x2="470" y2="454" :stroke="C.line" stroke-width="2" />
    </g>

    <!-- Click 2: ring and ibmon -->
    <g class="c-bar" :style="on(2)">
      <rect v-bind="box(850, 294, 210, 80, C.bar)" />
      <text x="955" y="328" text-anchor="middle" class="a-t">ring</text>
      <text x="955" y="358" text-anchor="middle" class="a-s">shared memory</text>
      <line x1="740" y1="334" x2="848" y2="334" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
      <text x="805" y="318" text-anchor="middle" class="a-s">write</text>

      <rect v-bind="box(1120, 52, 196, 468, C.inner)" />
      <text x="1136" y="86" class="a-lab">Monitor</text>
      <rect v-bind="box(1140, 304, 160, 60, C.svc)" />
      <text x="1220" y="342" text-anchor="middle" class="a-t">ibmon</text>
      <line x1="1060" y1="334" x2="1138" y2="334" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
      <text x="1090" y="318" text-anchor="middle" class="a-s">read</text>
      <line x1="1220" y1="558" x2="1220" y2="366" :stroke="C.line" stroke-width="2" marker-end="url(#arw)" />
      <text x="1208" y="470" text-anchor="end" class="a-s">sample</text>
    </g>
  </svg>
</template>

<style scoped>
.arch .a-t { font-size: 24px; font-family: var(--tb-mono); }
.arch .a-s { font-size: 21px; font-family: var(--tb-mono); }
.arch .a-lab { font-size: 22px; font-weight: 600; }
</style>
