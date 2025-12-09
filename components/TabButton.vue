<template>
  <button
    @click="$emit('click')"
    :class="[
      'flex items-center gap-2 px-6 py-3 transition-all',
      active
        ? 'bg-purple-600 text-white border-b-2 border-purple-400'
        : 'text-purple-300 hover:bg-purple-900/30 hover:text-white'
    ]"
  >
    <slot />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean;
  label: string;
}>();

defineEmits<{
  click: [];
}>();
</script>
