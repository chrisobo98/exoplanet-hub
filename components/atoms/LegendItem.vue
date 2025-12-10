<!--
  LegendItem Component (Atom)

  A legend entry component with a color indicator and two-line label.

  Purpose:
  Displays a color-coded legend item for data visualizations, particularly
  the 3D star map where planets are color-coded by habitable zone classification.

  Usage:
  Used in StarMap3D to explain the color coding of planets:
  - Green: Planets in habitable zone (liquid water possible)
  - Orange: Planets too hot (too close to star)
  - Blue: Planets too cold (too far from star)

  Visual Structure:
  ┌──────────────────────────┐
  │ ●  Label               │  ← White, bold
  │    Description         │  ← Purple, smaller
  └──────────────────────────┘
  ↑
  Color indicator (8x8 circle)

  Examples:
  <AtomsLegendItem
    color="rgb(34, 197, 94)"
    label="Habitable Zone"
    description="Potential for liquid water"
  />
-->
<template>
  <!-- Container: Horizontal flex layout with color + text -->
  <div class="flex items-center gap-3">
    <!--
      Color Indicator: Round circle showing the category color
      - 8x8 pixel circle (w-8 h-8)
      - Dynamic background color via inline style
      - Represents planet color in 3D visualization
    -->
    <div class="w-8 h-8 rounded-full" :style="{ backgroundColor: color }" />

    <!-- Text Content: Two-line label and description -->
    <div>
      <!-- Primary Label: Bold white text for category name -->
      <div class="text-white font-semibold">{{ label }}</div>

      <!-- Description: Smaller purple text explaining the category -->
      <div class="text-purple-300 text-sm">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LegendItem Component Props
 *
 * Displays a color-coded legend entry for data visualization.
 *
 * @property {string} color - The RGB or hex color for the indicator circle
 *                           Must match the color used in the visualization
 *                           Examples: "rgb(34, 197, 94)", "#22c55e", "hsl(142, 71%, 45%)"
 *
 * @property {string} label - The category name (e.g., "Habitable Zone", "Too Hot")
 *                           Should be concise (1-3 words)
 *
 * @property {string} description - Explanation of what the category means
 *                                 Examples: "Potential for liquid water", "Too close to star"
 *
 * Design Notes:
 * - Color indicator is always 8x8 pixels to maintain visual consistency
 * - Uses inline styles for color to support dynamic RGB values
 * - Two-line layout: bold label + muted description
 *
 * Usage in StarMap3D:
 * ```vue
 * <AtomsLegendItem
 *   color="rgb(34, 197, 94)"  // Green from D3 scale
 *   label="Habitable Zone"
 *   description="Potential for liquid water"
 * />
 * ```
 */
defineProps<{
  color: string;
  label: string;
  description: string;
}>();
</script>
