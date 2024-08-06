<template>
    <div class="grid grid-cols-10 gap-4">
      <div class="col col-span-7">
        <ExoplanetTable @select="onExoplanetSelect" @unselect="onExoplanetUnselect" />
      </div>
      <div class="col col-span-3">
        <ExoplanetVisualization :selectedExoplanet="selectedExoplanet" @select="onExoplanetSelect" />
        <ExoplanetVisualizationCommand class="my-4" :selectedExoplanet="selectedExoplanet" @cancel="cancelTravel" @travel="confirmTravel" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import ExoplanetVisualization from "../components/ExoplanetVisualization.vue";
  import ExoplanetVisualizationCommand from "../components/ExoplanetVisualizationCommand.vue";
  import ExoplanetTable from "../components/ExoplanetTable.vue";
  
  const selectedExoplanet = ref(null);
  
  const onExoplanetSelect = (exoplanet) => {
    console.log(exoplanet)
    selectedExoplanet.value = exoplanet;
  };
  
  const onExoplanetUnselect = () => {
    selectedExoplanet.value = null;
  };
  
  const cancelTravel = () => {
    selectedExoplanet.value = null;
  };
  
  const confirmTravel = () => {
    if (selectedExoplanet.value) {
      console.log('Traveling to:', selectedExoplanet.value.pl_name);
    }
  };
  </script>
  