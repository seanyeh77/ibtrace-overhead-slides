<script setup>
// Generic box-and-arrow diagram for the final deck.
// nodes: { x, y, w, h, t, s, s2, f: a|b|g|o|w, dash, mono }
// edges: [x1, y1, x2, y2, ...] polyline; prefix with 'both' string for two heads
// texts: { x, y, t, a: start|middle|end, c: zt|zs|zc|zg }
const props = defineProps({
  w: { type: Number, default: 1600 },
  h: { type: Number, default: 640 },
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  texts: { type: Array, default: () => [] },
})
const mid = 'fd' + Math.random().toString(36).slice(2, 8)
const F = { a: '#adf0c7', b: '#6eea9e', g: '#e7e7e7', o: '#aeacac', w: '#ffffff', y: '#fde68a' }
const pts = (e) => e.filter((v) => typeof v === 'number').join(' ')
const both = (e) => e[0] === 'both'
const lines = (n) => n.L || [n.t, n.s, n.s2].filter(Boolean)
const ty = (n, i) => {
  if (n.top) return n.y + 38 + i * 34
  const k = lines(n).length
  return n.y + n.h / 2 + 9 - ((k - 1) * 34) / 2 + i * 34
}
const cls = (n, i) => (i === 0 ? (n.mono ? 'zc' : 'zt') : n.mono || n.L ? (n.mono ? 'zc' : 'zs') : 'zs')
</script>

<template>
  <svg class="dg" :viewBox="`-8 -8 ${w + 16} ${h + 16}`" :width="w + 16" :height="h + 16" overflow="visible">
    <defs>
      <marker :id="mid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#333333" />
      </marker>
    </defs>
    <g v-for="(n, k) in nodes" :key="'n' + k">
      <rect :x="n.x" :y="n.y" :width="n.w" :height="n.h" :fill="F[n.f || 'g']" stroke="#1a1a1a"
        :stroke-width="n.dash ? 2 : 2" :stroke-dasharray="n.dash ? '9 6' : null" rx="6" />
      <text v-for="(s, i) in lines(n)" :key="i" :x="n.top ? n.x + 20 : n.x + n.w / 2" :y="ty(n, i)"
        :text-anchor="n.top ? 'start' : 'middle'" :class="cls(n, i)">{{ s }}</text>
    </g>
    <polyline v-for="(e, k) in edges" :key="'e' + k" :points="pts(e)" fill="none" stroke="#333333" stroke-width="2.5"
      :marker-end="`url(#${mid})`" :marker-start="both(e) ? `url(#${mid})` : null" />
    <text v-for="(t, k) in texts" :key="'t' + k" :x="t.x" :y="t.y" :text-anchor="t.a || 'middle'" :class="t.c || 'zs'">{{ t.t }}</text>
  </svg>
</template>
