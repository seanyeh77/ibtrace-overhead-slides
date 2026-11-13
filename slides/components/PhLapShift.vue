<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import PhAnchor from './PhAnchor.vue'
import PhLap from './PhLap.vue'
import PhShift from './PhShift.vue'

// One slide, three parts that cross-fade into each other:
// anchors (clicks 0-5), pass 95 (6-10), shifted order and truncation (11-15).
const { $clicks } = useSlideContext()
const part = computed(() => ($clicks.value < 6 ? 0 : $clicks.value < 11 ? 1 : 2))
const st = (k) => ({
  opacity: part.value === k ? 1 : 0,
  pointerEvents: part.value === k ? 'auto' : 'none',
})
</script>

<template>
  <div class="ph-stack">
    <div class="ph-layer" :style="st(0)"><PhAnchor /></div>
    <div class="ph-layer" :style="st(1)"><PhLap :offset="6" /></div>
    <div class="ph-layer" :style="st(2)"><PhShift :offset="11" /></div>
  </div>
</template>

<style scoped>
.ph-stack { display: grid; }
.ph-layer { grid-area: 1 / 1; transition: opacity 0.25s ease; }
</style>
