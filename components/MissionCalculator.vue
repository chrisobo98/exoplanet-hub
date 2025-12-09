<template>
  <div class="space-y-6">
    <!-- Planet Selection -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <h2 class="text-white text-lg font-semibold mb-4">Select Target Exoplanet</h2>
      <select
        v-model="selectedPlanetName"
        class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
      >
        <option v-for="planet in exoplanets" :key="planet.pl_name" :value="planet.pl_name">
          {{ planet.pl_name }} ({{ planet.hostname }}) - {{ (planet.sy_dist * 3.262).toFixed(1) }} light years
        </option>
      </select>
    </div>

    <!-- Planet Details -->
    <div v-if="selectedPlanet" class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6">
      <h3 class="text-white text-lg font-semibold mb-4">Target System Details</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailItem label="Planet" :value="selectedPlanet.pl_name" />
        <DetailItem label="Host Star" :value="selectedPlanet.hostname" />
        <DetailItem label="Distance" :value="`${distance.toFixed(1)} ly`" />
        <DetailItem label="Stellar Type" :value="selectedPlanet.st_spectype || 'Unknown'" />
        <DetailItem label="Radius" :value="`${selectedPlanet.pl_rade?.toFixed(2) || 'N/A'} R⊕`" />
        <DetailItem label="Mass" :value="`${selectedPlanet.pl_massj?.toFixed(3) || 'N/A'} MJ`" />
        <DetailItem label="Orbital Period" :value="`${selectedPlanet.pl_orbper?.toFixed(1) || 'N/A'} days`" />
        <DetailItem label="Eq. Temp" :value="`${selectedPlanet.pl_eqt || 'N/A'} K`" />
      </div>
    </div>

    <!-- Travel Time -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <div class="flex items-center gap-2 mb-4">
        <Clock class="w-5 h-5 text-purple-400" />
        <h3 class="text-white text-lg font-semibold">Travel Time</h3>
      </div>
      <div class="space-y-4">
        <TravelTimeRow description="Fusion drive" speed="0.1" :distance="distance" />
        <TravelTimeRow description="Advanced propulsion" speed="0.5" :distance="distance" />
        <TravelTimeRow description="Near-light speed" speed="0.9" :distance="distance" />
      </div>
    </div>

    <!-- Mission Feasibility -->
    <div class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6">
      <div class="flex items-center gap-2 mb-4">
        <Rocket class="w-5 h-5 text-purple-400" />
        <h3 class="text-white text-lg font-semibold">Mission Feasibility Assessment</h3>
      </div>
      <div class="space-y-3 text-purple-200 text-sm">
        <p>
          At conventional rocket speeds (~50 km/s or 0.00017c), reaching {{ selectedPlanet?.pl_name || 'this target' }}
          would take approximately <strong class="text-white">{{ (distance / 0.00017).toFixed(0) }} years</strong>.
        </p>
        <p>
          Revolutionary propulsion systems like nuclear fusion, antimatter drives, or breakthrough physics
          would be required for realistic interstellar missions.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Clock, Rocket } from 'lucide-vue-next';
import { useExoplanets } from '@/composables/useExoplanets';

const { exoplanets, fetchExoplanets } = useExoplanets();
const selectedPlanetName = ref<string>('');

onMounted(async () => {
  await fetchExoplanets();
  if (exoplanets.value.length > 0) {
    selectedPlanetName.value = exoplanets.value[0].pl_name;
  }
});

const selectedPlanet = computed(() => {
  return exoplanets.value.find(p => p.pl_name === selectedPlanetName.value);
});

const distance = computed(() => {
  return (selectedPlanet.value?.sy_dist || 0) * 3.262; // parsecs to light years
});
</script>
