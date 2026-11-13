<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Why the network calibration replays one pass of the communication.
const { $clicks } = useSlideContext()
const c = computed(() => $clicks.value)
const on = (k) => ({ opacity: c.value >= k ? 1 : 0 })
const bars = [
  { t: '目前：8 張', v: 100 },
  { t: '同側 4 張', v: 82 },
  { t: '同側 2 張', v: 76 },
  { t: '全部 8 張', v: 95 },
]
const caps = [
  'trace 是在 8 張網卡下錄的：裡面沒有「改成 4 張」會怎樣',
  '直接把 LU 用 4 張再跑一次？那就是直接量答案，而且每換一種設定都要跑完整程式',
  '只演練通訊：照 trace 裡一圈的送和收，不做計算，幾秒就完成',
  '每種設定演練 3 次，量出每圈的通訊時間',
  '能省多少 = 每圈省下的時間 × 圈數，再加上啟動成本的差',
]
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1556 620" width="1556" height="620" style="overflow: visible">
    <rect x="0" y="0" width="560" height="80" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
    <text x="280" y="34" text-anchor="middle" class="l">trace（8 張網卡時錄的）</text>
    <text x="280" y="64" text-anchor="middle" class="s">每個 rank 送給誰、收誰的、多大</text>

    <g class="step" :style="on(1)">
      <rect x="0" y="120" width="560" height="80" fill="#ffffff" stroke="#888888" stroke-width="2" stroke-dasharray="8 6" />
      <text x="280" y="154" text-anchor="middle" class="l m">重跑整個 LU</text>
      <text x="280" y="184" text-anchor="middle" class="s m">等於量答案，也太慢</text>
      <line x1="20" x2="540" y1="160" y2="160" stroke="#c0392b" stroke-width="3" />
    </g>
    <g class="step" :style="on(2)">
      <rect x="0" y="240" width="560" height="80" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
      <text x="280" y="274" text-anchor="middle" class="l">只演練一圈的通訊</text>
      <text x="280" y="304" text-anchor="middle" class="s">不做計算，幾秒完成</text>
    </g>
    <g class="step" :style="on(3)">
      <g v-for="(b, i) in bars" :key="i">
        <text x="660" :y="i * 70 + 40" class="s">{{ b.t }}</text>
        <rect x="860" :y="i * 70 + 12" :width="b.v * 6" height="40" :fill="i === 0 ? '#e7e7e7' : '#6eea9e'" stroke="#1a1a1a" stroke-width="2" />
        <text :x="870 + b.v * 6" :y="i * 70 + 40" class="s">{{ b.v }}</text>
      </g>
      <text x="660" y="300" class="s m">每圈的通訊時間（示意，µs）</text>
    </g>
    <g class="step" :style="on(4)">
      <rect x="660" y="330" width="840" height="70" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text x="1080" y="374" text-anchor="middle" class="l">例：改 4 張省 (100 − 82) × 254 圈 + 啟動成本差</text>
    </g>
    <text x="0" y="500" class="l">{{ caps[Math.min(c, 4)] }}</text>
    <text x="0" y="550" class="s m">Step {{ Math.min(c, 4) + 1 }} / 5</text>
  </svg>
</template>
