<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// One margin note per click step; the last one stays after the final click.
// A note is a string, or a list of short sentences shown one per line.
const props = defineProps({ notes: { type: Array, required: true } })
const { $clicks } = useSlideContext()
const cur = computed(() => props.notes[Math.min($clicks.value, props.notes.length - 1)])
const lines = computed(() => (Array.isArray(cur.value) ? cur.value : [cur.value]))
const key = computed(() => lines.value.join('|'))
</script>

<template>
  <Transition name="tb-fade" mode="out-in">
    <div :key="key" class="tb-note-text">
      <p v-for="(l, i) in lines" :key="i" v-html="l" />
    </div>
  </Transition>
</template>
