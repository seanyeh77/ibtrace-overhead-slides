<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// What "replay one pass of the communication" means, concretely, for rank 2.
const { $clicks } = useSlideContext()
const c = computed(() => $clicks.value)
const on = (k) => ({ opacity: c.value >= k ? 1 : 0 })
const lu = [
  { k: 'c', w: 170 }, { k: 'm', w: 46, t: '送' }, { k: 'c', w: 120 }, { k: 'm', w: 46, t: '收' },
  { k: 'c', w: 200 }, { k: 'm', w: 46, t: '送' }, { k: 'c', w: 140 }, { k: 'm', w: 46, t: '收' },
]
const xs = (arr) => arr.reduce((o, s) => { o.push((o.at(-1) ?? 0) + (o.length ? arr[o.length - 1].w : 0)); return o }, [])
const luX = xs(lu)
const msgs = lu.filter((s) => s.k === 'm')
const lines = ['送給 rank 3　81,920 B', '從 rank 1 收　600 B', '送給 rank 6　640 B', '從 rank 6 收　640 B']
const caps = [
  'LU 真正跑的時候：rank 2 一圈裡算一段（灰）、通訊一次（綠），重複好幾次',
  'trace 只記下通訊：第 95 圈裡，送給誰、從誰收、多大',
  '把這一圈的通訊寫成「計畫」，16 個 rank 各一份',
  '演練程式照計畫只做通訊，把計算拿掉：LU 一圈約 9 ms，演練只剩通訊的時間',
  '同一圈重複演練好幾百次取平均；換一種網卡設定再演練一次，比較每圈時間',
]
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 640" width="1576" height="640" style="overflow: visible">
    <text x="0" y="46" class="l">LU 的一圈</text>
    <g transform="translate(250,10)">
      <g v-for="(s, i) in lu" :key="i">
        <rect :x="luX[i]" y="0" :width="s.w" height="56" :fill="s.k === 'c' ? '#e7e7e7' : '#6eea9e'" stroke="#1a1a1a" stroke-width="2" />
        <text v-if="s.k === 'c'" :x="luX[i] + s.w / 2" y="36" text-anchor="middle" class="s">計算</text>
        <text v-else :x="luX[i] + s.w / 2" y="36" text-anchor="middle" class="s">{{ s.t }}</text>
      </g>
    </g>

    <g class="step" :style="on(1)">
      <text x="0" y="146" class="l">trace 記下</text>
      <rect x="250" y="100" width="560" height="190" fill="#ffffff" stroke="#1a1a1a" stroke-width="2" />
      <text v-for="(l, i) in lines" :key="i" x="274" :y="140 + i * 40" class="t">{{ i + 1 }}. {{ l }}</text>
    </g>
    <g class="step" :style="on(2)">
      <text x="900" y="146" class="l">計畫檔 rank2.plan</text>
      <rect x="900" y="160" width="420" height="130" fill="#f6f5f4" stroke="#1a1a1a" stroke-width="2" />
      <text x="924" y="196" class="t">S 3 81920</text>
      <text x="924" y="232" class="t">R 1 600</text>
      <text x="924" y="268" class="t">S 6 640 …</text>
      <text x="1340" y="226" class="s m">S = 送，R = 收</text>
    </g>
    <g class="step" :style="on(3)">
      <text x="0" y="370" class="l">演練的一圈</text>
      <g transform="translate(250,334)">
        <rect v-for="(m, i) in msgs" :key="i" :x="i * 50" y="0" width="46" height="56" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
        <text v-for="(m, i) in msgs" :key="'t' + i" :x="i * 50 + 23" y="36" text-anchor="middle" class="s">{{ m.t }}</text>
        <text x="230" y="36" class="s m">← 只剩通訊，沒有計算</text>
      </g>
    </g>
    <g class="step" :style="on(4)">
      <text x="0" y="460" class="l">重複與比較</text>
      <text x="250" y="460" class="t">演練幾百圈 → 每圈平均時間；目前設定、同側 2 張、同側 4 張、全部 8 張各 3 次</text>
    </g>
    <text x="0" y="560" class="l">{{ caps[Math.min(c, 4)] }}</text>
    <text x="0" y="606" class="s m">Step {{ Math.min(c, 4) + 1 }} / 5　計畫內容與時間是示意</text>
  </svg>
</template>
