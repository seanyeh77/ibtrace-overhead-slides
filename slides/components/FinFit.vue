<script setup>
// How rail5 separates fixed cost and per-pass time: one run per candidate.
// Real numbers: job 616425, osu_reduce_scatter, 242 passes, medians of 3.
const S = 0.62 // px per ms
const rows = [
  { name: '目前（全部 8 张）', a: 1317.07, F: 1625.36, y: 150 },
  { name: '同側 4 張', a: 1153.48, F: 1108.65, y: 330 },
]
rows[0].name = '目前（全部 8 張）'
const loop = (r) => (r.a * 242) / 1000
const X = 300
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1616 636" width="1616" height="636" overflow="visible">
    <text x="0" y="36" class="zt">每個設定只跑一次：242 圈，約 0.3 s 的迴圈，取 3 次中位數</text>
    <text x="0" y="80" class="zs">① osu 自己印出「平均每圈多久」　② 外面量總時間　③ 固定 = 總時間 − 每圈 × 242</text>

    <g v-for="r in rows" :key="r.name">
      <text x="0" :y="r.y + 45" class="zt">{{ r.name }}</text>
      <rect :x="X" :y="r.y" :width="r.F * S" height="70" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
      <rect :x="X + r.F * S" :y="r.y" :width="loop(r) * S" height="70" fill="#6eea9e" stroke="#1a1a1a" stroke-width="2" />
      <text :x="X + (r.F * S) / 2" :y="r.y + 44" text-anchor="middle" class="zs">固定 {{ r.F.toFixed(0) }} ms</text>
      <text :x="X + r.F * S + loop(r) * S + 16" :y="r.y + 30" class="zc">242 × {{ r.a.toFixed(0) }} µs</text>
      <text :x="X + r.F * S + loop(r) * S + 16" :y="r.y + 60" class="zc">= {{ loop(r).toFixed(0) }} ms</text>
    </g>

    <text x="0" y="500" class="zg">每圈的差 = 1,317 − 1,153 ≈ 164 µs</text>
    <text x="0" y="545" class="zg">固定的差 = 1,625 − 1,109 ≈ 517 ms</text>
    <text x="0" y="610" class="zs">只用一種長度。用兩種圈數畫線的，是事後驗證（下一頁的「實測」欄）。</text>
  </svg>
</template>
