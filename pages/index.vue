<template>
  <div>
    <!-- Navigation Tabs -->
    <nav class="bg-black/20 backdrop-blur-sm border-b border-purple-500/10">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex gap-1">
          <AtomsTabButton
            :active="activeTab === 'overview'"
            @click="activeTab = 'overview'"
            label="Overview"
          >
            <Map class="w-4 h-4" />
          </AtomsTabButton>
          <AtomsTabButton
            :active="activeTab === '3d'"
            @click="activeTab = '3d'"
            label="3D Star Map"
          >
            <Globe class="w-4 h-4" />
          </AtomsTabButton>
          <AtomsTabButton
            :active="activeTab === 'mission'"
            @click="activeTab = 'mission'"
            label="Mission Planner"
          >
            <Rocket class="w-4 h-4" />
          </AtomsTabButton>
          <AtomsTabButton
            :active="activeTab === 'habitable'"
            @click="activeTab = 'habitable'"
            label="Habitable Zones"
          >
            <Leaf class="w-4 h-4" />
          </AtomsTabButton>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <OrganismsExoplanetOverview v-if="activeTab === 'overview'" />
      <OrganismsStarMap3D v-else-if="activeTab === '3d'" />
      <OrganismsMissionCalculator v-else-if="activeTab === 'mission'" />
      <OrganismsHabitableZoneAnalysis v-else-if="activeTab === 'habitable'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Map, Globe, Rocket, Leaf } from 'lucide-vue-next';

type Tab = 'overview' | '3d' | 'mission' | 'habitable';

const activeTab = ref<Tab>('overview');
</script>
  