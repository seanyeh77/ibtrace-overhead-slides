<script setup>
// size: font size for a long term, e.g. '52px'
defineProps({ chapter: String, term: String, kind: String, size: String })
</script>

<template>
  <div class="slidev-layout tb-def">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="def-grid">
      <div class="def-term">
        <div class="def-kind">{{ kind }}</div>
        <div class="def-word" :style="size ? { fontSize: size } : null">{{ term }}</div>
      </div>
      <div class="def-body">
        <slot />
        <div v-if="$slots.example" class="def-ex">
          <div class="def-ex-label">EXAMPLE</div>
          <slot name="example" />
        </div>
      </div>
    </div>
  </div>
</template>
