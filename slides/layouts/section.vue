<script setup>
// question: the question this part answers, usually the one the previous part left open.
defineProps({ number: [String, Number], chapter: String, question: String })
</script>

<template>
  <div class="slidev-layout tb-section">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="sec-num">{{ number }}</div>
    <div class="sec-body">
      <div v-if="question" class="sec-q"><span>這一部分回答</span>{{ question }}</div>
      <slot />
    </div>
  </div>
</template>
