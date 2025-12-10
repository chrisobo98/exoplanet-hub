<!--
  StatCard Component (Atom)

  A card component for displaying key statistics with optional highlighting.

  Purpose:
  Displays important metrics prominently in a card format. Used in the
  ExoplanetOverview to show aggregate statistics about the exoplanet dataset.

  Visual Variants:
  1. Normal: Subtle glass-morphism effect with purple border
  2. Highlight: Vibrant purple gradient to draw attention to key metrics

  Layout:
  ┌─────────────────────┐
  │ Label            │  ← Small purple text
  │                     │
  │ 1,234            │  ← Large bold white number
  └─────────────────────┘

  Examples:
  <AtomsStatCard label="Total Exoplanets" :value="437" />
  <AtomsStatCard label="Habitable Candidates" :value="12" highlight />
  <AtomsStatCard label="Avg Discovery Year" :value="2020" />

  Highlighting Strategy:
  Use highlight=true for the most important/interesting statistic
  to create visual hierarchy in stat grids.
-->
<template>
  <!--
    Card Container: Dynamic styling based on highlight prop
    - Normal: Translucent with backdrop blur (glass-morphism)
    - Highlight: Purple gradient for emphasis
  -->
  <div :class="cardClasses">
    <!-- Label: Small text describing the statistic -->
    <div class="text-purple-200 text-sm mb-2">{{ label }}</div>

    <!-- Value: Large, bold number or text value -->
    <div class="text-white text-2xl font-bold">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * StatCard Component Props
 *
 * Displays a labeled statistic in a card format with optional highlighting.
 *
 * @property {string} label - The statistic name/description
 *                           Examples: "Total Exoplanets", "Habitable Candidates"
 *                           Keep to 1-3 words for best visual balance
 *
 * @property {string | number} value - The statistic value to display
 *                                    Can be a number (437) or formatted string ("41.2 ly")
 *                                    Large numbers are displayed prominently (2xl font)
 *
 * @property {boolean} [highlight] - Optional flag to use vibrant gradient styling
 *                                  Default: false (normal subtle styling)
 *                                  Use for the most important metric in a stat grid
 *
 * Design System:
 * - Normal cards: Glass-morphism effect (white/5 opacity + backdrop blur)
 * - Highlighted cards: Purple gradient (600→800) to stand out
 * - Consistent padding (p-6) and border radius (rounded-lg)
 * - Border varies: highlight uses purple-400, normal uses purple-500/20
 *
 * Usage in ExoplanetOverview:
 * ```vue
 * <div class="grid grid-cols-4 gap-4">
 *   <AtomsStatCard label="Total" :value="stats.total" />
 *   <AtomsStatCard label="Habitable" :value="stats.habitable" highlight />
 *   <AtomsStatCard label="Nearest" :value="`${stats.nearestDistance} ly`" />
 *   <AtomsStatCard label="Avg Year" :value="stats.avgDiscoveryYear" />
 * </div>
 * ```
 */
const props = defineProps<{
  label: string;
  value: string | number;
  highlight?: boolean;
}>();

/**
 * Computed card styling classes
 *
 * Dynamically applies one of two styling variants based on highlight prop.
 *
 * Highlight Variant:
 * - Vibrant purple gradient background (from-purple-600 to-purple-800)
 * - Bright border (border-purple-400)
 * - Use for 1 card in a grid to create focal point
 *
 * Normal Variant:
 * - Subtle translucent background (bg-white/5)
 * - Backdrop blur for glass-morphism effect
 * - Muted border (border-purple-500/20)
 * - Use for supporting statistics
 *
 * Both variants share:
 * - Same padding (p-6)
 * - Same border radius (rounded-lg)
 * - Same card dimensions (sized by grid parent)
 *
 * @returns {string} Tailwind CSS classes for the card container
 */
const cardClasses = computed(() => {
  if (props.highlight) {
    return "p-6 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-400";
  }
  return "p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-500/20";
});
</script>
