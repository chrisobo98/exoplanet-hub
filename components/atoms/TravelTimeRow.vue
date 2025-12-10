<!--
  TravelTimeRow Component (Atom)

  Displays travel time calculations for different propulsion speeds.

  Purpose:
  Used in MissionCalculator to show how long it would take to reach
  a selected exoplanet at different fractions of light speed.

  Scientific Context:
  - c (speed of light): 299,792,458 m/s or ~1 light year per year
  - 0.1c: Nuclear fusion propulsion (theoretical)
  - 0.5c: Advanced propulsion systems (far future)
  - 0.9c: Near-light speed (requires breakthrough physics)

  Calculation:
  Travel Time = Distance (light years) / Speed (fraction of c)
  Example: 41 light years at 0.1c = 410 years

  Formatting:
  - < 100 years: "41.5 years" (decimal precision)
  - 100-999,999 years: "410.00k years" (thousands)
  - ≥ 1,000,000 years: "4.10M years" (millions)

  Visual Layout:
  ┌────────────────────────────┐
  │ Description         0.1c   │  ← Top row: Label + speed
  │ 410.0 years              │  ← Large travel time
  └────────────────────────────┘
     ↑ Bottom border separator

  Examples:
  <AtomsTravelTimeRow
    description="Fusion drive"
    speed="0.1"
    :distance="41.2"
  />
  → Displays: "412.0 years"

  <AtomsTravelTimeRow
    description="Near-light speed"
    speed="0.9"
    :distance="1000"
  />
  → Displays: "1.11k years"
-->
<template>
  <!-- Container: Vertical stack with bottom border separator -->
  <div class="border-b border-purple-500/10 pb-3">
    <!--
      Top Row: Propulsion description and speed indicator
      - Description on left (e.g., "Fusion drive")
      - Speed on right in fractions of c (e.g., "0.1c")
    -->
    <div class="flex justify-between items-baseline mb-1">
      <!-- Propulsion System Description -->
      <span class="text-purple-200">{{ description }}</span>

      <!-- Speed in Fractions of Light Speed (c) -->
      <span class="text-white">{{ speed }}c</span>
    </div>

    <!--
      Calculated Travel Time: Large, prominent display
      - Automatically formatted (years, k years, M years)
      - 2xl font size for emphasis
    -->
    <div class="text-2xl text-purple-100">{{ travelTime }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * TravelTimeRow Component Props
 *
 * Calculates and displays interstellar travel time for a given propulsion speed.
 *
 * @property {string} description - Human-readable propulsion system name
 *                                 Examples: "Fusion drive", "Advanced propulsion", "Near-light speed"
 *                                 Should be concise (2-4 words)
 *
 * @property {string} speed - Speed as a fraction of light speed (c)
 *                           Format: String number between 0 and 1
 *                           Examples: "0.1" (10% light speed), "0.5" (50%), "0.9" (90%)
 *                           Note: String type allows flexible display formatting
 *
 * @property {number} distance - Distance to target in light years
 *                              Examples: 41.2 (TOI-700), 1402.1 (TRAPPIST-1)
 *                              Must be positive number
 *
 * Physics Context:
 * - Speed of light (c): 299,792,458 m/s
 * - At 1c, traveling 1 light year takes 1 year (by definition)
 * - At 0.1c, traveling 1 light year takes 10 years
 * - Real spacecraft (Voyager 1): ~0.000057c (would take 17,000+ years per light year)
 *
 * Propulsion Systems Reference:
 * - 0.1c: Theoretical nuclear fusion drives (Project Daedalus, Breakthrough Starshot)
 * - 0.5c: Far future propulsion (antimatter engines, fusion ramjets)
 * - 0.9c: Requires breakthrough physics (warp drives, theoretical only)
 */
const props = defineProps<{
  description: string;
  speed: string;
  distance: number;
}>();

/**
 * Calculate and format travel time
 *
 * Computes how long it would take to travel the given distance at the
 * specified fraction of light speed, with smart formatting for readability.
 *
 * Formula:
 * Time (years) = Distance (light years) / Speed (fraction of c)
 *
 * Example Calculations:
 * - TOI-700 (41.2 ly) at 0.1c: 41.2 / 0.1 = 412 years
 * - Proxima Centauri (4.2 ly) at 0.5c: 4.2 / 0.5 = 8.4 years
 * - Andromeda (2.5M ly) at 0.9c: 2,500,000 / 0.9 = 2.78M years
 *
 * Formatting Rules:
 * 1. < 100 years: Show to 1 decimal place
 *    Example: "41.5 years"
 *    Rationale: Human timescale, precision matters
 *
 * 2. 100 - 999,999 years: Convert to thousands (k)
 *    Example: "412.00k years" (412,000 years)
 *    Rationale: Multi-generational missions, approximate scale
 *
 * 3. ≥ 1,000,000 years: Convert to millions (M)
 *    Example: "2.78M years"
 *    Rationale: Geological/astronomical timescale, order of magnitude
 *
 * Edge Cases:
 * - Speed = 0: Would result in Infinity, handle in parent validation
 * - Distance = 0: Would result in 0 years (instant arrival)
 * - Very large distances: Millions of years are common for distant galaxies
 *
 * @returns {string} Formatted travel time with appropriate unit suffix
 */
const travelTime = computed(() => {
  // Parse speed string to numeric value (e.g., "0.1" → 0.1)
  const speedValue = parseFloat(props.speed);

  // Calculate travel time: distance / speed
  // Since distance is in light years and speed is fraction of c,
  // result is automatically in years
  const years = props.distance / speedValue;

  // Format based on magnitude for readability
  if (years < 100) {
    // Human timescale: Show precise years to 1 decimal
    return `${years.toFixed(1)} years`;
  } else if (years < 1000000) {
    // Thousands of years: Convert to "k" notation
    // Show 2 decimals for better precision (e.g., "1.23k years")
    return `${(years / 1000).toFixed(2)}k years`;
  } else {
    // Millions of years: Convert to "M" notation
    // Show 2 decimals (e.g., "2.78M years")
    return `${(years / 1000000).toFixed(2)}M years`;
  }
});
</script>
