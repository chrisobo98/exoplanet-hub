# Component Architecture

## Overview

This document provides a comprehensive guide to all components in the Exoplanet Discovery Hub, their relationships, props, events, and usage patterns.

---

## Component Hierarchy

```
app.vue (Root Layout)
└── pages/index.vue (Tab Navigation)
    ├── TabButton.vue (x4 - Navigation tabs)
    └── [Active Tab Component]
        ├── ExoplanetOverview.vue
        │   ├── StatCard.vue (x4 - Statistics)
        │   └── (Table with inline filtering)
        │
        ├── StarMap3D.vue
        │   └── LegendItem.vue (x3 - Color legend)
        │
        ├── MissionCalculator.vue
        │   ├── DetailItem.vue (x4 - Planet details)
        │   └── TravelTimeRow.vue (x4 - Travel times)
        │
        └── HabitableZoneAnalysis.vue
            ├── DetailItem.vue (x3 - Stellar properties)
            └── (Inline planet analysis table)
```

---

## Core Components

### 1. ExoplanetOverview.vue

**Purpose**: Primary data exploration interface with filtering and tabular display of all TESS-discovered exoplanets.

**Location**: `components/ExoplanetOverview.vue`

**Dependencies**:
- `composables/useExoplanets` - Data fetching and calculations
- `components/StatCard.vue` - Summary statistics display
- `lucide-vue-next` - Filter icon

**Props**: None (standalone component)

**Emits**: None

**State**:
```typescript
const selectedStellarType = ref<string>("all");    // Stellar type filter
const minDistance = ref<number>(0);                // Min distance (ly)
const maxDistance = ref<number>(5000);             // Max distance (ly)
const stellarTypes = ref<string[]>([]);            // Available stellar types
```

**Computed**:
```typescript
const filteredExoplanets = computed(() => {...});  // Filtered planet list
```

**Key Features**:
- Summary statistics cards (total, habitable, nearest, avg year)
- Real-time filtering by stellar type and distance range
- Comprehensive data table with 7 columns
- Color-coded habitable zone badges
- Null-safe rendering for missing data
- Responsive design with horizontal scroll on mobile

**Data Displayed**:
| Column | Description | Format |
|--------|-------------|--------|
| Name | Planet designation | String |
| Host Star | Parent star name | String |
| Type | Stellar spectral type | String or "N/A" |
| Distance | Distance in light years | Number (2 decimals) or "N/A" |
| Radius | Planet radius in Earth radii | Number (2 decimals) or "N/A" |
| Habitable Zone | Classification badge | Color-coded badge |
| Year | Discovery year | Number |

**Usage**:
```vue
<ExoplanetOverview />
```

---

### 2. StarMap3D.vue

**Purpose**: Interactive 3D visualization of exoplanet spatial distribution using custom Canvas rendering.

**Location**: `components/StarMap3D.vue`

**Dependencies**:
- `composables/useExoplanets` - Exoplanet data with 3D coordinates
- `components/LegendItem.vue` - Color legend entries

**Props**: None

**Emits**: None

**State**:
```typescript
const rotationX = ref<number>(0);           // X-axis rotation angle
const rotationY = ref<number>(0);           // Y-axis rotation angle
const zoom = ref<number>(10);               // Zoom level (5-30)
const autoRotate = ref<boolean>(false);     // Auto-rotation enabled
const isDragging = ref<boolean>(false);     // Mouse drag state
const lastMousePos = ref({ x: 0, y: 0 });  // Last mouse position
const canvas = ref<HTMLCanvasElement>();    // Canvas element ref
```

**Key Features**:
- Real-time 3D rendering at 60 FPS
- Mouse drag to rotate (horizontal/vertical)
- Zoom controls with +/- buttons
- Auto-rotation toggle
- Color-coded planets by habitable zone status:
  - 🟢 Green: Habitable
  - 🔴 Red: Too hot
  - 🔵 Blue: Too cold
- Perspective projection with depth sorting
- Dynamic star background (400 random stars)
- Glow effects on planets
- Performance optimized with requestAnimationFrame

**3D Rendering Pipeline**:
```typescript
1. Load planet data with x, y, z coordinates (parsecs)
2. Apply rotation matrices for user interaction
3. Apply perspective projection (z-distance affects scale)
4. Sort by depth (furthest first for proper occlusion)
5. Render to canvas with glow effects
```

**Controls**:
- **Drag**: Rotate view
- **Zoom +/-**: Adjust zoom level
- **Auto-Rotate**: Toggle automatic rotation

**Usage**:
```vue
<StarMap3D />
```

---

### 3. MissionCalculator.vue

**Purpose**: Calculate theoretical interstellar mission parameters for travel to selected exoplanets.

**Location**: `components/MissionCalculator.vue`

**Dependencies**:
- `composables/useExoplanets` - Exoplanet data
- `components/DetailItem.vue` - Planet property display
- `components/TravelTimeRow.vue` - Travel time calculations

**Props**: None

**Emits**: None

**State**:
```typescript
const selectedPlanet = ref<string>("");  // Selected planet name
```

**Computed**:
```typescript
const planet = computed(() => {...});  // Currently selected planet object
```

**Key Features**:
- Planet selection dropdown (all TESS discoveries)
- Displays planet properties:
  - Distance (light years)
  - Radius (Earth radii)
  - Host star type
  - Discovery year
- Travel time calculations at different velocities:
  - 0.1c (10% speed of light)
  - 0.5c (50% speed of light)
  - 0.9c (90% speed of light)
  - Conventional rockets (0.00003c)
- Mission feasibility assessment
- Empty state when no planet selected

**Physics**:
```typescript
// Travel time = distance / velocity
const travelTimeYears = distanceLightYears / velocityFractionOfC;

// Example: 100 ly at 0.1c = 1000 years
```

**Usage**:
```vue
<MissionCalculator />
```

---

### 4. HabitableZoneAnalysis.vue

**Purpose**: Analyze planetary systems for habitability based on stellar properties and orbital distances.

**Location**: `components/HabitableZoneAnalysis.vue`

**Dependencies**:
- `composables/useExoplanets` - Habitable zone calculations
- `components/DetailItem.vue` - Stellar property display

**Props**: None

**Emits**: None

**State**:
```typescript
const selectedSystem = ref<string>("");  // Selected star system
```

**Computed**:
```typescript
const systems = computed(() => {...});           // Unique star systems
const systemPlanets = computed(() => {...});     // Planets in selected system
const stellarProperties = computed(() => {...}); // First planet's stellar data
const habitableZone = computed(() => {...});     // HZ boundaries
```

**Key Features**:
- Star system selection dropdown (grouped by host star)
- Displays stellar properties:
  - Effective temperature (Kelvin)
  - Radius (Solar radii)
  - Spectral type
- Habitable zone boundary calculation:
  - Inner boundary (AU)
  - Outer boundary (AU)
  - Stellar luminosity (Solar luminosities)
- Per-planet analysis table:
  - Planet name
  - Orbital distance (AU)
  - Radius (Earth radii)
  - Habitable zone status
- Color-coded status badges
- Empty state when no system selected

**Scientific Calculations**:
```typescript
// Stefan-Boltzmann Law for stellar luminosity
L = (R_star / R_sun)² × (T_star / T_sun)⁴

// Conservative habitable zone boundaries
Inner Boundary = √(L / 1.1)   // Runaway greenhouse limit
Outer Boundary = √(L / 0.53)  // Maximum greenhouse limit
```

**Usage**:
```vue
<HabitableZoneAnalysis />
```

---

## Helper Components

### 5. StatCard.vue

**Purpose**: Display a single statistic with label and optional highlight styling.

**Location**: `components/StatCard.vue`

**Props**:
```typescript
interface Props {
  label: string;           // Statistic label
  value: string | number;  // Statistic value
  highlight?: boolean;     // Apply green highlight (default: false)
}
```

**Emits**: None

**Styling**:
- Default: Purple gradient background
- Highlighted: Green gradient background
- Glassmorphism effect with backdrop blur
- Responsive text sizing

**Usage**:
```vue
<StatCard label="Total Exoplanets" :value="stats.total" />
<StatCard label="In Habitable Zone" :value="stats.habitable" highlight />
```

---

### 6. TabButton.vue

**Purpose**: Navigation tab button with active state styling.

**Location**: `components/TabButton.vue`

**Props**:
```typescript
interface Props {
  label: string;     // Tab label text
  active: boolean;   // Whether tab is currently active
}
```

**Emits**:
```typescript
emit('click'): void  // Fired when tab is clicked
```

**Slots**:
- **default**: Icon slot (typically Lucide icon)

**Styling**:
- Active: Purple gradient background with border
- Inactive: Transparent with hover effect
- Smooth transitions

**Usage**:
```vue
<TabButton
  :active="activeTab === 'overview'"
  @click="activeTab = 'overview'"
  label="Overview"
>
  <Map class="w-4 h-4" />
</TabButton>
```

---

### 7. DetailItem.vue

**Purpose**: Display a labeled key-value pair with consistent formatting.

**Location**: `components/DetailItem.vue`

**Props**:
```typescript
interface Props {
  label: string;  // Property label
  value: string;  // Property value
}
```

**Emits**: None

**Styling**:
- Horizontal layout with label on left, value on right
- Purple label text, white value text
- Consistent spacing and alignment

**Usage**:
```vue
<DetailItem label="Distance" :value="`${distance.toFixed(1)} ly`" />
<DetailItem label="Radius" :value="`${radius.toFixed(2)} R⊕`" />
```

---

### 8. TravelTimeRow.vue

**Purpose**: Display travel time calculation for a specific velocity.

**Location**: `components/TravelTimeRow.vue`

**Props**:
```typescript
interface Props {
  velocity: string;    // Velocity description (e.g., "0.1c")
  years: number;       // Travel time in years
  description: string; // Additional context
}
```

**Emits**: None

**Styling**:
- Grid layout with 3 columns
- Highlighted velocity text
- Conditional styling for extreme values (>1000 years)

**Usage**:
```vue
<TravelTimeRow
  velocity="0.1c"
  :years="1000"
  description="10% speed of light"
/>
```

---

### 9. LegendItem.vue

**Purpose**: Display a single legend entry with colored indicator.

**Location**: `components/LegendItem.vue`

**Props**:
```typescript
interface Props {
  color: string;  // Color class (e.g., "bg-green-500")
  label: string;  // Legend label text
}
```

**Emits**: None

**Styling**:
- Horizontal layout with colored dot + label
- Consistent sizing and spacing

**Usage**:
```vue
<LegendItem color="bg-green-500" label="Habitable Zone" />
<LegendItem color="bg-red-500" label="Too Hot" />
<LegendItem color="bg-blue-500" label="Too Cold" />
```

---

## Composables

### useExoplanets.ts

**Purpose**: Global state management and data fetching for exoplanet data.

**Location**: `composables/useExoplanets.ts`

**Pattern**: Singleton composable (shared state across all component instances)

**Exported State**:
```typescript
const exoplanets = ref<Exoplanet[]>([]);     // All fetched exoplanets
const loading = ref<boolean>(false);         // Loading state
const error = ref<string | null>(null);      // Error message
```

**Exported Computed**:
```typescript
const stats = computed(() => ({
  total: number;              // Total count
  habitable: number;          // Habitable zone count
  nearestDistance: number;    // Nearest planet (ly)
  avgDiscoveryYear: number;   // Average discovery year
}));
```

**Exported Methods**:
```typescript
// Fetch data from NASA Exoplanet Archive
async function fetchExoplanets(): Promise<void>

// Calculate habitable zone boundaries for a star
function calculateHabitableZone(
  stellarRadius: number,
  stellarTemp: number
): HabitableZoneBoundaries

// Determine if planet is in habitable zone
function isInHabitableZone(
  planet: Exoplanet
): HabitableZone
```

**Usage**:
```typescript
import { useExoplanets } from '@/composables/useExoplanets';

const {
  exoplanets,
  loading,
  error,
  stats,
  fetchExoplanets,
  calculateHabitableZone,
  isInHabitableZone
} = useExoplanets();

// Fetch data
onMounted(async () => {
  if (exoplanets.value.length === 0) {
    await fetchExoplanets();
  }
});
```

---

## Component Communication Patterns

### 1. Parent → Child (Props)
Used for passing data down the component tree.

```vue
<!-- Parent -->
<StatCard label="Total" :value="count" highlight />

<!-- Child receives props -->
<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string | number;
  highlight?: boolean;
}>();
</script>
```

### 2. Child → Parent (Events)
Used for bubbling user interactions up.

```vue
<!-- Child emits event -->
<script setup lang="ts">
const emit = defineEmits<{
  click: [];
}>();

function handleClick() {
  emit('click');
}
</script>

<!-- Parent handles event -->
<TabButton @click="activeTab = 'overview'" />
```

### 3. Shared State (Composables)
Used for global data that multiple components need.

```vue
<!-- Component A -->
<script setup>
const { exoplanets, fetchExoplanets } = useExoplanets();
onMounted(() => fetchExoplanets());
</script>

<!-- Component B (automatically has same data) -->
<script setup>
const { exoplanets } = useExoplanets(); // Same reactive state
</script>
```

---

## Styling Patterns

### Color Palette
```css
/* Primary Colors */
--purple-900: Deep purple background
--purple-500: Accent borders and text
--purple-200: Light text

/* Status Colors */
--green-500: Habitable zone (positive)
--red-500: Too hot (warning)
--blue-500: Too cold (neutral)

/* UI Colors */
--white: Primary text
--black: Background overlays
```

### Glassmorphism Effect
```vue
<div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg">
  <!-- Content with frosted glass effect -->
</div>
```

### Responsive Grid
```vue
<!-- Stacks on mobile, grid on desktop -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

---

## Best Practices

### 1. Component Size
- **Small components** (< 200 lines): Helper components (StatCard, DetailItem)
- **Medium components** (200-400 lines): Feature components (MissionCalculator, HabitableZoneAnalysis)
- **Large components** (400+ lines): Main views (ExoplanetOverview, StarMap3D)

### 2. Null Safety
Always check for null/undefined before operations:
```typescript
// BAD
const distance = planet.sy_dist * 3.262;

// GOOD
const distance = planet.sy_dist !== null && planet.sy_dist !== undefined
  ? planet.sy_dist * 3.262
  : 0;
```

### 3. Computed vs Watch
- Use `computed` for derived values
- Use `watch` for side effects

```typescript
// Computed: Derive filtered list
const filtered = computed(() =>
  data.value.filter(item => item.value > threshold.value)
);

// Watch: Populate dropdown options
watch(exoplanets, (planets) => {
  stellarTypes.value = extractUniqueTypes(planets);
});
```

### 4. Component Organization
```vue
<script setup lang="ts">
// ============================================================================
// IMPORTS
// ============================================================================

// ============================================================================
// COMPOSABLES & DATA
// ============================================================================

// ============================================================================
// STATE
// ============================================================================

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// ============================================================================
// METHODS
// ============================================================================

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================
</script>
```

---

## Testing Strategies

### Component Testing (Recommended for future)
```typescript
import { mount } from '@vue/test-utils';
import StatCard from '@/components/StatCard.vue';

describe('StatCard', () => {
  it('renders label and value', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total', value: 42 }
    });

    expect(wrapper.text()).toContain('Total');
    expect(wrapper.text()).toContain('42');
  });

  it('applies highlight class when highlight prop is true', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total', value: 42, highlight: true }
    });

    expect(wrapper.classes()).toContain('highlight-class');
  });
});
```

---

## Performance Considerations

### 1. Computed Caching
Computed properties are cached and only re-evaluate when dependencies change.

### 2. Canvas Rendering
StarMap3D uses requestAnimationFrame for efficient 60 FPS rendering.

### 3. Lazy Data Loading
Data is only fetched once and cached in the composable.

### 4. List Rendering
Use `:key` for efficient v-for updates:
```vue
<tr v-for="planet in filteredExoplanets" :key="planet.pl_name">
```

---

## Accessibility

### ARIA Labels
```vue
<button aria-label="Zoom in">+</button>
<input aria-label="Minimum distance filter" type="number" />
```

### Keyboard Navigation
All interactive elements are keyboard accessible (native button/input elements).

### Color Contrast
All text meets WCAG AA standards for contrast ratios.

---

**Last Updated**: December 2025
**Component Count**: 9 components
**Maintained by**: Exoplanet Discovery Hub Team
