<!--
  DetailItem Component (Atom)

  A minimal key-value display component for showing labeled data.

  Usage:
  Used throughout the app to display exoplanet properties in a consistent format.
  Part of the Atomic Design pattern as a reusable UI primitive.

  Common Use Cases:
  - Planet properties (name, radius, mass, temperature)
  - Stellar properties (type, temperature, radius)
  - System properties (distance, orbital period)

  Visual Structure:
  ┌─────────────┐
  │ Label       │  ← Purple, small text
  │ Value       │  ← White, bold text
  └─────────────┘

  Examples:
  <AtomsDetailItem label="Distance" value="41.2 ly" />
  <AtomsDetailItem label="Radius" value="1.4 R⊕" />
  <AtomsDetailItem label="Host Star" value="TOI-700" />
-->
<template>
  <!-- Container: Simple vertical stack -->
  <div>
    <!-- Label: Smaller, muted purple text for property name -->
    <div class="text-purple-300 text-sm">{{ label }}</div>

    <!-- Value: Larger, bold white text for property value -->
    <div class="text-white font-semibold">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
/**
 * DetailItem Component Props
 *
 * Simple key-value pair display for exoplanet data.
 *
 * @property {string} label - The property name (e.g., "Distance", "Radius")
 * @property {string} value - The formatted property value (e.g., "41.2 ly", "1.4 R⊕")
 *
 * Design Notes:
 * - Intentionally simple: No styling props to maintain consistency
 * - Always uses same color scheme (purple label, white value)
 * - Parent controls layout (grid, flex, etc.)
 *
 * Usage in Parent Components:
 * - MissionCalculator: Planet/star details grid
 * - HabitableZoneAnalysis: System property displays
 */
defineProps<{
  label: string;
  value: string;
}>();
</script>
