<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import PhUnits from './PhUnits.vue'
import PhIndex from './PhIndex.vue'

// How units are found (clicks 0-4), then the IndexError (5-10); rank 1's first pass carries over.
const { $clicks } = useSlideContext()
const part = computed(() => ($clicks.value < 5 ? 0 : 1))
const st = (k) => ({
  opacity: part.value === k ? 1 : 0,
  pointerEvents: part.value === k ? 'auto' : 'none',
  transition: `opacity ${part.value > k ? 0.3 : 0.15}s ease`,
})
</script>

<template>
  <div class="ph-stack">
    <div class="ph-layer" :style="st(0)"><PhUnits /></div>
    <div class="ph-layer" :style="st(1)"><PhIndex :offset="5" /></div>
  </div>
</template>

<style scoped>
.ph-stack { display: grid; }
.ph-layer { grid-area: 1 / 1; }
</style>
