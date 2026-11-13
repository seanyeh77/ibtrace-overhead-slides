<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useProgress, useClock, seg } from '../utils/tween.js'

// What the replay does, for rank 2. On step 3 the computation in LU's pass shrinks away
// and the messages slide together; on step 4 the short pass loops and a counter runs.
const { $clicks } = useSlideContext()
const c = computed(() => $clicks.value)
const p = useProgress(c, 1000)
const t = useClock()
const on = (k) => ({ opacity: c.value >= k ? (c.value === k ? seg(p.value, 0, 0.4) : 1) : 0 })
const lu = [
  { k: 'c', w: 170 }, { k: 'm', w: 46, t: '送' }, { k: 'c', w: 120 }, { k: 'm', w: 46, t: '收' },
  { k: 'c', w: 200 }, { k: 'm', w: 46, t: '送' }, { k: 'c', w: 140 }, { k: 'm', w: 46, t: '收' },
]
const shrink = computed(() => (c.value >= 4 ? 1 : c.value === 3 ? seg(p.value, 0.1, 0.9) : 0))
const widths = computed(() => lu.map((s) => (s.k === 'c' ? s.w * (1 - shrink.value) : s.w)))
const xs = computed(() => widths.value.reduce((o, w, i) => (o.push(i ? o[i - 1] + widths.value[i - 1] : 0), o), []))
const lapW = computed(() => widths.value.reduce((a, b) => a + b, 0))
// step 4: the short pass replays over and over
const LAP = 700
const head = computed(() => ((t.value % LAP) / LAP) * lapW.value)
const laps = computed(() => (Math.floor(t.value / LAP) % 300) + 1)
const lines = ['送給 rank 3　81,920 B', '從 rank 1 收　600 B', '送給 rank 6　640 B', '從 rank 6 收　640 B']
const caps = [
  'LU 真正跑的時候：rank 2 一圈裡算一段（灰）、通訊一次（綠），重複好幾次',
  'trace 只記下通訊：第 95 圈裡，送給誰、從誰收、多大',
  '把這一圈的通訊寫成「計畫」，16 個 rank 各一份',
  '演練程式照計畫只做通訊：計算被拿掉，一圈變得很短',
  '同一圈重複演練好幾百次取平均；換一種網卡設定再演練一次，比較每圈時間',
]
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 640" width="1576" height="640" style="overflow: visible">
    <text x="0" y="46" class="l">{{ c >= 3 ? '演練的一圈' : 'LU 的一圈' }}</text>
    <g transform="translate(250,10)">
      <g v-for="(s, i) in lu" :key="i">
        <rect v-if="widths[i] > 0.5" :x="xs[i]" y="0" :width="widths[i]" height="56" :fill="s.k === 'c' ? '#e7e7e7' : '#6eea9e'" stroke="#1a1a1a" stroke-width="2" />
        <text v-if="s.k === 'c' && widths[i] > 60" :x="xs[i] + widths[i] / 2" y="36" text-anchor="middle" class="s">計算</text>
        <text v-if="s.k === 'm'" :x="xs[i] + s.w / 2" y="36" text-anchor="middle" class="s">{{ s.t }}</text>
      </g>
      <g v-if="c >= 4">
        <line :x1="head" :x2="head" y1="-8" y2="64" stroke="#c0392b" stroke-width="3" />
        <text :x="lapW + 30" y="36" class="t">第 {{ laps }} 圈</text>
      </g>
      <text v-if="c === 3" :x="lapW + 30" y="36" class="s m" :style="{ opacity: shrink }">← 只剩通訊，沒有計算</text>
    </g>

    <g :style="on(1)">
      <text x="0" y="146" class="l">trace 記下</text>
      <rect x="250" y="100" width="560" height="190" fill="#ffffff" stroke="#1a1a1a" stroke-width="2" />
      <text v-for="(l, i) in lines" :key="i" x="274" :y="140 + i * 40" class="t">{{ i + 1 }}. {{ l }}</text>
    </g>
    <g :style="on(2)">
      <text x="900" y="146" class="l">計畫檔 rank2.plan</text>
      <rect x="900" y="160" width="420" height="130" fill="#f6f5f4" stroke="#1a1a1a" stroke-width="2" />
      <text x="924" y="196" class="t">S 3 81920</text>
      <text x="924" y="232" class="t">R 1 600</text>
      <text x="924" y="268" class="t">S 6 640 …</text>
      <text x="1340" y="226" class="s m">S = 送，R = 收</text>
    </g>
    <g :style="on(4)">
      <text x="0" y="380" class="l">換網卡設定</text>
      <g v-for="(b, i) in [['目前設定', 100], ['同側 2 張', 76], ['同側 4 張', 82], ['全部 8 張', 95]]" :key="i">
        <text x="250" :y="360 + i * 34" class="s">{{ b[0] }}</text>
        <rect x="420" :y="342 + i * 34" :width="b[1] * 5 * (c >= 4 ? seg(p, 0.2 + i * 0.15, 0.6 + i * 0.1) : 0)" height="24"
          :fill="i === 0 ? '#e7e7e7' : '#6eea9e'" stroke="#1a1a1a" stroke-width="2" />
      </g>
      <text x="960" y="400" class="s m">每圈時間（示意），各演練 3 次</text>
    </g>
    <text x="0" y="560" class="l">{{ caps[Math.min(c, 4)] }}</text>
    <text x="0" y="606" class="s m">Step {{ Math.min(c, 4) + 1 }} / 5　計畫內容與時間是示意</text>
  </svg>
</template>
