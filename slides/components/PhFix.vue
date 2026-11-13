<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useProgress, seg } from '../utils/tween.js'

// The four fixes, continuing from the truncation picture. Two steps each.
const { $clicks } = useSlideContext()
const props = defineProps({ offset: { type: Number, default: 0 } })
const c = computed(() => Math.min(Math.max($clicks.value - props.offset, 0), 7))
const p = useProgress(() => $clicks.value, 1000)
const q = computed(() => seg(p.value, 0, 1))
const fix = computed(() => Math.floor(c.value / 2))           // 0..3
const second = computed(() => c.value % 2 === 1)

const SY = 60, RY = 250, LY1 = 400, LY2 = 470
const sends = [{ x: 470, big: true }, { x: 640, big: false }, { x: 800, big: false }, { x: 960, big: false }, { x: 1290, big: true }]
const recvs = [{ x: 330, big: true }, { x: 660, big: false }, { x: 820, big: false }, { x: 980, big: false }, { x: 1160, big: true }]
const bw = (b) => (b ? 70 : 34)
const lx = (i) => 200 + i * 130

// fix 1 moves rank 3's pass to the same batch as rank 2's: receives 0..3 instead of 1..4
const f1 = computed(() => (fix.value === 0 ? (c.value === 0 ? q.value : 1) : 0))
const win3 = computed(() => ({ x: 440 + (300 - 440) * f1.value, w: 800 + (730 - 800) * f1.value }))
const slot = (j) => {
  // where receive j sits in rank 3's list: before the fix 1..4 -> 0..3, after 0..3 -> 0..3
  const before = j - 1, after = j
  return before + (after - before) * f1.value
}
const visR = (j) => {
  if (j === 0) return f1.value
  if (j === 4) return 1 - f1.value
  return 1
}
const gx = (j) => (j >= 2 ? 110 * grow.value : 0)
const recvY = (j) => (j === 0 || j === 4 ? LY2 + (j === 0 ? -1 : 1) * 60 * (1 - visR(j)) : LY2)

// fix 4: the first buffer grows to fit the big message
const grow = computed(() => (fix.value === 3 ? (c.value === 6 ? q.value : 1) : 0))
const drop4 = computed(() => (fix.value === 3 ? (c.value === 6 ? seg(p.value, 0.4, 1) : 1) : 0))

const titles = ['修法 1：以 rank 2 的第 95 圈為準', '修法 2：產生計畫時逐則比對大小', '修法 3：保留 tag', '修法 4：放大接收緩衝']
const verdicts = ['建議', '建議（保險）', '修不好', '只是掩蓋']
const caps = [
  'rank 3 不再自己切圈：跟著 rank 2，取這一對的同一批 4 則接收',
  '兩邊都是「大 小 小 小」，大配大、小配小；BT 的計畫完全不變',
  '產生計畫時，兩邊的大小一則一則比對',
  '第 1 則就對不上：記為不預測並報錯，不啟動重播，LU 不會白跑 60 次；BT 96 對都相等',
  '把 trace 裡的 tag 一起寫進計畫，照 tag 配對',
  'LU 同一邊的大、小訊息 tag 都一樣，還是照順序配；兩邊 tag 還不同，照抄反而配不起來',
  '把每個接收緩衝放大到這一對最大的訊息',
  '不再截斷，但大訊息被當成小的那則收下：配對還是錯的，時間不對，只是掩蓋問題',
]
const pairOk = computed(() => fix.value === 0)
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 700" width="1576" height="700" style="overflow: visible">
    <text x="0" :y="SY + 26" class="l">rank 2 送</text>
    <text x="0" :y="RY + 26" class="l">rank 3 收</text>
    <line x1="200" x2="1500" :y1="SY + 18" :y2="SY + 18" stroke="#aeacac" stroke-width="2" />
    <line x1="200" x2="1500" :y1="RY + 18" :y2="RY + 18" stroke="#aeacac" stroke-width="2" />
    <rect x="420" :y="SY - 30" width="800" height="96" fill="#adf0c7" fill-opacity="0.5" stroke="#0f766e" stroke-width="2" stroke-dasharray="8 6" />
    <rect :x="win3.x" :y="RY - 30" :width="win3.w" height="96" fill="#adf0c7" fill-opacity="0.5" stroke="#0f766e" stroke-width="2" stroke-dasharray="8 6" />
    <g v-for="(s, i) in sends" :key="'s' + i">
      <rect :x="s.x" :y="SY" :width="bw(s.big)" height="36" :fill="s.big ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
      <text :x="s.x + bw(s.big) / 2" :y="SY + 26" text-anchor="middle" class="s">{{ s.big ? '大' : '小' }}</text>
    </g>
    <g v-for="(r, i) in recvs" :key="'r' + i">
      <rect :x="r.x" :y="RY" :width="bw(r.big)" height="36" :fill="r.big ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
      <text :x="r.x + bw(r.big) / 2" :y="RY + 26" text-anchor="middle" class="s">{{ r.big ? '大' : '小' }}</text>
    </g>

    <text x="0" y="365" class="l" style="fill: #0f766e">{{ titles[fix] }}</text>
    <text x="1180" y="365" class="t" :style="{ fill: fix < 2 ? '#0f766e' : '#c0392b', opacity: second ? q : 0 }">{{ verdicts[fix] }}</text>

    <text x="0" :y="LY1 + 31" class="l">rank 2</text>
    <text x="0" :y="LY2 + 31" class="l">rank 3</text>
    <g v-for="j in 5" :key="'lr' + j" :style="{ opacity: visR(j - 1) }">
      <rect :x="lx(slot(j - 1)) + gx(j - 1)" :y="recvY(j - 1)" :width="j === 2 && fix !== 0 ? 110 + 110 * grow : 110" height="46"
        :fill="recvs[j - 1].big ? '#6eea9e' : '#e7e7e7'"
        :stroke="!pairOk && j === 2 && (fix === 1 || fix === 2) && second ? '#c0392b' : '#1a1a1a'"
        :stroke-width="!pairOk && j === 2 && (fix === 1 || fix === 2) && second ? 3 : 2" />
      <text :x="lx(slot(j - 1)) + gx(j - 1) + (j === 2 ? 110 * grow : 0) + 55" :y="recvY(j - 1) + 31" text-anchor="middle" class="t">{{ recvs[j - 1].big ? '大' : '小' }}</text>
      <text v-if="fix === 2 && j > 1" :x="lx(slot(j - 1)) + 55" :y="LY2 + 72" text-anchor="middle" class="s" :style="{ fill: '#0f766e', opacity: c === 4 ? q : 1 }">tag 2</text>
    </g>

    <g v-for="i in 4" :key="'ls' + i" :transform="`translate(0,${fix === 3 && i === 1 ? drop4 * 70 : 0})`">
      <rect :x="lx(i - 1)" :y="LY1" width="110" height="46" :fill="i === 1 ? '#6eea9e' : '#e7e7e7'" stroke="#1a1a1a" stroke-width="2" />
      <text :x="lx(i - 1) + 55" :y="LY1 + 31" text-anchor="middle" class="t">{{ i === 1 ? '大' : '小' }}</text>
      <text v-if="fix === 2" :x="lx(i - 1) + 55" :y="LY1 - 8" text-anchor="middle" class="s" :style="{ fill: '#0f766e', opacity: c === 4 ? q : 1 }">tag 1</text>
    </g>
    <g v-if="fix === 0 && second">
      <g v-for="i in 4" :key="'ok' + i" :style="{ opacity: seg(p, (i - 1) * 0.15, (i - 1) * 0.15 + 0.3) }">
        <line :x1="lx(i - 1) + 55" :x2="lx(i - 1) + 55" :y1="LY1 + 48" :y2="LY2 - 2" stroke="#0f766e" stroke-width="4" />
        <text :x="lx(i - 1) + 92" :y="LY1 + 64" class="t" style="fill: #0f766e">✓</text>
      </g>
    </g>
    <g v-if="fix === 1">
      <rect :x="lx(0) - 8" :y="LY1 - 8" width="126" height="132" fill="none" stroke="#0f766e" stroke-width="3"
        :style="{ opacity: c === 2 ? q : 1 }" />
      <g v-if="second" :style="{ opacity: q }">
        <rect x="940" y="410" width="600" height="100" fill="#ffffff" stroke="#c0392b" stroke-width="3" />
        <text x="1240" y="450" text-anchor="middle" class="t" style="fill: #c0392b">✗ 第 1 則：81,920 B ≠ 600 B</text>
        <text x="1240" y="488" text-anchor="middle" class="l" style="fill: #c0392b">不預測，不啟動重播</text>
      </g>
    </g>
    <g v-if="fix === 2 && second" :style="{ opacity: q }">
      <line :x1="lx(0) + 55" :x2="lx(0) + 55" :y1="LY1 + 48" :y2="LY2 - 2" stroke="#c0392b" stroke-width="4" />
      <text x="960" :y="LY2 - 6" class="t" style="fill: #c0392b">✗ 還是大配小</text>
    </g>
    <g v-if="fix === 3 && second" :style="{ opacity: q }">
      <text x="1080" :y="LY2 - 6" class="t" style="fill: #c0392b">收下了，但被當成小的那則</text>
    </g>

    <text x="0" y="610" class="l">{{ caps[c] }}</text>
    <text x="0" y="656" class="s m">Step {{ c + 17 }} / 24　四種修法都還沒實作</text>
  </svg>
</template>
