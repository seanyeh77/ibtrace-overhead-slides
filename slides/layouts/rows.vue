<script setup>
import { useSlideContext } from '@slidev/client'

// A vertical list: one full-width row per item, read top to bottom.
// items: [{ label?, title, text }]. numbered: show 01, 02, … instead of labels.
// reveal: row i appears on click i (row 0 is shown from the start).
defineProps({ chapter: String, items: Array, numbered: Boolean, reveal: Boolean })
const { $clicks } = useSlideContext()
const mark = (it, i, numbered) => (numbered ? String(i + 1).padStart(2, '0') : it.label)
</script>

<template>
  <div class="slidev-layout tb-rows">
    <div class="tb-chap">{{ chapter }}</div>
    <slot />
    <div class="rows-list">
      <div v-for="(it, i) in items" :key="i" class="rows-row" :class="{ off: reveal && $clicks < i, cur: reveal && $clicks === i }">
        <div class="rows-mark" :class="{ num: numbered }">{{ mark(it, i, numbered) }}</div>
        <div class="rows-title">{{ it.title }}</div>
        <div class="rows-text" v-html="it.text" />
      </div>
    </div>
  </div>
</template>
