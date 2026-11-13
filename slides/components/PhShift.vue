<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useProgress, useClock, seg, clamp } from '../utils/tween.js'

// Why rank 3's list is shifted by one, with moving parts:
// step 1 the sends appear in time order, step 2 the receives appear and packets fly,
// step 3 each pass's messages fly down into two lists, step 4 the big message drops
// into the first small buffer and bounces off.
const { $clicks } = useSlideContext()
const props = defineProps({ offset: { type: Number, default: 0 } })
const c = computed(() => Math.max($clicks.value - props.offset, 0))
const p = useProgress(() => $clicks.value, 1000)
// entering (step 0): the two pass-95 boxes grow from where the previous part left them
const z = computed(() => (c.value === 0 ? seg(p.value, 0, 1) : 1))
const L = (a, b) => a + (b - a) * z.value
const ry = computed(() => L(190, 250))
const t = useClock()
const SY = 60, RY = 250, LY1 = 400, LY2 = 470
const sends = [{ x: 470, big: true }, { x: 640, big: false }, { x: 800, big: false }, { x: 960, big: false }, { x: 1290, big: true }]
const recvs = [{ x: 330, big: true, to: 0 }, { x: 660, big: false, to: 1 }, { x: 820, big: false, to: 2 }, { x: 980, big: false, to: 3 }, { x: 1160, big: true, to: 4 }]
const bw = (b) => (b ? 70 : 34)
// appearance along the time axis
const shown = (x, k) => (c.value > k ? 1 : c.value === k ? clamp((p.value * 1500 + 200 - x) / 80, 0, 1) : 0)
// a packet travelling from a send to its receive, looping
const pk = (r) => {
  const s = sends[r.to], u = ((t.value + r.to * 200) % 1000) / 1000
  const x1 = s.x + bw(s.big) / 2, y1 = SY + 36, x2 = r.x + bw(r.big) / 2, y2 = RY
  return { x: x1 + (x2 - x1) * u, y: y1 + (y2 - y1) * u }
}
// the lists: indices into sends / recvs that fall in each rank's pass 95
const sIn = [0, 1, 2, 3], rIn = [1, 2, 3, 4]
const fly = computed(() => (c.value >= 4 ? 1 : c.value === 3 ? seg(p.value, 0.2, 0.8) : 0))
const lx = (i) => 200 + i * 130
const at = (from, to) => from + (to - from) * fly.value
// step 4: rank 2's first item drops onto rank 3's first item, then bounces back
const drop = computed(() => {
  if (c.value < 4) return 0
  const a = seg(p.value, 0, 0.35), b = seg(p.value, 0.45, 0.75)
  return (a - b * 0.7) * (LY2 - LY1)
})
const hit = computed(() => c.value >= 4 && p.value > 0.35)
const shake = computed(() => (hit.value ? Math.sin(p.value * 70) * 7 * clamp(1 - (p.value - 0.35) * 2, 0, 1) : 0))
const caps = [
  '每個 rank 用自己的時間切出「第 95 圈」（虛線）',
  'rank 2 在第 95 圈先送 1 則大訊息，再送 3 則小訊息',
  'rank 3 很早就先準備好收大訊息：早到落在自己的第 94 圈',
  '各取第 95 圈：rank 2 是「大 小 小 小」，rank 3 是「小 小 小 大」',
  '演練照順序配對：第 1 則大訊息配到第 1 個小緩衝，放不下（MPI_ERR_TRUNCATE）',
]
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 700" width="1576" height="700" style="overflow: visible">
    <text x="0" :y="SY + 26" class="l">rank 2 送</text>
    <text x="0" :y="ry + 26" class="l">rank 3 收</text>
    <line x1="200" x2="1500" :y1="SY + 18" :y2="SY + 18" stroke="#aeacac" stroke-width="2" />
    <line x1="200" x2="1500" :y1="ry + 18" :y2="ry + 18" stroke="#aeacac" stroke-width="2" />

    <rect :x="L(536, 420)" :y="L(30, 30)" :width="L(312, 800)" :height="L(120, 96)" fill="#adf0c7" :fill-opacity="c >= 3 ? 0.5 : 0" stroke="#0f766e" stroke-width="2" stroke-dasharray="8 6" />
    <text :x="L(536, 420) + 10" :y="SY - 40" class="s" style="fill: #0f766e" :style="{ opacity: z }">rank 2 的第 95 圈</text>
    <rect :x="L(678, 440)" :y="ry - L(30, 30)" :width="L(312, 800)" :height="L(120, 96)" fill="#adf0c7" :fill-opacity="c >= 3 ? 0.5 : 0" stroke="#0f766e" stroke-width="2" stroke-dasharray="8 6" />
    <text :x="L(678, 440) + 10" :y="ry + 88" class="s" style="fill: #0f766e" :style="{ opacity: z }">rank 3 的第 95 圈</text>

    <g v-for="(s, i) in sends" :key="'s' + i" :style="{ opacity: shown(s.x, 1) }">
      <rect :x="s.x" :y="SY" :width="bw(s.big)" height="36" :fill="s.big ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
      <text :x="s.x + bw(s.big) / 2" :y="SY + 26" text-anchor="middle" class="s">{{ s.big ? '大' : '小' }}</text>
    </g>
    <g v-for="(r, i) in recvs" :key="'r' + i" :style="{ opacity: shown(r.x, 2) }">
      <rect :x="r.x" :y="RY" :width="bw(r.big)" height="36" :fill="r.big ? '#6eea9e' : '#e7e7e7'"
        :stroke="i === 0 ? '#c0392b' : '#1a1a1a'" :stroke-width="i === 0 ? 3 : 2" />
      <text :x="r.x + bw(r.big) / 2" :y="RY + 26" text-anchor="middle" class="s">{{ r.big ? '大' : '小' }}</text>
      <line :x1="sends[r.to].x + bw(sends[r.to].big) / 2" :y1="SY + 40" :x2="r.x + bw(r.big) / 2" :y2="RY - 4"
        stroke="#bbbbbb" stroke-width="2" stroke-dasharray="5 5" />
      <circle v-if="c >= 2" :cx="pk(r).x" :cy="pk(r).y" :r="r.big ? 9 : 6" fill="#0f766e" />
    </g>
    <g v-if="c < 2">
      <rect :x="L(644, 330)" :y="ry" :width="L(22, 70)" height="36" fill="#6eea9e" stroke="#c0392b" stroke-width="3" />
      <text :x="L(644, 330) + L(11, 35)" :y="ry - 14" text-anchor="middle" class="s" style="fill: #c0392b">提前開的接收</text>
    </g>
    <text x="230" :y="RY + 88" class="s" style="fill: #c0392b" :style="{ opacity: c >= 2 ? 1 : 0 }">第 94 圈</text>

    <g :style="{ opacity: c >= 3 ? 1 : 0 }">
      <text x="0" :y="LY1 + 31" class="l">rank 2</text>
      <text x="0" :y="LY2 + 31" class="l">rank 3</text>
      <g v-for="(j, i) in sIn" :key="'ls' + i" :transform="`translate(0,${i === 0 ? drop : 0})`">
        <rect :x="at(sends[j].x, lx(i))" :y="at(SY, LY1)" width="110" height="46" :fill="sends[j].big ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
        <text :x="at(sends[j].x, lx(i)) + 55" :y="at(SY, LY1) + 31" text-anchor="middle" class="t">{{ sends[j].big ? '大' : '小' }}</text>
      </g>
      <g v-for="(j, i) in rIn" :key="'lr' + i" :transform="`translate(${i === 0 ? shake : 0},0)`">
        <rect :x="at(recvs[j].x, lx(i))" :y="at(RY, LY2)" width="110" height="46" :fill="recvs[j].big ? '#6eea9e' : '#e7e7e7'"
          :stroke="hit && i === 0 ? '#c0392b' : '#1a1a1a'" :stroke-width="hit && i === 0 ? 3 : 2" />
        <text :x="at(recvs[j].x, lx(i)) + 55" :y="at(RY, LY2) + 31" text-anchor="middle" class="t">{{ recvs[j].big ? '大' : '小' }}</text>
      </g>
    </g>
    <text x="760" y="470" class="l" style="fill: #c0392b" :style="{ opacity: hit ? 1 : 0 }">大訊息放不進小緩衝</text>
    <text x="0" y="610" class="l" :style="{ fill: c >= 4 ? '#c0392b' : '#1a1a1a' }">{{ caps[Math.min(c, 4)] }}</text>
    <text x="0" y="656" class="s m">Step {{ Math.min(c, 4) + 12 }} / 24　綠點是訊息在傳；時間是示意，實際提前 348.3 µs</text>
  </svg>
</template>
