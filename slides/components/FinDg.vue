<script setup>
import FlowDg from './FlowDg.vue'
import D from '../utils/finDiagrams.js'
defineProps({ name: String })
</script>
<template><FlowDg v-bind="D[name]" /></template>
