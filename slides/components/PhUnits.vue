<script setup>
import { useSlideContext } from '@slidev/client'

// How the model finds units, from one rank's messages alone.
// Click 1: messages with the same tag merge into one call.
// Click 2: the calls repeat A B C: that is the main loop, one pass = one period.
// Click 3: a unit runs from one call to the next.
// Click 4: periods found = the program's iteration count -> accepted.
const { $clicks } = useSlideContext()
const c = () => Math.min($clicks.value, 4)
const on = (k) => ({ opacity: c() >= k ? 1 : 0 })
const seq = ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C']
const per = [3, 2, 2]
const col = { A: '#6eea9e', B: '#adf0c7', C: '#e7e7e7' }
const CW = 150, X0 = 180
const cx = (i) => X0 + i * CW
const ticks = (i) => Array.from({ length: per[i % 3] }, (_, j) => cx(i) + 20 + j * 34)
</script>

<template>
  <svg class="dg" viewBox="-8 -8 1576 600" width="1576" height="600" style="overflow: visible">
    <text x="0" y="132" class="l">rank 1</text>
    <line :x1="X0 - 10" :x2="cx(9) + 10" y1="126" y2="126" stroke="#aeacac" stroke-width="2" />
    <g v-for="(t, i) in seq" :key="i">
      <rect v-for="(x, j) in ticks(i)" :key="j" :x="x" y="108" width="22" height="36" :fill="col[t]" stroke="#1a1a1a" stroke-width="2" />
    </g>
    <text :x="X0" y="72" class="s m">每個方塊是一則訊息，顏色是 tag</text>

    <g class="step" :style="on(1)">
      <g v-for="(t, i) in seq" :key="'c' + i">
        <rect :x="cx(i) + 6" y="96" :width="CW - 12" height="60" fill="none" stroke="#0f766e" stroke-width="2" stroke-dasharray="6 5" />
        <text :x="cx(i) + CW / 2" y="190" text-anchor="middle" class="t">呼叫 {{ t }}</text>
      </g>
    </g>
    <g class="step" :style="on(2)">
      <g v-for="k in 3" :key="'p' + k">
        <line :x1="cx((k - 1) * 3) + 4" :x2="cx(k * 3) - 4" y1="232" y2="232" stroke="#1a1a1a" stroke-width="2" />
        <line :x1="cx((k - 1) * 3) + 4" :x2="cx((k - 1) * 3) + 4" y1="222" y2="242" stroke="#1a1a1a" stroke-width="2" />
        <line :x1="cx(k * 3) - 4" :x2="cx(k * 3) - 4" y1="222" y2="242" stroke="#1a1a1a" stroke-width="2" />
        <text :x="cx((k - 1) * 3) + CW * 1.5" y="276" text-anchor="middle" class="l">第 {{ k }} 圈（週期）</text>
      </g>
    </g>
    <g class="step" :style="on(3)">
      <line v-for="i in 10" :key="'u' + i" :x1="cx(i - 1)" :x2="cx(i - 1)" y1="300" y2="350" stroke="#c0392b" stroke-width="2" />
      <line :x1="cx(0) + 4" :x2="cx(1) - 4" y1="330" y2="330" stroke="#c0392b" stroke-width="2" />
      <text :x="cx(0)" y="392" class="s" style="fill: #c0392b">1 個單位 = 一次呼叫開始，到下一次呼叫開始</text>
    </g>
    <g class="step" :style="on(4)">
      <text x="0" y="520" class="l">找到 3 圈，程式實際迭代 3 次：對得上，切法成立</text>
      <text x="0" y="566" class="s m">示意：真正的程式一圈最多找 8 次呼叫，差距 2 % 以內算對得上</text>
    </g>
    <text x="1100" y="566" class="s m">Step {{ c() + 1 }} / 11</text>
  </svg>
</template>
