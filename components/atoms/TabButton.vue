<!--
  TabButton Component (Atom)

  A navigation tab button with active state styling and icon slot.

  Purpose:
  Used in the main navigation bar to switch between different views
  (Overview, 3D Star Map, Mission Planner, Habitable Zones).

  Features:
  - Active state with purple background and bottom border
  - Inactive state with hover effects
  - Icon slot for visual enhancement
  - Smooth transitions between states

  Visual States:
  Active:   [🗺️ Overview]  ← Purple background, white text, bottom border
  Inactive: [🌍 3D Map]     ← Purple text, transparent background
  Hover:    [🚀 Mission]    ← Dark purple background, white text

  Examples:
  <AtomsTabButton
    :active="activeTab === 'overview'"
    @click="activeTab = 'overview'"
    label="Overview"
  >
    <Map class="w-4 h-4" />
  </AtomsTabButton>
-->
<template>
  <!--
    Button: Tab navigation element with dynamic styling
    - Click emits 'click' event to parent
    - Classes applied conditionally based on active state
    - Transitions smoothly between states (transition-all)
  -->
  <button
    @click="$emit('click')"
    :class="[
      'flex items-center gap-2 px-6 py-3 transition-all',
      active
        ? 'bg-purple-600 text-white border-b-2 border-purple-400'
        : 'text-purple-300 hover:bg-purple-900/30 hover:text-white',
    ]"
  >
    <!--
      Icon Slot: Parent provides icon component
      Examples: <Map />, <Globe />, <Rocket />, <Leaf />
      Icons should be 16x16 (w-4 h-4) for consistency
    -->
    <slot />

    <!-- Label: Tab text (e.g., "Overview", "3D Star Map") -->
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
/**
 * TabButton Component Props
 *
 * A navigation tab button with icon support and active state styling.
 *
 * @property {boolean} active - Whether this tab is currently selected
 *                             true: Shows purple background with bottom border
 *                             false: Shows muted text with hover effects
 *
 * @property {string} label - The tab text label
 *                           Examples: "Overview", "3D Star Map", "Mission Planner"
 *                           Keep concise (1-3 words) for best visual balance
 *
 * @emits {void} click - Emitted when the tab button is clicked
 *                      Parent should update activeTab state in response
 *
 * Active State Styling:
 * - Background: Solid purple-600
 * - Text: White for maximum contrast
 * - Border: 2px purple-400 bottom border for visual indicator
 * - Purpose: Clearly shows which view is active
 *
 * Inactive State Styling:
 * - Background: Transparent (shows parent's dark background)
 * - Text: Muted purple-300
 * - Hover: Dark purple-900/30 background + white text
 * - Purpose: Subtle but discoverable
 *
 * Transition:
 * - Uses transition-all for smooth state changes
 * - Applies to background, text color, and border
 * - Default Tailwind duration (150ms) for responsive feel
 *
 * Icon Slot Pattern:
 * Parent provides icon via default slot. This allows flexibility
 * in icon library choice while maintaining consistent sizing.
 *
 * Usage in pages/index.vue:
 * ```vue
 * <nav class="flex gap-1">
 *   <AtomsTabButton
 *     :active="activeTab === 'overview'"
 *     @click="activeTab = 'overview'"
 *     label="Overview"
 *   >
 *     <Map class="w-4 h-4" />
 *   </AtomsTabButton>
 *
 *   <AtomsTabButton
 *     :active="activeTab === '3d'"
 *     @click="activeTab = '3d'"
 *     label="3D Star Map"
 *   >
 *     <Globe class="w-4 h-4" />
 *   </AtomsTabButton>
 * </nav>
 * ```
 */
defineProps<{
  active: boolean;
  label: string;
}>();

defineEmits<{
  click: [];
}>();
</script>
