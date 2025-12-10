<template>
  <!--
    ExoplanetOverview Template

    Structure:
    1. Summary Statistics Cards - Quick overview metrics
    2. Filter Controls - Interactive filters for data exploration
    3. Data Table - Detailed exoplanet information with sortable columns
  -->
  <div class="space-y-6">
    <!-- ================================================================== -->
    <!-- SUMMARY STATISTICS CARDS                                           -->
    <!-- ================================================================== -->
    <!--
      Four key metrics displayed in card format:
      - Total count of TESS-discovered exoplanets
      - Number in habitable zone (highlighted in green)
      - Distance to nearest system (in light years)
      - Average discovery year across all planets
    -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AtomsStatCard label="Total Exoplanets" :value="stats.total" />
      <AtomsStatCard
        label="In Habitable Zone"
        :value="stats.habitable"
        highlight
      />
      <AtomsStatCard
        label="Nearest System"
        :value="
          stats.nearestDistance !== null && stats.nearestDistance !== undefined
            ? `${stats.nearestDistance.toFixed(1)} ly`
            : 'N/A'
        "
      />
      <AtomsStatCard
        label="Avg. Discovery Year"
        :value="stats.avgDiscoveryYear"
      />
    </div>

    <!-- ================================================================== -->
    <!-- FILTER CONTROLS                                                    -->
    <!-- ================================================================== -->
    <!--
      Interactive filters to explore the dataset:
      - Stellar Type: Filter by spectral classification (G, K, M, etc.)
      - Distance Range: Min/max distance in light years

      Filters work together (AND logic) - planet must match all filters
      Reactive updates: Table updates immediately as filters change
    -->
    <div
      class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6"
    >
      <div class="flex items-center gap-2 mb-4">
        <Filter class="w-5 h-5 text-purple-400" />
        <h2 class="text-white text-lg font-semibold">Filters</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Stellar Type Filter -->
        <div>
          <label class="block text-purple-200 text-sm mb-2">Stellar Type</label>
          <select
            v-model="selectedStellarType"
            class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Types</option>
            <!-- TODO: Populate stellarTypes array from fetched data -->
            <option v-for="type in stellarTypes" :key="type" :value="type">
              Type {{ type }}
            </option>
          </select>
        </div>

        <!-- Minimum Distance Filter -->
        <div>
          <label class="block text-purple-200 text-sm mb-2"
            >Min Distance (ly)</label
          >
          <!-- v-model.number ensures numeric input type -->
          <input
            v-model.number="minDistance"
            type="number"
            class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <!-- Maximum Distance Filter -->
        <div>
          <label class="block text-purple-200 text-sm mb-2"
            >Max Distance (ly)</label
          >
          <input
            v-model.number="maxDistance"
            type="number"
            class="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- EXOPLANET DATA TABLE                                               -->
    <!-- ================================================================== -->
    <!--
      Displays filtered exoplanet data in a responsive table format.

      Columns:
      - Name: Official IAU planet designation (e.g., "TOI-1234 b")
      - Host Star: Name of the parent star
      - Type: Stellar spectral type (G/K/M/F)
      - Distance: In light years (converted from parsecs)
      - Radius: Planet radius in Earth radii (R⊕)
      - Habitable Zone: Color-coded classification
      - Year: Discovery year

      Features:
      - Null-safe rendering (shows "N/A" for missing data)
      - Hover effects for better UX
      - Responsive with horizontal scroll on small screens
    -->
    <div
      class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 overflow-x-auto"
    >
      <h3 class="text-white text-lg font-semibold mb-4">
        Discovered Exoplanets
      </h3>
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
            <!-- Planet Name -->
            <td class="py-3 px-4 text-white">{{ planet.pl_name }}</td>

            <!-- Host Star Name -->
            <td class="py-3 px-4 text-purple-200">{{ planet.hostname }}</td>

            <!-- Stellar Spectral Type (e.g., G2V, K5, M3) -->
            <td class="py-3 px-4 text-purple-200">
              {{ planet.st_spectype || "N/A" }}
            </td>

            <!-- Distance in Light Years
                 Conversion: parsecs × 3.262 = light years
                 Null-safe: Checks for null/undefined before calculation -->
            <td class="py-3 px-4 text-purple-200">
              {{
                planet.sy_dist !== null && planet.sy_dist !== undefined
                  ? (planet.sy_dist * 3.262).toFixed(2)
                  : "N/A"
              }}
            </td>

            <!-- Planet Radius in Earth Radii (R⊕)
                 1.0 = Earth-sized
                 11.2 = Jupiter-sized (approximately)
                 Null-safe: Shows "N/A" if data unavailable -->
            <td class="py-3 px-4 text-purple-200">
              {{
                planet.pl_rade !== null && planet.pl_rade !== undefined
                  ? planet.pl_rade.toFixed(2)
                  : "N/A"
              }}
            </td>

            <!-- Habitable Zone Status Badge
                 Color-coded: Green (habitable), Red (too hot), Blue (too cold) -->
            <td class="py-3 px-4">
              <span :class="getHabitableZoneClass(planet)">
                {{ getHabitableZoneLabel(planet) }}
              </span>
            </td>

            <!-- Discovery Year -->
            <td class="py-3 px-4 text-purple-200">{{ planet.disc_year }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State Message -->
      <!-- Shows when no planets match the current filter criteria -->
      <div
        v-if="filteredExoplanets.length === 0"
        class="text-center py-8 text-purple-300"
      >
        No exoplanets match your filters
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ExoplanetOverview Component
 *
 * This component displays a comprehensive overview of TESS-discovered exoplanets.
 * Features include:
 * - Summary statistics cards (total count, habitable zone count, nearest distance, avg discovery year)
 * - Interactive filters (stellar type, distance range)
 * - Detailed data table with sortable columns
 * - Habitable zone classification with color-coded badges
 *
 * Data Source: NASA Exoplanet Archive via our useExoplanets composable
 */

import { ref, computed, watch, onMounted } from "vue";
import { Filter } from "lucide-vue-next";
import { useExoplanets } from "@/composables/useExoplanets";
import type { Exoplanet } from "@/types/exoplanet";

// ============================================================================
// COMPOSABLES & DATA
// ============================================================================

/**
 * Access exoplanet data and utility functions from the composable.
 * This composable manages the global state of exoplanet data and provides
 * helper functions for habitable zone calculations.
 */
const { exoplanets, stats, fetchExoplanets, isInHabitableZone } =
  useExoplanets();

// ============================================================================
// FILTER STATE
// ============================================================================

/**
 * Selected stellar type filter
 * Options: 'all' or specific spectral type (e.g., 'G', 'K', 'M')
 * Spectral types indicate star properties:
 * - G: Sun-like stars (yellow, ~5,000-6,000K)
 * - K: Orange dwarfs (~3,500-5,000K)
 * - M: Red dwarfs (coolest, <3,500K)
 */
const selectedStellarType = ref<string>("all");

/**
 * Minimum distance filter in light years
 * Default: 0 (show all planets regardless of how close)
 */
const minDistance = ref<number>(0);

/**
 * Maximum distance filter in light years
 * Default: 5000 (effectively shows all TESS discoveries)
 * Note: Most TESS discoveries are within ~300 light years
 */
const maxDistance = ref<number>(5000);

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

/**
 * Fetch exoplanet data on component mount if not already loaded.
 * This ensures data is available before rendering the table.
 * Only fetches if the data hasn't been loaded yet (avoids unnecessary API calls).
 */
onMounted(async () => {
  if (exoplanets.value.length === 0) {
    await fetchExoplanets();
  }
});

// ============================================================================
// STELLAR TYPES
// ============================================================================

/**
 * Available stellar types for filtering
 * Populated reactively from the exoplanets dataset via watch()
 * Contains unique spectral type values (e.g., ['G', 'K', 'M', 'F'])
 */
const stellarTypes = ref<string[]>([]);

/**
 * Watch for changes to exoplanets data and populate stellar types filter
 *
 * Process:
 * 1. Extract all st_spectype values from planets
 * 2. Filter out null/undefined values
 * 3. Create a Set to get unique values
 * 4. Convert to sorted array for consistent ordering
 *
 * immediate: true ensures this runs when the component is first created,
 * catching cases where data was already loaded before mount
 */
watch(
  exoplanets,
  (planets) => {
    if (planets.length > 0) {
      // Extract unique stellar types using Set
      const types = new Set(planets.map((p) => p.st_spectype).filter(Boolean));
      // Convert to sorted array for consistent UI ordering
      stellarTypes.value = Array.from(types).sort();
    }
  },
  { immediate: true }
);

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

/**
 * Filter exoplanets based on user-selected criteria
 *
 * Filters applied:
 * 1. Stellar Type: Match exact spectral type or show all
 * 2. Distance Range: Planet must be within min/max light year range
 *
 * Distance Conversion:
 * - NASA provides distance in parsecs (sy_dist)
 * - We convert to light years: 1 parsec = 3.262 light years
 * - Uses nullish coalescing (??) to handle missing data (defaults to 0)
 *
 * Performance: Runs on every reactive change to filters or exoplanets array
 */
const filteredExoplanets = computed(() => {
  return exoplanets.value.filter((planet) => {
    // Convert parsecs to light years (1 parsec = 3.262 light years)
    // Use nullish coalescing to handle null/undefined values
    const distanceLY = (planet.sy_dist ?? 0) * 3.262;

    // Check if planet matches selected stellar type (or 'all' is selected)
    const typeMatch =
      selectedStellarType.value === "all" ||
      planet.st_spectype === selectedStellarType.value;

    // Check if planet distance is within selected range
    const distanceMatch =
      distanceLY >= minDistance.value && distanceLY <= maxDistance.value;

    // Planet must match BOTH filters to be included
    return typeMatch && distanceMatch;
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get Tailwind CSS classes for habitable zone badge
 *
 * Uses a map-based approach for cleaner, more maintainable code.
 * Each zone gets a distinct color scheme:
 * - Habitable: Green (encouraging, Earth-like conditions)
 * - Too Hot: Red (warning, too close to star)
 * - Too Cold: Blue (cold, too far from star)
 *
 * @param planet - Exoplanet object with stellar and orbital properties
 * @returns Tailwind CSS class string for the badge
 */
function getHabitableZoneClass(planet: Exoplanet): string {
  const zone = isInHabitableZone(planet);
  const baseClasses = "px-2 py-1 rounded text-xs";

  // Map habitable zones to their respective color schemes
  const zoneClassMap: Record<string, string> = {
    habitable: `${baseClasses} bg-green-500/20 text-green-300`,
    "too-hot": `${baseClasses} bg-red-500/20 text-red-300`,
    "too-cold": `${baseClasses} bg-blue-500/20 text-blue-300`,
  };

  // Return mapped class or default to blue (cold) if zone is unknown
  return zoneClassMap[zone] || `${baseClasses} bg-blue-500/20 text-blue-300`;
}

/**
 * Get human-readable label for habitable zone status
 *
 * Maps scientific zone classifications to user-friendly labels:
 * - 'habitable': Life as we know it could theoretically exist (liquid water possible)
 * - 'too-hot': Too close to star, water would evaporate (Venus-like)
 * - 'too-cold': Too far from star, water would freeze (Mars-like)
 *
 * @param planet - Exoplanet object with stellar and orbital properties
 * @returns Human-readable zone label
 */
function getHabitableZoneLabel(planet: Exoplanet): string {
  const zone = isInHabitableZone(planet);

  // Map zones to user-friendly labels
  const zoneLabels: Record<string, string> = {
    habitable: "✓ Habitable",
    "too-hot": "Too Hot",
    "too-cold": "Too Cold",
  };

  // Return mapped label or 'Unknown' if zone classification fails
  return zoneLabels[zone] || "Unknown";
}
</script>
