<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useProgress, seg } from '../utils/tween.js'

// How "pass 95" is found. Each rank cuts passes at its own anchors (its biggest send of the
// period); then one pass number is chosen: drop the first and last 10 %, sort the passes by
// the slowest rank's time, take the median. Finally each rank uses ITS OWN range for that pass.
const { $clicks } = useSlideContext()
const props = defineProps({ offset: { type: Number, default: 0 } })
const c = computed(() => Math.min(Math.max($clicks.value - props.offset, 0), 4))
const p = useProgress(() => $clicks.value, 1000)
// entering (step 0): the anchors slide from where the previous part drew them
const z = computed(() => (c.value === 0 ? seg(p.value, 0, 1) : 1))
const L = (a, b) => a + (b - a) * z.value
const from2 = [277, 589, 901, 1213, 1525], from3 = [419, 731, 1043, 1355, 1667]
const R2 = 60, R3 = 190, LW = 300, A0 = 260
const a2 = [0, 1, 2, 3, 4].map((i) => A0 + i * LW)
const a3 = a2.map((x) => x + 26)
const passNo = (i) => 93 + i
// 30 bars stand for the 254 passes; values are illustrative
const N = 30
const vals = Array.from({ length: N }, (_, i) => 40 + ((i * 37 + 11) % 23) * 3 + (i < 3 || i > 26 ? 30 : 0))
const keep = (i) => i >= 3 && i < N - 3
const order = computed(() => {
  const ks = [...Array(N).keys()].filter(keep).sort((x, y) => vals[x] - vals[y] || x - y)
  const pos = {}
  ks.forEach((k, j) => { pos[k] = j })
  return { ks, pos }
})
const mid = computed(() => order.value.ks[Math.floor(order.value.ks.length / 2)])
const BX = 260, BW = 34
const sortP = computed(() => (c.value >= 4 ? 1 : c.value === 3 ? seg(p.value, 0.1, 0.8) : 0))
const bx = (i) => {
  const x0 = BX + i * BW
  if (!keep(i)) return x0
  const x1 = BX + (order.value.pos[i] + 3) * BW
  return x0 + (x1 - x0) * sortP.value
}
const cut = computed(() => (c.value >= 2 ? 1 : c.value === 1 ? seg(p.value, 0, 0.7) : 0))
const caps = [
  '只留下錨點：兩個 rank 的時間軸上，每個 ▼ 是一圈的開始',
  '每個 rank 從自己的錨點切到下一個錨點，就是一圈；rank 3 的錨點晚一點',
  '要挑一圈來演練：每一圈記下最慢 rank 的時間（每根柱子一圈）；頭尾各 10 % 不用',
  '把剩下的圈按時間排序，取正中間那一圈：這份 LU 是第 95 圈',
  '兩個 rank 都用第 95 圈，但範圍各自不同；rank 3 提前開的接收（紅）落在它的範圍外',
]
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 700" width="1576" height="700" style="overflow: visible">
    <text x="0" :y="R2 + 26" class="l">rank 2</text>
    <text x="0" :y="R3 + 26" class="l">rank 3</text>
    <line x1="200" x2="1520" :y1="R2 + 18" :y2="R2 + 18" stroke="#aeacac" stroke-width="2" />
    <line x1="200" x2="1520" :y1="R3 + 18" :y2="R3 + 18" stroke="#aeacac" stroke-width="2" />

    <g v-for="(x0, i) in a2" :key="'a2' + i">
      <path :d="`M ${L(from2[i], x0) - 11} ${R2 - 14} L ${L(from2[i], x0) + 11} ${R2 - 14} L ${L(from2[i], x0)} ${R2 + 4} Z`" fill="#0f766e" />
      <line :x1="x0" :x2="x0" :y1="R2 + 4" :y2="R2 + 4 + 50 * cut" stroke="#0f766e" stroke-width="2" />
    </g>
    <g v-for="(x0, i) in a3" :key="'a3' + i">
      <path :d="`M ${L(from3[i], x0) - 11} ${R3 - 14} L ${L(from3[i], x0) + 11} ${R3 - 14} L ${L(from3[i], x0)} ${R3 + 4} Z`" fill="#0f766e" />
      <line :x1="x0" :x2="x0" :y1="R3 + 4" :y2="R3 + 4 + 50 * cut" stroke="#0f766e" stroke-width="2" />
    </g>
    <g :style="{ opacity: 1 - z }">
      <rect v-for="i in 12" :key="'g2' + i" :x="230 + (i - 1) * 104" y="50" width="94" height="56" fill="#e7e7e7" stroke="#bbbbbb" stroke-width="2" />
      <rect v-for="i in 12" :key="'g3' + i" :x="268 + (i - 1) * 104" y="180" width="94" height="56" fill="#e7e7e7" stroke="#bbbbbb" stroke-width="2" />
    </g>
    <g :style="{ opacity: cut }">
      <text v-for="i in 4" :key="'n2' + i" :x="a2[i - 1] + LW / 2" :y="R2 + 50" text-anchor="middle" class="s">第 {{ passNo(i - 1) }} 圈</text>
      <text v-for="i in 4" :key="'n3' + i" :x="a3[i - 1] + LW / 2" :y="R3 + 50" text-anchor="middle" class="s">第 {{ passNo(i - 1) }} 圈</text>
    </g>

    <g :style="{ opacity: c >= 4 ? 1 : 0 }">
      <rect :x="a2[2]" :y="R2 - 24" :width="LW" height="86" fill="#6eea9e" fill-opacity="0.35" stroke="#0f766e" stroke-width="3" />
      <rect :x="a3[2]" :y="R3 - 24" :width="LW" height="86" fill="#6eea9e" fill-opacity="0.35" stroke="#0f766e" stroke-width="3" />
      <rect :x="a3[2] - 34" :y="R3" width="22" height="36" fill="#6eea9e" stroke="#c0392b" stroke-width="3" />
      <text :x="a3[2] - 150" :y="R3 + 84" class="s" style="fill: #c0392b">提前開的接收</text>
      <text :x="a3[2] + 12" :y="R3 + 84" class="s" style="fill: #0f766e">比 rank 2 晚 48.9 µs 開始</text>
    </g>

    <g :style="{ opacity: c >= 2 && c <= 3 ? 1 : 0 }">
      <text x="0" y="370" class="l">每一圈</text>
      <text x="0" y="400" class="s m">最慢 rank 的時間</text>
      <g v-for="(v, i) in vals" :key="'b' + i">
        <rect :x="bx(i)" :y="460 - v" width="26" :height="v"
          :fill="!keep(i) ? '#ffffff' : sortP > 0.95 && i === mid ? '#0f766e' : '#adf0c7'"
          :stroke="keep(i) ? '#1a1a1a' : '#bbbbbb'" stroke-width="2" :stroke-dasharray="keep(i) ? '' : '5 4'" />
      </g>
      <text :x="BX" y="490" class="s m">第 1 圈</text>
      <text :x="BX + N * BW" y="490" text-anchor="end" class="s m">第 254 圈</text>
      <g :style="{ opacity: sortP > 0.95 ? 1 : 0 }">
        <text :x="bx(mid) + 13" y="290" text-anchor="middle" class="t" style="fill: #0f766e">中位數：第 95 圈</text>
        <line :x1="bx(mid) + 13" :x2="bx(mid) + 13" y1="300" :y2="452 - vals[mid]" stroke="#0f766e" stroke-width="2" />
      </g>
    </g>
    <text x="0" y="560" class="l" :style="{ fill: c >= 4 ? '#c0392b' : '#1a1a1a' }">{{ caps[Math.min(c, 4)] }}</text>
    <text x="0" y="606" class="s m">Step {{ Math.min(c, 4) + 7 }} / 16　柱子 30 根代表 254 圈，高度與時間是示意</text>
  </svg>
</template>
