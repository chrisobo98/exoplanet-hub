<template>
    <Card>
      <template #title>Exoplanet Lab Command Control</template>
      <template #subtitle>Click on a planet to view distance</template>
      <template #content>
        <p class="m-0">
          {{ selectedExoplanet }}
        </p>
      </template>
      <template #footer>
        <div class="flex gap-4 mt-1">
          <Button label="Cancel" severity="secondary" outlined class="w-full" @click="$emit('cancel')" />
          <Button label="Travel" class="w-full" @click="$emit('travel')" />
        </div>
      </template>
    </Card>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    selectedExoplanet: Object
  });
  </script>
  