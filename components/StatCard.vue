<template>
  <div :class="cardClasses">
    <div class="text-purple-200 text-sm mb-2">{{ label }}</div>
    <div class="text-white text-2xl font-bold">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: string | number;
  highlight?: boolean;
}>();

const cardClasses = computed(() => {
  if (props.highlight) {
    return 'p-6 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-400';
  }
  return 'p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-500/20';
});
</script>
