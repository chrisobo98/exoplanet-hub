<!--
  MissionCalculator Component (Organism)

  Interactive tool for planning hypothetical interstellar missions to exoplanets.

  Purpose:
  Allows users to explore the challenges of interstellar travel by:
  - Selecting a target exoplanet from TESS discoveries
  - Viewing detailed planetary and stellar properties
  - Calculating travel times at various propulsion speeds
  - Assessing mission feasibility based on current/future technology

  Features:
  - Dropdown selection of all TESS-discovered exoplanets
  - Real-time distance conversion (parsecs → light years)
  - Travel time calculations for 3 propulsion scenarios:
    * 0.1c: Theoretical nuclear fusion drives
    * 0.5c: Advanced far-future propulsion
    * 0.9c: Near-light speed (breakthrough physics required)
  - Conventional rocket comparison (~50 km/s baseline)
  - Planet/star detail grid with scientific units

  Scientific Context:
  - Speed of light (c): 299,792,458 m/s
  - 1 light year: 9.461 trillion km
  - Conventional rockets: ~0.00017c (Voyager 1 speed)
  - Fusion drives (theoretical): ~0.1c (Project Daedalus concept)
  - No spacecraft has exceeded 0.0002c to date

  Educational Value:
  - Demonstrates scale of interstellar distances
  - Highlights need for breakthrough propulsion
  - Compares theoretical vs. current technology
  - Shows why multi-generational ships may be necessary

  Data Sources:
  - Exoplanet data: NASA Exoplanet Archive
  - Distance conversions: 1 parsec = 3.262 light years
  - Propulsion speeds: Theoretical physics research
  - Stellar types: Spectral classification system

  Examples:
  <OrganismsMissionCalculator />
-->
<template>
  <div class="space-y-6">
    <!--
      Planet Selection Dropdown
      - Shows all TESS-discovered exoplanets
      - Format: "Planet Name (Host Star) - Distance in ly"
      - Updates detail sections when selection changes
    -->
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

    <!--
      Planet Details Card
      - Only shown when a planet is selected (v-if)
      - Highlighted card style (purple gradient)
      - 4-column grid layout on desktop, 2-column on mobile
      - Shows 8 key properties of the target system

      Data Displayed:
      1. Planet Name (pl_name)
      2. Host Star (hostname)
      3. Distance in light years (sy_dist × 3.262)
      4. Stellar Type (st_spectype) - spectral classification
      5. Planet Radius in Earth radii (pl_rade)
      6. Planet Mass in Jupiter masses (pl_massj)
      7. Orbital Period in days (pl_orbper)
      8. Equilibrium Temperature in Kelvin (pl_eqt)

      Scientific Units:
      - R⊕: Earth radius (6,371 km)
      - MJ: Jupiter mass (1.898 × 10²⁷ kg)
      - ly: Light year (9.461 trillion km)
      - K: Kelvin (absolute temperature)
    -->
    <div v-if="selectedPlanet" class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6">
      <h3 class="text-white text-lg font-semibold mb-4">Target System Details</h3>

      <!-- Property Grid: Responsive 2/4 column layout -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Planet Name -->
        <AtomsDetailItem label="Planet" :value="selectedPlanet.pl_name" />

        <!-- Host Star Name -->
        <AtomsDetailItem label="Host Star" :value="selectedPlanet.hostname" />

        <!--
          Distance in Light Years
          - Converted from parsecs (sy_dist × 3.262)
          - Computed property for reactivity
          - Displayed to 1 decimal place
        -->
        <AtomsDetailItem label="Distance" :value="`${distance.toFixed(1)} ly`" />

        <!--
          Stellar Spectral Type
          - Classification: O, B, A, F, G, K, M (hot → cool)
          - Example: "G2V" = Sun-like star
          - Falls back to "Unknown" if missing
        -->
        <AtomsDetailItem label="Stellar Type" :value="selectedPlanet.st_spectype || 'Unknown'" />

        <!--
          Planet Radius
          - In Earth radii (R⊕)
          - Earth = 1.0 R⊕ by definition
          - Super-Earths: 1.25-2 R⊕
          - Mini-Neptunes: 2-4 R⊕
          - N/A if data missing
        -->
        <AtomsDetailItem label="Radius" :value="`${selectedPlanet.pl_rade?.toFixed(2) || 'N/A'} R⊕`" />

        <!--
          Planet Mass
          - In Jupiter masses (MJ)
          - Jupiter = 1.0 MJ = 318 Earth masses
          - Terrestrial planets: < 0.01 MJ
          - Gas giants: 0.3-13 MJ
          - N/A if data missing
        -->
        <AtomsDetailItem label="Mass" :value="`${selectedPlanet.pl_massj?.toFixed(3) || 'N/A'} MJ`" />

        <!--
          Orbital Period
          - Time for one complete orbit
          - In Earth days
          - Examples:
            * Earth: 365.25 days
            * Hot Jupiters: < 10 days
            * Distant planets: > 1000 days
          - N/A if data missing
        -->
        <AtomsDetailItem label="Orbital Period" :value="`${selectedPlanet.pl_orbper?.toFixed(1) || 'N/A'} days`" />

        <!--
          Equilibrium Temperature
          - Theoretical surface temp (no atmosphere)
          - In Kelvin (0 K = absolute zero)
          - Reference points:
            * Water freezes: 273 K (0°C)
            * Water boils: 373 K (100°C)
            * Earth average: ~255 K (without greenhouse effect)
          - N/A if data missing
        -->
        <AtomsDetailItem label="Eq. Temp" :value="`${selectedPlanet.pl_eqt || 'N/A'} K`" />
      </div>
    </div>

    <!--
      Travel Time Calculator Card
      - Shows journey duration at different propulsion speeds
      - Uses AtomsTravelTimeRow components for each scenario
      - Distance computed from selected planet

      Propulsion Scenarios:
      1. 0.1c: Theoretical nuclear fusion (Project Daedalus)
      2. 0.5c: Advanced future propulsion (antimatter?)
      3. 0.9c: Near-light speed (breakthrough physics required)

      Scientific Context:
      - No current spacecraft exceeds 0.0002c
      - 0.1c would require revolutionary technology
      - 0.5c and 0.9c are purely theoretical
    -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <!-- Section Header with Clock Icon -->
      <div class="flex items-center gap-2 mb-4">
        <Clock class="w-5 h-5 text-purple-400" />
        <h3 class="text-white text-lg font-semibold">Travel Time</h3>
      </div>

      <!-- Travel Time Scenarios (vertical stack) -->
      <div class="space-y-4">
        <!--
          Fusion Drive Scenario: 0.1c (10% light speed)
          - Based on Project Daedalus concept
          - Nuclear fusion propulsion
          - Most "realistic" of the three options
          - Still requires breakthrough engineering
        -->
        <AtomsTravelTimeRow description="Fusion drive" speed="0.1" :distance="distance" />

        <!--
          Advanced Propulsion: 0.5c (50% light speed)
          - Far future technology
          - Possibly antimatter or fusion ramjet
          - Decades/centuries of R&D required
          - Significant relativistic effects
        -->
        <AtomsTravelTimeRow description="Advanced propulsion" speed="0.5" :distance="distance" />

        <!--
          Near-Light Speed: 0.9c (90% light speed)
          - Requires breakthrough physics
          - Potential candidates: warp drive, wormholes
          - Currently beyond known science
          - Extreme time dilation effects
        -->
        <AtomsTravelTimeRow description="Near-light speed" speed="0.9" :distance="distance" />
      </div>
    </div>

    <!--
      Mission Feasibility Assessment Card
      - Educational reality check
      - Compares theoretical speeds with current technology
      - Highlights the enormous challenge of interstellar travel

      Conventional Rocket Speed:
      - Voyager 1: ~17 km/s = 0.0000567c
      - Approximated as 50 km/s = 0.00017c for round calculation
      - Shows why breakthrough propulsion is essential
    -->
    <div class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6">
      <div class="flex items-center gap-2 mb-4">
        <Rocket class="w-5 h-5 text-purple-400" />
        <h3 class="text-white text-lg font-semibold">Mission Feasibility Assessment</h3>
      </div>
      <!-- Educational Context: Reality of Current Technology -->
      <div class="space-y-3 text-purple-200 text-sm">
        <!--
          Conventional Rocket Comparison
          - Uses Voyager 1 speed as reference (~50 km/s)
          - Converts to fraction of c: 50 km/s ÷ 299,792 km/s ≈ 0.00017c
          - Calculates travel time: distance / speed
          - Shows result in years with no decimals (huge number)

          Example Calculation:
          - TOI-700 (41.2 ly) at 0.00017c:
            41.2 / 0.00017 ≈ 242,353 years
          - Multi-generational ship spanning ~10,000 generations!

          Purpose: Emphasize need for breakthrough propulsion
        -->
        <p>
          At conventional rocket speeds (~50 km/s or 0.00017c), reaching {{ selectedPlanet?.pl_name || 'this target' }}
          would take approximately <strong class="text-white">{{ (distance / 0.00017).toFixed(0) }} years</strong>.
        </p>

        <!--
          Call to Action: Technological Advancement
          - Highlights required breakthroughs
          - Lists candidate technologies
          - Educational message about scale of challenge
        -->
        <p>
          Revolutionary propulsion systems like nuclear fusion, antimatter drives, or breakthrough physics
          would be required for realistic interstellar missions.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MissionCalculator Component Script
 *
 * Manages state and logic for interstellar mission planning interface.
 *
 * Key Functionality:
 * - Planet selection from dropdown
 * - Distance conversion (parsecs → light years)
 * - Travel time computations (via TravelTimeRow components)
 * - Reactive updates when selection changes
 *
 * Data Flow:
 * 1. Fetch exoplanet data on mount
 * 2. Auto-select first planet
 * 3. User selects different planet → selectedPlanetName updates
 * 4. selectedPlanet computed → finds matching planet object
 * 5. distance computed → converts parsecs to light years
 * 6. UI reactively updates with new planet data
 *
 * Design Decisions:
 * - Simple state management (no Pinia needed for single component)
 * - Computed properties for derived values
 * - Leverages useExoplanets composable for data
 */
import { ref, computed, onMounted } from 'vue';
import { Clock, Rocket } from 'lucide-vue-next';
import { useExoplanets } from '@/composables/useExoplanets';

// ============================================================================
// COMPOSABLE & STATE
// ============================================================================

/**
 * Exoplanet data from global composable
 * - exoplanets: Array of all TESS-discovered exoplanets
 * - fetchExoplanets: Function to load data from API
 */
const { exoplanets, fetchExoplanets } = useExoplanets();

/**
 * Selected planet name (user's dropdown choice)
 *
 * Bound to <select> via v-model
 * Changes trigger reactive updates to computed properties
 *
 * Type: string (planet name identifier)
 * Example: "TOI-700 d"
 */
const selectedPlanetName = ref<string>('');

// ============================================================================
// LIFECYCLE
// ============================================================================

/**
 * Component initialization
 *
 * Process:
 * 1. Fetch exoplanet data (if not already loaded via composable)
 * 2. Auto-select first planet for immediate display
 * 3. User can then change selection via dropdown
 *
 * Why auto-select?
 * - Avoids empty state on first load
 * - Provides immediate example to explore
 * - Better UX than forcing user to make initial selection
 */
onMounted(async () => {
  // Load data (composable may cache, so fast on subsequent calls)
  await fetchExoplanets();

  // Auto-select first planet if data available
  if (exoplanets.value.length > 0) {
    selectedPlanetName.value = exoplanets.value[0].pl_name;
  }
});

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

/**
 * Selected planet object
 *
 * Finds the full planet object matching the selected name.
 *
 * Returns:
 * - Full Exoplanet object if found
 * - undefined if no match (shouldn't happen with valid dropdown)
 *
 * Reactivity:
 * - Re-evaluates when selectedPlanetName changes
 * - Triggers UI updates in Planet Details section
 *
 * Usage in Template:
 * - v-if="selectedPlanet" - Show/hide details card
 * - selectedPlanet.pl_name - Access planet properties
 * - selectedPlanet.st_spectype - Access stellar properties
 *
 * @type {ComputedRef<Exoplanet | undefined>}
 */
const selectedPlanet = computed(() => {
  return exoplanets.value.find(p => p.pl_name === selectedPlanetName.value);
});

/**
 * Distance to selected planet in light years
 *
 * Converts from parsecs (NASA API unit) to light years (user-friendly).
 *
 * Conversion:
 * - 1 parsec = 3.262 light years
 * - Formula: light_years = parsecs × 3.262
 *
 * Example:
 * - TOI-700: 12.6 parsecs × 3.262 = 41.1 light years
 *
 * Edge Cases:
 * - If no planet selected: sy_dist is undefined → default to 0
 * - Result: 0 light years (prevents NaN in calculations)
 *
 * Used By:
 * - AtomsTravelTimeRow components (travel time calculation)
 * - AtomsDetailItem "Distance" display
 * - Mission Feasibility conventional rocket calculation
 *
 * @type {ComputedRef<number>}
 */
const distance = computed(() => {
  return (selectedPlanet.value?.sy_dist || 0) * 3.262; // parsecs to light years
});
</script>
