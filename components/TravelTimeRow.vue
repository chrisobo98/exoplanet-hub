<template>
  <div class="border-b border-purple-500/10 pb-3">
    <div class="flex justify-between items-baseline mb-1">
      <span class="text-purple-200">{{ description }}</span>
      <span class="text-white">{{ speed }}c</span>
    </div>
    <div class="text-2xl text-purple-100">{{ travelTime }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  description: string;
  speed: string;
  distance: number;
}>();

const travelTime = computed(() => {
  const speedValue = parseFloat(props.speed);
  const years = props.distance / speedValue;

  if (years < 100) {
    return `${years.toFixed(1)} years`;
  } else if (years < 1000000) {
    return `${(years / 1000).toFixed(2)}k years`;
  } else {
    return `${(years / 1000000).toFixed(2)}M years`;
  }
});
</script>
