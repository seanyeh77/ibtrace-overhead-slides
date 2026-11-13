<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Why rank 3's list is shifted by one. Each rank cuts its own laps by its own clock.
// rank 3 gets ready for the big message so early that the "ready" falls in its previous lap.
const { $clicks } = useSlideContext()
const c = computed(() => $clicks.value)
const on = (k) => ({ opacity: c.value >= k ? 1 : 0 })
const SY = 60, RY = 250
const sends = [{ x: 470, big: true }, { x: 640, big: false }, { x: 800, big: false }, { x: 960, big: false }, { x: 1290, big: true }]
const recvs = [{ x: 330, big: true, to: 0 }, { x: 660, big: false, to: 1 }, { x: 820, big: false, to: 2 }, { x: 980, big: false, to: 3 }, { x: 1160, big: true, to: 4 }]
const bw = (b) => (b ? 70 : 34)
const caps = [
  '每個 rank 用自己的時間切出「第 95 圈」（虛線）',
  'rank 2 在第 95 圈先送 1 則大訊息，再送 3 則小訊息',
  'rank 3 很早就先準備好收大訊息：早到落在自己的第 94 圈',
  '各取第 95 圈：rank 2 是「大 小 小 小」，rank 3 是「小 小 小 大」',
  '演練照順序配對：第 1 則大訊息配到第 1 個小緩衝，放不下（MPI_ERR_TRUNCATE）',
]
const sl = ['大', '小', '小', '小']
const rl = ['小', '小', '小', '大']
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1556 700" width="1556" height="700" style="overflow: visible">
    <defs>
      <marker id="ph-sh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#888888" />
      </marker>
    </defs>
    <text x="0" :y="SY + 26" class="l">rank 2 送</text>
    <text x="0" :y="RY + 26" class="l">rank 3 收</text>
    <line x1="200" x2="1500" :y1="SY + 18" :y2="SY + 18" stroke="#aeacac" stroke-width="2" />
    <line x1="200" x2="1500" :y1="RY + 18" :y2="RY + 18" stroke="#aeacac" stroke-width="2" />

    <rect x="420" :y="SY - 30" width="800" height="96" :fill="c >= 3 ? '#adf0c7' : 'none'" fill-opacity="0.45" stroke="#0f766e" stroke-width="2" stroke-dasharray="8 6" />
    <text x="430" :y="SY - 40" class="s" style="fill: #0f766e">rank 2 的第 95 圈</text>
    <rect x="440" :y="RY - 30" width="800" height="96" :fill="c >= 3 ? '#adf0c7' : 'none'" fill-opacity="0.45" stroke="#0f766e" stroke-width="2" stroke-dasharray="8 6" />
    <text x="450" :y="RY + 88" class="s" style="fill: #0f766e">rank 3 的第 95 圈</text>

    <g class="step" :style="on(1)">
      <g v-for="(s, i) in sends" :key="i">
        <rect :x="s.x" :y="SY" :width="bw(s.big)" height="36" :fill="s.big ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
        <text :x="s.x + bw(s.big) / 2" :y="SY + 26" text-anchor="middle" class="s">{{ s.big ? '大' : '小' }}</text>
      </g>
    </g>
    <g class="step" :style="on(2)">
      <g v-for="(r, i) in recvs" :key="i">
        <rect :x="r.x" :y="RY" :width="bw(r.big)" height="36" :fill="r.big ? '#6eea9e' : '#e7e7e7'"
          :stroke="i === 0 ? '#c0392b' : '#1a1a1a'" :stroke-width="i === 0 ? 3 : 2" />
        <text :x="r.x + bw(r.big) / 2" :y="RY + 26" text-anchor="middle" class="s">{{ r.big ? '大' : '小' }}</text>
        <line :x1="r.x + bw(r.big) / 2" :y1="RY - 4" :x2="sends[r.to].x + bw(sends[r.to].big) / 2" :y2="SY + 40"
          stroke="#888888" stroke-width="2" stroke-dasharray="5 5" marker-end="url(#ph-sh)" />
      </g>
      <text x="230" :y="RY + 88" class="s" style="fill: #c0392b">第 94 圈</text>
    </g>

    <g class="step" :style="on(3)">
      <text x="0" y="430" class="l">rank 2</text>
      <text x="0" y="500" class="l">rank 3</text>
      <g v-for="(t, i) in sl" :key="'s' + i">
        <rect :x="200 + i * 130" y="400" width="110" height="46" :fill="t === '大' ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
        <text :x="255 + i * 130" y="431" text-anchor="middle" class="t">{{ t }}</text>
      </g>
      <g v-for="(t, i) in rl" :key="'r' + i">
        <rect :x="200 + i * 130" y="470" width="110" height="46" :fill="t === '大' ? '#6eea9e' : '#e7e7e7'"
          :stroke="c >= 4 && i === 0 ? '#c0392b' : '#1a1a1a'" :stroke-width="c >= 4 && i === 0 ? 3 : 2" />
        <text :x="255 + i * 130" y="501" text-anchor="middle" class="t">{{ t }}</text>
      </g>
    </g>
    <g class="step" :style="on(4)">
      <line x1="255" x2="255" y1="448" y2="468" stroke="#c0392b" stroke-width="4" />
      <text x="760" y="470" class="l" style="fill: #c0392b">大訊息放不進小緩衝</text>
    </g>
    <text x="0" y="600" class="l" :style="{ fill: c >= 4 ? '#c0392b' : '#1a1a1a' }">{{ caps[Math.min(c, 4)] }}</text>
    <text x="0" y="650" class="s m">Step {{ Math.min(c, 4) + 1 }} / 5　時間是示意；實際提前 348.3 µs</text>
  </svg>
</template>
