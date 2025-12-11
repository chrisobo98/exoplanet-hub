<template>
  <div>
    <!-- Navigation Tabs -->
    <nav class="bg-black/20 backdrop-blur-sm border-b border-purple-500/10">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Desktop Tabs -->
        <div class="hidden md:flex gap-1">
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

        <!-- Mobile Dropdown -->
        <div class="md:hidden py-3">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="w-full flex items-center justify-between px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-white transition-colors"
          >
            <div class="flex items-center gap-3">
              <component :is="currentTabIcon" class="w-5 h-5" />
              <span class="font-medium">{{ currentTabLabel }}</span>
            </div>
            <ChevronDown :class="['w-5 h-5 transition-transform', mobileMenuOpen ? 'rotate-180' : '']" />
          </button>

          <!-- Mobile Menu Items -->
          <div v-show="mobileMenuOpen" class="mt-2 bg-black/40 rounded-lg overflow-hidden border border-purple-500/20">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="selectTab(tab.value)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                activeTab === tab.value
                  ? 'bg-purple-500/30 text-white'
                  : 'text-purple-200 hover:bg-purple-500/20 hover:text-white'
              ]"
            >
              <component :is="tab.icon" class="w-5 h-5" />
              <span>{{ tab.label }}</span>
            </button>
          </div>
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
import { ref, computed } from 'vue';
import { Map, Globe, Rocket, Leaf, ChevronDown } from 'lucide-vue-next';

type Tab = 'overview' | '3d' | 'mission' | 'habitable';

const activeTab = ref<Tab>('overview');
const mobileMenuOpen = ref(false);

const tabs = [
  { value: 'overview' as Tab, label: 'Overview', icon: Map },
  { value: '3d' as Tab, label: '3D Star Map', icon: Globe },
  { value: 'mission' as Tab, label: 'Mission Planner', icon: Rocket },
  { value: 'habitable' as Tab, label: 'Habitable Zones', icon: Leaf },
];

const currentTabLabel = computed(() => {
  return tabs.find(tab => tab.value === activeTab.value)?.label || 'Overview';
});

const currentTabIcon = computed(() => {
  return tabs.find(tab => tab.value === activeTab.value)?.icon || Map;
});

const selectTab = (tab: Tab) => {
  activeTab.value = tab;
  mobileMenuOpen.value = false;
};
</script>
  