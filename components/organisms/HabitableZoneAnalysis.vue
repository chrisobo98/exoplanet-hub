<template>
  <!--
    HabitableZoneAnalysis Component

    Provides system-by-system analysis of planetary habitability based on
    stellar properties and orbital distances.

    Features:
    - Star system selection dropdown
    - Stellar properties display (type, temperature, radius, luminosity)
    - Habitable zone boundary visualization with conversions (AU and km)
    - Per-planet analysis with color-coded cards
    - Sorting by orbital distance (innermost to outermost)
    - Null-safe rendering throughout

    Scientific Calculations:
    - Uses Stefan-Boltzmann Law for habitable zone boundaries
    - Classifies planets as: habitable, too-hot, or too-cold
    - Displays orbital mechanics (period, eccentricity)
  -->
  <div class="space-y-6">
    <!-- ================================================================== -->
    <!-- SYSTEM SELECTION                                                   -->
    <!-- ================================================================== -->
    <!--
      Dropdown to select which star system to analyze.
      Shows planet count for each system (e.g., "TOI-700 (3 planets)").
      Automatically selects first system on mount.
    -->
    <div
      class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6"
    >
      <h2 class="text-white text-lg font-semibold mb-4">Select Star System</h2>
      <select
        v-model="selectedSystem"
        class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
      >
        <!-- Display system name with planet count -->
        <option v-for="system in systems" :key="system" :value="system">
          {{ system }} ({{ systemsMap[system].length }} planet{{
            systemsMap[system].length > 1 ? "s" : ""
          }})
        </option>
      </select>
    </div>

    <!-- ================================================================== -->
    <!-- STELLAR PROPERTIES                                                 -->
    <!-- ================================================================== -->
    <!--
      Displays host star properties for the selected system.
      Uses first planet's stellar data (all planets in system share same star).

      Properties shown:
      - Stellar Type: Spectral classification (e.g., "M2V", "G2V")
      - Temperature: Effective temperature in Kelvin
      - Radius: Star size in Solar radii (R☉)
      - Luminosity: Calculated from Stefan-Boltzmann Law (L☉)

      Color scheme: Orange gradient (represents star)
    -->
    <div
      v-if="referencePlanet"
      class="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-sm border border-orange-400/30 rounded-lg p-6"
    >
      <h3 class="text-white text-lg font-semibold mb-4">
        Host Star: {{ selectedSystem }}
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Stellar spectral type (e.g., M3V, G2V, K5) -->
        <DetailItem
          label="Stellar Type"
          :value="referencePlanet.st_spectype || 'Unknown'"
        />

        <!-- Stellar effective temperature in Kelvin
             Null-safe: Checks for undefined and null before rendering -->
        <DetailItem
          label="Temperature"
          :value="
            referencePlanet.st_teff !== undefined &&
            referencePlanet.st_teff !== null
              ? `${referencePlanet.st_teff} K`
              : 'N/A'
          "
        />

        <!-- Stellar radius in Solar radii (R☉)
             Null-safe: Shows "N/A" if data missing -->
        <DetailItem
          label="Radius"
          :value="`${
            typeof referencePlanet.st_rad === 'number'
              ? referencePlanet.st_rad.toFixed(2)
              : 'N/A'
          } R☉`"
        />

        <!-- Stellar luminosity (calculated from Stefan-Boltzmann Law)
             Derived from radius and temperature
             1.0 L☉ = Sun's luminosity -->
        <DetailItem
          label="Luminosity"
          :value="`${habitableZone.luminosity.toFixed(3)} L☉`"
        />
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- HABITABLE ZONE BOUNDARIES                                          -->
    <!-- ================================================================== -->
    <!--
      Visualizes the habitable zone (Goldilocks zone) for the selected star.

      Three zones displayed:
      1. Inner Boundary (red) - Too hot, water evaporates (runaway greenhouse)
      2. Habitable Zone Width (green) - Liquid water possible
      3. Outer Boundary (blue) - Too cold, water freezes (maximum greenhouse)

      Units shown:
      - AU (Astronomical Units): 1 AU = Earth-Sun distance
      - Million km: For easier comprehension (1 AU ≈ 149.6 million km)

      Educational note included explaining the concept of habitable zones.
    -->
    <div
      class="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-6"
    >
      <h3 class="text-white text-lg font-semibold mb-4">
        Habitable Zone Boundaries
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Inner Boundary: Runaway greenhouse limit -->
        <div
          class="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <div class="text-red-300 text-sm mb-1">Inner Boundary (Too Hot)</div>
          <div class="text-white text-2xl font-bold">
            {{ habitableZone.innerBoundary.toFixed(3) }} AU
          </div>
          <!-- Convert AU to million km: AU × 149.6 -->
          <div class="text-red-200 text-xs mt-2">
            {{ (habitableZone.innerBoundary * 149.6).toFixed(1) }} million km
          </div>
        </div>

        <!-- Habitable Zone Width: Range where liquid water is possible -->
        <div
          class="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <div class="text-green-300 text-sm mb-1">Habitable Zone Width</div>
          <div class="text-white text-2xl font-bold">
            {{
              (
                habitableZone.outerBoundary - habitableZone.innerBoundary
              ).toFixed(3)
            }}
            AU
          </div>
          <div class="text-green-200 text-xs mt-2">Liquid water possible</div>
        </div>

        <!-- Outer Boundary: Maximum greenhouse limit -->
        <div
          class="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <div class="text-blue-300 text-sm mb-1">
            Outer Boundary (Too Cold)
          </div>
          <div class="text-white text-2xl font-bold">
            {{ habitableZone.outerBoundary.toFixed(3) }} AU
          </div>
          <!-- Convert AU to million km: AU × 149.6 -->
          <div class="text-blue-200 text-xs mt-2">
            {{ (habitableZone.outerBoundary * 149.6).toFixed(1) }} million km
          </div>
        </div>
      </div>

      <!-- Educational description of habitable zones -->
      <div class="mt-4 text-purple-200 text-sm">
        The habitable zone (also called the "Goldilocks zone") is the region
        around a star where conditions could allow liquid water to exist on a
        planet's surface - a key requirement for life as we know it.
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- PLANETARY ANALYSIS                                                 -->
    <!-- ================================================================== -->
    <!--
      Displays all planets in the selected system with detailed analysis.

      Features:
      - Color-coded cards by habitability (green, red, blue)
      - Sorted by orbital distance (innermost to outermost)
      - Shows: name, zone status, orbital distance, radius, temp, period, eccentricity
      - Null-safe rendering for all properties
      - Responsive layout (stacks on mobile, grid on desktop)
    -->
    <div
      class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6"
    >
      <h3 class="text-white text-lg font-semibold mb-4">Planetary Analysis</h3>
      <div class="space-y-4">
        <!-- Loop through planets sorted by orbital distance -->
        <div
          v-for="planet in sortedPlanets"
          :key="planet.pl_name"
          :class="getPlanetCardClass(planet)"
        >
          <!-- Planet header: Name, zone label, orbital distance -->
          <div
            class="flex flex-col md:flex-row md:justify-between md:items-start mb-3"
          >
            <div>
              <!-- Planet name (e.g., "TOI-700 d") -->
              <h4 class="text-white font-semibold">{{ planet.pl_name }}</h4>

              <!-- Habitability status with emoji indicator -->
              <div class="text-purple-200 text-sm">
                {{ getHabitableZoneLabel(planet) }}
              </div>
            </div>

            <!-- Orbital distance badge
                 Shows distance from star in AU (Astronomical Units)
                 1 AU = Earth-Sun distance -->
            <div
              class="mt-2 md:mt-0 px-3 py-1 bg-purple-900/40 rounded-lg text-white text-sm"
            >
              {{
                typeof planet.pl_orbsmax === "number"
                  ? planet.pl_orbsmax.toFixed(3)
                  : "N/A"
              }}
              AU from star
            </div>
          </div>

          <!-- Planet properties grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <!-- Planet radius in Earth radii (R⊕)
                 1.0 = Earth-sized
                 11.2 ≈ Jupiter-sized -->
            <div>
              <div class="text-purple-300">Radius</div>
              <div class="text-white">
                {{ planet.pl_rade?.toFixed(2) || "N/A" }} R⊕
              </div>
            </div>

            <!-- Equilibrium temperature in Kelvin
                 Temperature planet would reach in thermal equilibrium
                 Earth's equilibrium temp ≈ 255K (actual is 288K due to greenhouse effect) -->
            <div>
              <div class="text-purple-300">Eq. Temp</div>
              <div class="text-white">
                {{
                  planet.pl_eqt !== null && planet.pl_eqt !== undefined
                    ? planet.pl_eqt
                    : "N/A"
                }}
                K
              </div>
            </div>

            <!-- Orbital period in days
                 How long it takes to complete one orbit around the star
                 Earth = 365.25 days -->
            <div>
              <div class="text-purple-300">Period</div>
              <div class="text-white">
                {{
                  typeof planet.pl_orbper === "number"
                    ? planet.pl_orbper.toFixed(1)
                    : "N/A"
                }}
                days
              </div>
            </div>

            <!-- Orbital eccentricity (0-1)
                 0 = perfectly circular orbit (like Earth, e ≈ 0.017)
                 0.5 = moderately elliptical
                 0.9+ = highly elliptical (like comets) -->
            <div>
              <div class="text-purple-300">Eccentricity</div>
              <div class="text-white">
                {{
                  typeof planet.pl_orbeccen === "number"
                    ? planet.pl_orbeccen.toFixed(3)
                    : "N/A"
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * HabitableZoneAnalysis Component
 *
 * Analyzes planetary systems for habitability potential based on orbital
 * distances relative to their host star's habitable zone.
 *
 * Key Features:
 * - System-by-system selection and analysis
 * - Habitable zone boundary calculations using Stefan-Boltzmann Law
 * - Visual classification (green = habitable, red = too hot, blue = too cold)
 * - Comprehensive planetary properties display
 * - Sorting by orbital distance for easy comparison
 * - Unit conversions (AU to km) for accessibility
 *
 * Scientific Background:
 * - Habitable Zone: Region where liquid water could exist on surface
 * - Inner boundary: Runaway greenhouse limit (like Venus)
 * - Outer boundary: Maximum greenhouse limit (like early Mars)
 * - Earth is in the middle of Sun's habitable zone (1.0 AU)
 *
 * Data Flow:
 * 1. Fetch exoplanet data on mount
 * 2. Group planets by host star (systemsMap)
 * 3. User selects system from dropdown
 * 4. Calculate habitable zone for that star
 * 5. Classify each planet relative to boundaries
 * 6. Display color-coded results
 */

import { ref, computed, onMounted } from "vue";
import { useExoplanets } from "@/composables/useExoplanets";
import type { Exoplanet } from "@/types/exoplanet";

// ============================================================================
// COMPOSABLES & DATA
// ============================================================================

/**
 * Access exoplanet data and habitable zone calculation utilities
 */
const {
  exoplanets,
  fetchExoplanets,
  calculateHabitableZone,
  isInHabitableZone,
} = useExoplanets();

/**
 * Currently selected star system (hostname)
 * Example: "TOI-700", "TRAPPIST-1", "Kepler-186"
 */
const selectedSystem = ref<string>("");

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

/**
 * Fetch exoplanet data and auto-select first system on component mount
 */
onMounted(async () => {
  await fetchExoplanets();

  // Auto-select first system if available
  if (systems.value.length > 0) {
    selectedSystem.value = systems.value[0];
  }
});

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

/**
 * Group planets by host star (hostname)
 *
 * Creates a map where:
 * - Key: Host star name (e.g., "TOI-700")
 * - Value: Array of planets orbiting that star
 *
 * Example:
 * {
 *   "TOI-700": [planet_b, planet_c, planet_d],
 *   "TRAPPIST-1": [planet_b, planet_c, planet_d, planet_e, ...]
 * }
 *
 * Uses reduce to build the map efficiently in a single pass.
 *
 * @type {ComputedRef<Record<string, Exoplanet[]>>}
 */
const systemsMap = computed(() => {
  return exoplanets.value.reduce((acc, planet) => {
    // Initialize array for new systems
    if (!acc[planet.hostname]) {
      acc[planet.hostname] = [];
    }
    // Add planet to its system
    acc[planet.hostname].push(planet);
    return acc;
  }, {} as Record<string, Exoplanet[]>);
});

/**
 * Sorted list of all unique star system names
 *
 * Alphabetically sorted for consistent UI ordering.
 * Used to populate the system selection dropdown.
 *
 * @type {ComputedRef<string[]>}
 */
const systems = computed(() => Object.keys(systemsMap.value).sort());

/**
 * Array of all planets in the currently selected system
 *
 * Returns empty array if no system is selected.
 *
 * @type {ComputedRef<Exoplanet[]>}
 */
const currentSystemPlanets = computed(
  () => systemsMap.value[selectedSystem.value] || []
);

/**
 * Reference planet for stellar properties
 *
 * Uses the first planet with valid stellar data (st_rad and st_teff).
 * Falls back to first planet if none have valid data.
 *
 * Why: All planets in a system share the same star, so we only need
 * stellar properties from one planet. Some planets may have missing
 * stellar data, so we find the first complete record.
 *
 * @type {ComputedRef<Exoplanet | undefined>}
 */
const referencePlanet = computed(
  () =>
    currentSystemPlanets.value.find(
      (p) => typeof p.st_rad === "number" && typeof p.st_teff === "number"
    ) || currentSystemPlanets.value[0]
);

/**
 * Habitable zone boundaries for the selected star system
 *
 * Calculates inner/outer boundaries and stellar luminosity using
 * Stefan-Boltzmann Law from the reference planet's stellar properties.
 *
 * Returns zeros if no reference planet (shouldn't happen in practice).
 *
 * Result object:
 * - innerBoundary: Inner edge in AU (runaway greenhouse limit)
 * - outerBoundary: Outer edge in AU (maximum greenhouse limit)
 * - luminosity: Stellar luminosity in Solar luminosities
 *
 * @type {ComputedRef<HabitableZoneBoundaries>}
 */
const habitableZone = computed(() => {
  if (!referencePlanet.value) {
    return { innerBoundary: 0, outerBoundary: 0, luminosity: 0 };
  }
  return calculateHabitableZone(
    referencePlanet.value.st_rad,
    referencePlanet.value.st_teff
  );
});

/**
 * Planets sorted by orbital distance (innermost to outermost)
 *
 * Creates a new array (spread operator) to avoid mutating original.
 * Sorts by semi-major axis (pl_orbsmax) in ascending order.
 *
 * Defaults missing values to 0 for sorting stability.
 *
 * Visual layout: Mimics actual planetary system arrangement.
 *
 * @type {ComputedRef<Exoplanet[]>}
 */
const sortedPlanets = computed(() => {
  return [...currentSystemPlanets.value].sort(
    (a, b) => (a.pl_orbsmax || 0) - (b.pl_orbsmax || 0)
  );
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get Tailwind CSS classes for planet card based on habitability
 *
 * Color scheme:
 * - Green gradient: Habitable (liquid water possible)
 * - Red gradient: Too hot (water evaporates)
 * - Blue gradient: Too cold (water freezes)
 *
 * Uses pre-calculated habitable zone boundaries for efficiency
 * (avoids recalculating for each planet).
 *
 * @param {Exoplanet} planet - Planet to classify
 * @returns {string} Tailwind CSS class string
 */
function getPlanetCardClass(planet: Exoplanet): string {
  // Determine habitability zone using pre-calculated boundaries
  const zone = isInHabitableZone(
    planet,
    habitableZone.value.innerBoundary,
    habitableZone.value.outerBoundary
  );

  // Base classes: gradient background, glass effect, border, rounded corners, padding
  const baseClass = "bg-gradient-to-br backdrop-blur-sm border rounded-lg p-4";

  // Apply color scheme based on habitability
  if (zone === "habitable") {
    return `${baseClass} from-green-600/20 to-emerald-600/20 border-green-400/30`;
  } else if (zone === "too-hot") {
    return `${baseClass} from-red-600/20 to-orange-600/20 border-red-400/30`;
  } else {
    // too-cold
    return `${baseClass} from-blue-600/20 to-cyan-600/20 border-blue-400/30`;
  }
}

/**
 * Get human-readable habitability label with emoji indicator
 *
 * Labels:
 * - "✓ In Habitable Zone" - Liquid water possible
 * - "⚠ Too Hot for Liquid Water" - Too close to star
 * - "❄ Too Cold for Liquid Water" - Too far from star
 *
 * Uses pre-calculated boundaries for consistency with visual styling.
 *
 * @param {Exoplanet} planet - Planet to classify
 * @returns {string} Human-readable label with emoji
 */
function getHabitableZoneLabel(planet: Exoplanet): string {
  // Determine zone using pre-calculated boundaries
  const zone = isInHabitableZone(
    planet,
    habitableZone.value.innerBoundary,
    habitableZone.value.outerBoundary
  );

  // Return descriptive label with emoji
  if (zone === "habitable") return "✓ In Habitable Zone";
  if (zone === "too-hot") return "⚠ Too Hot for Liquid Water";
  return "❄ Too Cold for Liquid Water";
}
</script>
