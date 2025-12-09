<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Total Exoplanets" :value="stats.total" />
      <StatCard
        label="In Habitable Zone"
        :value="stats.habitable"
        highlight
      />
      <StatCard
        label="Nearest System"
        :value="`${stats.nearestDistance.toFixed(1)} ly`"
      />
      <StatCard
        label="Avg. Discovery Year"
        :value="stats.avgDiscoveryYear"
      />
    </div>

    <!-- Filters -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <div class="flex items-center gap-2 mb-4">
        <Filter class="w-5 h-5 text-purple-400" />
        <h2 class="text-white text-lg font-semibold">Filters</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-purple-200 text-sm mb-2">Stellar Type</label>
          <select
            v-model="selectedStellarType"
            class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Types</option>
            <option v-for="type in stellarTypes" :key="type" :value="type">
              Type {{ type }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-purple-200 text-sm mb-2">Min Distance (ly)</label>
          <input
            v-model.number="minDistance"
            type="number"
            class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label class="block text-purple-200 text-sm mb-2">Max Distance (ly)</label>
          <input
            v-model.number="maxDistance"
            type="number"
            class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>
    </div>

    <!-- Exoplanet Table -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 overflow-x-auto">
      <h3 class="text-white text-lg font-semibold mb-4">Discovered Exoplanets</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-purple-500/20">
            <th class="text-left py-3 px-4 text-purple-200">Name</th>
            <th class="text-left py-3 px-4 text-purple-200">Host Star</th>
            <th class="text-left py-3 px-4 text-purple-200">Type</th>
            <th class="text-left py-3 px-4 text-purple-200">Distance (ly)</th>
            <th class="text-left py-3 px-4 text-purple-200">Radius (R⊕)</th>
            <th class="text-left py-3 px-4 text-purple-200">Habitable Zone</th>
            <th class="text-left py-3 px-4 text-purple-200">Year</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="planet in filteredExoplanets"
            :key="planet.pl_name"
            class="border-b border-purple-500/10 hover:bg-purple-500/10 transition-colors"
          >
            <td class="py-3 px-4 text-white">{{ planet.pl_name }}</td>
            <td class="py-3 px-4 text-purple-200">{{ planet.hostname }}</td>
            <td class="py-3 px-4 text-purple-200">{{ planet.st_spectype || 'N/A' }}</td>
            <td class="py-3 px-4 text-purple-200">{{ (planet.sy_dist * 3.262).toFixed(1) }}</td>
            <td class="py-3 px-4 text-purple-200">{{ planet.pl_rade?.toFixed(2) || 'N/A' }}</td>
            <td class="py-3 px-4">
              <span :class="getHabitableZoneClass(planet)">
                {{ getHabitableZoneLabel(planet) }}
              </span>
            </td>
            <td class="py-3 px-4 text-purple-200">{{ planet.disc_year }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredExoplanets.length === 0" class="text-center py-8 text-purple-300">
        No exoplanets match your filters
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Filter } from 'lucide-vue-next';
import { useExoplanets } from '@/composables/useExoplanets';
import type { Exoplanet } from '@/types/exoplanet';

const { exoplanets, loading, stats, fetchExoplanets, isInHabitableZone } = useExoplanets();

const selectedStellarType = ref<string>('all');
const minDistance = ref<number>(0);
const maxDistance = ref<number>(5000);

onMounted(async () => {
  if (exoplanets.value.length === 0) {
    await fetchExoplanets();
  }
});

const stellarTypes = computed(() => {
  const types = new Set(exoplanets.value.map(p => p.st_spectype).filter(Boolean));
  return Array.from(types).sort();
});

const filteredExoplanets = computed(() => {
  return exoplanets.value.filter(planet => {
    const distanceLY = planet.sy_dist * 3.262;
    const typeMatch = selectedStellarType.value === 'all' || planet.st_spectype === selectedStellarType.value;
    const distanceMatch = distanceLY >= minDistance.value && distanceLY <= maxDistance.value;
    return typeMatch && distanceMatch;
  });
});

function getHabitableZoneClass(planet: Exoplanet) {
  const zone = isInHabitableZone(planet);
  const baseClasses = 'px-2 py-1 rounded text-xs';

  if (zone === 'habitable') return `${baseClasses} bg-green-500/20 text-green-300`;
  if (zone === 'too-hot') return `${baseClasses} bg-red-500/20 text-red-300`;
  return `${baseClasses} bg-blue-500/20 text-blue-300`;
}

function getHabitableZoneLabel(planet: Exoplanet) {
  const zone = isInHabitableZone(planet);
  if (zone === 'habitable') return '✓ Habitable';
  if (zone === 'too-hot') return 'Too Hot';
  return 'Too Cold';
}
</script>
