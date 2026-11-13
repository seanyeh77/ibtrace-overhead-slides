<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useProgress, seg, clamp } from '../utils/tween.js'

// How a rank's anchors are set, from its own trace only.
const { $clicks } = useSlideContext()
const c = computed(() => Math.min($clicks.value, 5))
const p = useProgress(c, 1000)
const seq = ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C']
const bytes = { A: 81920, B: 600, C: 640 }
const col = { A: '#6eea9e', B: '#adf0c7', C: '#e7e7e7' }
const CW = 104, X0 = 230, Y2 = 90, Y3 = 400
const x = (i) => X0 + i * CW
// step 1: a window of length L slides; L = 1, 2, then 3 (matches)
const win = computed(() => {
  if (c.value !== 1) return null
  const q = p.value
  const L = q < 0.33 ? 1 : q < 0.66 ? 2 : 3
  const ok = L === 3
  return { L, ok }
})
const per = computed(() => c.value >= 2 || (c.value === 1 && p.value >= 0.66))
const barH = (t) => (t === 'A' ? 120 : 14)
const grow = computed(() => (c.value > 2 ? 1 : c.value === 2 ? seg(p.value, 0, 0.7) : 0))
const anchorsShown = computed(() => (c.value > 4 ? 4 : c.value === 4 ? Math.floor(clamp(p.value * 5, 1, 4)) : c.value === 3 ? 1 : 0))
// rank 3: its own calls (different neighbours), its own biggest call D
const seq3 = ['E', 'D', 'F', 'E', 'D', 'F', 'E', 'D', 'F', 'E', 'D', 'F']
const col3 = { D: '#6eea9e', E: '#adf0c7', F: '#e7e7e7' }
const x3 = (i) => X0 + 38 + i * CW
const caps = [
  'rank 2 的 trace：同一個 tag 的連續訊息合成一次「呼叫」，排成一列',
  '試週期長度 1、2、3……：長度 3 時，A B C 一再重複，這就是主迴圈的一圈',
  '看一圈裡每次呼叫送出多少位元組：A 送 81,920 B，B 只送 600 B，C 送 640 B',
  '送最多的 A 當錨點（▼）',
  '每次出現 A 就是新的一圈：從一個錨點到下一個錨點，就是一圈',
  'rank 3 用自己的 trace 再做一次：錨點是它自己送最多的呼叫，所以邊界和 rank 2 不一樣',
]
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 700" width="1576" height="700" style="overflow: visible">
    <text x="0" :y="Y2 + 36" class="l">rank 2</text>
    <g v-for="(t, i) in seq" :key="'c' + i" :style="{ opacity: c > 0 ? 1 : clamp(p * 14 - i, 0, 1) }">
      <rect :x="x(i)" :y="Y2" :width="CW - 10" height="56" :fill="col[t]" stroke="#1a1a1a" stroke-width="2" />
      <text :x="x(i) + (CW - 10) / 2" :y="Y2 + 36" text-anchor="middle" class="t">{{ t }}</text>
    </g>

    <g v-if="win">
      <rect :x="x(0) - 6" :y="Y2 - 10" :width="win.L * CW - 2" height="76" fill="none" :stroke="win.ok ? '#0f766e' : '#c0392b'" stroke-width="3" />
      <rect :x="x(win.L) - 6" :y="Y2 - 10" :width="win.L * CW - 2" height="76" fill="none" :stroke="win.ok ? '#0f766e' : '#c0392b'" stroke-width="3" stroke-dasharray="8 6" />
      <text :x="x(0)" :y="Y2 + 100" class="t" :style="{ fill: win.ok ? '#0f766e' : '#c0392b' }">
        長度 {{ win.L }}：{{ win.ok ? '下一段一樣，重複成立' : '下一段不一樣' }}
      </text>
    </g>
    <g v-if="per && c < 4">
      <line v-for="k in 4" :key="'pl' + k" :x1="x((k - 1) * 3) - 6" :x2="x((k - 1) * 3) - 6" :y1="Y2 - 14" :y2="Y2 + 70" stroke="#0f766e" stroke-width="2" stroke-dasharray="6 5" />
    </g>

    <g v-for="(t, i) in seq.slice(0, 3)" :key="'b' + i" :style="{ opacity: c >= 2 && c < 4 ? 1 : 0 }">
      <rect :x="x(i) + 20" :y="Y2 + 210 - barH(t) * grow" width="54" :height="barH(t) * grow" :fill="col[t]" stroke="#1a1a1a" stroke-width="2" />
      <text :x="x(i) + 47" :y="Y2 + 236" text-anchor="middle" class="s">{{ bytes[t].toLocaleString() }} B</text>
    </g>

    <g v-for="k in 4" :key="'a' + k" :style="{ opacity: anchorsShown >= k ? 1 : 0, transition: 'opacity 0.3s' }">
      <path :d="`M ${x((k - 1) * 3) + 47 - 14} ${Y2 - 34} L ${x((k - 1) * 3) + 47 + 14} ${Y2 - 34} L ${x((k - 1) * 3) + 47} ${Y2 - 12} Z`" fill="#0f766e" />
      <line v-if="c >= 4" :x1="x((k - 1) * 3) - 6" :x2="x((k - 1) * 3) - 6" :y1="Y2 - 12" :y2="Y2 + 70" stroke="#0f766e" stroke-width="3" />
      <text v-if="c >= 4 && k < 4" :x="x((k - 1) * 3) + 1.5 * CW - 6" :y="Y2 + 96" text-anchor="middle" class="s" style="fill: #0f766e">第 {{ 93 + k }} 圈</text>
    </g>

    <g :style="{ opacity: c >= 5 ? seg(p, 0, 0.4) : 0 }">
      <text x="0" :y="Y3 + 36" class="l">rank 3</text>
      <g v-for="(t, i) in seq3" :key="'r' + i">
        <rect :x="x3(i)" :y="Y3" :width="CW - 10" height="56" :fill="col3[t]" stroke="#1a1a1a" stroke-width="2" />
        <text :x="x3(i) + (CW - 10) / 2" :y="Y3 + 36" text-anchor="middle" class="t">{{ t }}</text>
      </g>
      <g v-for="k in 4" :key="'a3' + k" :style="{ opacity: c >= 5 && p > 0.3 + k * 0.12 ? 1 : 0 }">
        <path :d="`M ${x3((k - 1) * 3 + 1) + 47 - 14} ${Y3 - 34} L ${x3((k - 1) * 3 + 1) + 47 + 14} ${Y3 - 34} L ${x3((k - 1) * 3 + 1) + 47} ${Y3 - 12} Z`" fill="#0f766e" />
        <line :x1="x3((k - 1) * 3 + 1) - 6" :x2="x3((k - 1) * 3 + 1) - 6" :y1="Y3 - 12" :y2="Y3 + 70" stroke="#0f766e" stroke-width="3" />
      </g>
      <text :x="x3(1)" :y="Y3 + 96" class="s m">D 是 rank 3 一圈裡送最多的呼叫</text>
    </g>
    <text x="0" y="610" class="l">{{ caps[Math.min(c, 5)] }}</text>
    <text x="0" y="656" class="s m">Step {{ Math.min(c, 5) + 1 }} / 16　呼叫與位元組是示意；真正的程式試長度 1 到 8</text>
  </svg>
</template>
