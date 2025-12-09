<template>
  <div class="space-y-6">
    <!-- System Selection -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <h2 class="text-white text-lg font-semibold mb-4">Select Star System</h2>
      <select
        v-model="selectedSystem"
        class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
      >
        <option v-for="system in systems" :key="system" :value="system">
          {{ system }} ({{ systemsMap[system].length }} planet{{ systemsMap[system].length > 1 ? 's' : '' }})
        </option>
      </select>
    </div>

    <!-- Star Information -->
    <div v-if="referencePlanet" class="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-sm border border-orange-400/30 rounded-lg p-6">
      <h3 class="text-white text-lg font-semibold mb-4">Host Star: {{ selectedSystem }}</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailItem label="Stellar Type" :value="referencePlanet.st_spectype || 'Unknown'" />
        <DetailItem label="Temperature" :value="`${referencePlanet.st_teff} K`" />
        <DetailItem label="Radius" :value="`${referencePlanet.st_rad?.toFixed(2) || 'N/A'} R☉`" />
        <DetailItem label="Luminosity" :value="`${habitableZone.luminosity.toFixed(3)} L☉`" />
      </div>
    </div>

    <!-- Habitable Zone Info -->
    <div class="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-6">
      <h3 class="text-white text-lg font-semibold mb-4">Habitable Zone Boundaries</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div class="text-red-300 text-sm mb-1">Inner Boundary (Too Hot)</div>
          <div class="text-white text-2xl font-bold">{{ habitableZone.innerBoundary.toFixed(3) }} AU</div>
          <div class="text-red-200 text-xs mt-2">{{ (habitableZone.innerBoundary * 149.6).toFixed(1) }} million km</div>
        </div>
        <div class="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div class="text-green-300 text-sm mb-1">Habitable Zone Width</div>
          <div class="text-white text-2xl font-bold">{{ (habitableZone.outerBoundary - habitableZone.innerBoundary).toFixed(3) }} AU</div>
          <div class="text-green-200 text-xs mt-2">Liquid water possible</div>
        </div>
        <div class="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div class="text-blue-300 text-sm mb-1">Outer Boundary (Too Cold)</div>
          <div class="text-white text-2xl font-bold">{{ habitableZone.outerBoundary.toFixed(3) }} AU</div>
          <div class="text-blue-200 text-xs mt-2">{{ (habitableZone.outerBoundary * 149.6).toFixed(1) }} million km</div>
        </div>
      </div>
      <div class="mt-4 text-purple-200 text-sm">
        The habitable zone (also called the "Goldilocks zone") is the region around a star where conditions
        could allow liquid water to exist on a planet's surface - a key requirement for life as we know it.
      </div>
    </div>

    <!-- Planet Details -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <h3 class="text-white text-lg font-semibold mb-4">Planetary Analysis</h3>
      <div class="space-y-4">
        <div
          v-for="planet in sortedPlanets"
          :key="planet.pl_name"
          :class="getPlanetCardClass(planet)"
        >
          <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
            <div>
              <h4 class="text-white font-semibold">{{ planet.pl_name }}</h4>
              <div class="text-purple-200 text-sm">{{ getHabitableZoneLabel(planet) }}</div>
            </div>
            <div class="mt-2 md:mt-0 px-3 py-1 bg-purple-900/40 rounded-lg text-white text-sm">
              {{ planet.pl_orbsmax?.toFixed(3) || 'N/A' }} AU from star
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div class="text-purple-300">Radius</div>
              <div class="text-white">{{ planet.pl_rade?.toFixed(2) || 'N/A' }} R⊕</div>
            </div>
            <div>
              <div class="text-purple-300">Eq. Temp</div>
              <div class="text-white">{{ planet.pl_eqt || 'N/A' }} K</div>
            </div>
            <div>
              <div class="text-purple-300">Period</div>
              <div class="text-white">{{ planet.pl_orbper?.toFixed(1) || 'N/A' }} days</div>
            </div>
            <div>
              <div class="text-purple-300">Eccentricity</div>
              <div class="text-white">{{ planet.pl_orbeccen?.toFixed(3) || 'N/A' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useExoplanets } from '@/composables/useExoplanets';
import type { Exoplanet } from '@/types/exoplanet';

const { exoplanets, fetchExoplanets, calculateHabitableZone, isInHabitableZone } = useExoplanets();
const selectedSystem = ref<string>('');

onMounted(async () => {
  await fetchExoplanets();
  if (systems.value.length > 0) {
    selectedSystem.value = systems.value[0];
  }
});

const systemsMap = computed(() => {
  return exoplanets.value.reduce((acc, planet) => {
    if (!acc[planet.hostname]) {
      acc[planet.hostname] = [];
    }
    acc[planet.hostname].push(planet);
    return acc;
  }, {} as Record<string, Exoplanet[]>);
});

const systems = computed(() => Object.keys(systemsMap.value).sort());

const currentSystemPlanets = computed(() => systemsMap.value[selectedSystem.value] || []);

const referencePlanet = computed(() => currentSystemPlanets.value[0]);

const habitableZone = computed(() => {
  if (!referencePlanet.value) {
    return { innerBoundary: 0, outerBoundary: 0, luminosity: 0 };
  }
  return calculateHabitableZone(
    referencePlanet.value.st_rad,
    referencePlanet.value.st_teff
  );
});

const sortedPlanets = computed(() => {
  return [...currentSystemPlanets.value].sort((a, b) => (a.pl_orbsmax || 0) - (b.pl_orbsmax || 0));
});

function getPlanetCardClass(planet: Exoplanet) {
  const zone = isInHabitableZone(planet);
  const baseClass = 'bg-gradient-to-br backdrop-blur-sm border rounded-lg p-4';

  if (zone === 'habitable') {
    return `${baseClass} from-green-600/20 to-emerald-600/20 border-green-400/30`;
  } else if (zone === 'too-hot') {
    return `${baseClass} from-red-600/20 to-orange-600/20 border-red-400/30`;
  } else {
    return `${baseClass} from-blue-600/20 to-cyan-600/20 border-blue-400/30`;
  }
}

function getHabitableZoneLabel(planet: Exoplanet) {
  const zone = isInHabitableZone(planet);
  if (zone === 'habitable') return '✓ In Habitable Zone';
  if (zone === 'too-hot') return '⚠ Too Hot for Liquid Water';
  return '❄ Too Cold for Liquid Water';
}
</script>
