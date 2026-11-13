<script setup>
import { useSlideContext } from '@slidev/client'
import PhLap from './PhLap.vue'
import PhShift from './PhShift.vue'

// Pass 95 (clicks 0-4), then the shifted order and the truncation (clicks 5-9), on one slide.
const { $clicks } = useSlideContext()
</script>

<template>
  <PhLap v-if="$clicks < 5" />
  <PhShift v-else :offset="5" />
</template>
