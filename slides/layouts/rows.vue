<script setup>
import { useSlideContext } from '@slidev/client'

// A vertical list: one full-width row per item, read top to bottom.
// items: [{ label?, title, text }]. text is one short sentence, or a list of short sentences,
// one per line. numbered: show 01, 02, … instead of labels.
// reveal: row i appears on click i (row 0 is shown from the start).
// ::note:: puts the per-click explanation in the right-hand column, as on textbook slides.
defineProps({ chapter: String, items: Array, numbered: Boolean, reveal: Boolean, noteLabel: { type: String, default: 'NOTE' } })
const { $clicks } = useSlideContext()
const mark = (it, i, numbered) => (numbered ? String(i + 1).padStart(2, '0') : it.label)
const lines = (t) => (Array.isArray(t) ? t : [t])
</script>

<template>
  <div class="slidev-layout tb-rows" :class="{ 'has-note': !!$slots.note }">
    <div class="tb-chap">{{ chapter }}</div>
    <slot />
    <div class="rows-body">
      <div class="rows-list">
        <div v-for="(it, i) in items" :key="i" class="rows-row" :class="{ off: reveal && $clicks < i }">
          <div class="rows-mark" :class="{ num: numbered }">{{ mark(it, i, numbered) }}</div>
          <div class="rows-title">{{ it.title }}</div>
          <div class="rows-text"><div v-for="(l, j) in lines(it.text)" :key="j" v-html="l" /></div>
        </div>
      </div>
      <aside v-if="$slots.note" class="tb-note">
        <div class="tb-note-label">{{ noteLabel }}</div>
        <slot name="note" />
      </aside>
    </div>
  </div>
</template>
