<template>
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-full" :style="{ backgroundColor: color }" />
    <div>
      <div class="text-white font-semibold">{{ label }}</div>
      <div class="text-purple-300 text-sm">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  color: string;
  label: string;
  description: string;
}>();
</script>
