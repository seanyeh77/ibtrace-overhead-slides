<script setup>
// How fixed cost and per-pass time are separated: two runs, one line.
// Illustrative numbers: 200 passes 1,000 ms; 2,000 passes 4,600 ms.
const X0 = 760, Y0 = 560, sx = 0.36, sy = 0.1 // chart origin and scales
const px = (n) => X0 + n * sx
const py = (t) => Y0 - t * sy
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1616 636" width="1616" height="636" overflow="visible">
    <!-- left: two runs -->
    <text x="0" y="40" class="zt">同一個設定，跑兩次（示意）</text>
    <rect x="0" y="70" width="620" height="70" fill="#e7e7e7" stroke="#1a1a1a" stroke-width="2" />
    <text x="40" y="115" class="zs">第一次：200 圈</text><text x="580" y="115" text-anchor="end" class="zc">1,000 ms</text>
    <rect x="0" y="160" width="620" height="70" fill="#adf0c7" stroke="#1a1a1a" stroke-width="2" />
    <text x="40" y="205" class="zs">第二次：2,000 圈</text><text x="580" y="205" text-anchor="end" class="zc">4,600 ms</text>

    <text x="0" y="300" class="zg">每圈 = (4,600 − 1,000) ÷ (2,000 − 200)</text>
    <text x="300" y="340" class="zc">= 2 ms</text>
    <text x="0" y="410" class="zg">固定成本 = 1,000 − 200 × 2</text>
    <text x="300" y="450" class="zc">= 600 ms</text>
    <text x="0" y="530" class="zs">每個候選設定都這樣量，</text>
    <text x="0" y="566" class="zs">再和目前的設定相減。</text>

    <!-- right: the line -->
    <line :x1="X0" :y1="Y0" :x2="X0 + 820" :y2="Y0" stroke="#333" stroke-width="2" />
    <line :x1="X0" :y1="Y0" :x2="X0" y2="40" stroke="#333" stroke-width="2" />
    <text :x="X0 + 410" :y="Y0 + 50" text-anchor="middle" class="zs">圈數</text>
    <text :x="X0 - 20" y="60" text-anchor="end" class="zs">總時間</text>
    <line :x1="px(0)" :y1="py(600)" :x2="px(2200)" :y2="py(5000)" stroke="#0f766e" stroke-width="3" />
    <line :x1="px(0)" :y1="Y0" :x2="px(0)" :y2="py(600)" stroke="#e8a33d" stroke-width="10" />
    <circle :cx="px(200)" :cy="py(1000)" r="10" fill="#1a1a1a" />
    <circle :cx="px(2000)" :cy="py(4600)" r="10" fill="#1a1a1a" />
    <text :x="px(200) + 18" :y="py(1000) + 34" class="zc">200 圈 · 1,000 ms</text>
    <text :x="px(2000) - 18" :y="py(4600) - 22" text-anchor="end" class="zc">2,000 圈 · 4,600 ms</text>
    <text :x="X0 + 20" :y="py(300) + 8" class="zg">高度 = 固定成本 600 ms</text>
    <text :x="px(1150)" :y="py(2900) - 30" text-anchor="end" class="zg">斜率 = 每圈 2 ms</text>
  </svg>
</template>
