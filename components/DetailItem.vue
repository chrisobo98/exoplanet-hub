<template>
  <div>
    <div class="text-purple-300 text-sm">{{ label }}</div>
    <div class="text-white font-semibold">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
}>();
</script>
