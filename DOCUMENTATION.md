# Exoplanet Discovery Hub - Documentation

## Overview

The Exoplanet Discovery Hub is a modern web application for exploring exoplanets discovered by NASA's TESS (Transiting Exoplanet Survey Satellite) mission. The application provides interactive visualizations, mission planning tools, and habitable zone analysis based on real data from the NASA Exoplanet Archive.

## Architecture

### What We Had (Before)

**Previous Architecture (2024):**
- Basic Nuxt 3 application with SSR enabled
- Pinia for state management (causing SSR initialization issues)
- Basic D3.js visualization
- PrimeVue components with minimal styling
- Simple table display
- No interactive features
- 2016-era UI/UX design

**Issues:**
- Pinia SSR initialization errors blocking app functionality
- Non-interactive visualizations
- Poor mobile responsiveness
- Outdated visual design
- Limited data insights
- No mission planning features
- No habitable zone analysis

### What We're Accomplishing (Current)

**Modern Architecture (2025):**

#### Frontend Stack
- **Framework**: Nuxt 3.12.4 (SSR disabled for optimal performance)
- **UI Framework**: Tailwind CSS (removed PrimeVue dependency)
- **State Management**: Vue 3 Composables (replacing Pinia)
- **Icons**: lucide-vue-next
- **Charting**: chart.js + vue-chartjs
- **Visualizations**: Custom Canvas-based 3D renderer

#### Key Improvements

1. **Eliminated Pinia Dependency**
   - Replaced with lightweight Vue 3 composables
   - No SSR initialization issues
   - Simpler state management
   - Better performance

2. **Modern UI/UX**
   - Gradient backgrounds and glassmorphism effects
   - Dark theme optimized for astronomy data
   - Responsive design
   - Smooth transitions and animations
   - Professional aerospace-focused aesthetic

3. **Advanced Features**
   - Interactive 3D star map with rotation controls
   - Mission planning calculator with relativistic physics
   - Habitable zone analysis with scientific accuracy
   - Real-time filtering and data exploration

4. **Real TESS Data Integration**
   - Direct API connection to NASA Exoplanet Archive
   - Comprehensive data fields (20+ properties per planet)
   - Automatic 3D coordinate calculation
   - Habitable zone computation based on stellar properties

## Project Structure

```
exoplanet-discovery/
├── app.vue                          # Main app layout with header/footer
├── pages/
│   └── index.vue                    # Tab navigation and route container
├── components/
│   ├── ExoplanetOverview.vue        # Overview tab with table and filters
│   ├── StarMap3D.vue                # Interactive 3D star map
│   ├── MissionCalculator.vue        # Mission planning calculations
│   ├── HabitableZoneAnalysis.vue    # Habitable zone visualization
│   ├── TabButton.vue                # Navigation tab component
│   ├── StatCard.vue                 # Statistics display card
│   ├── DetailItem.vue               # Detail row component
│   ├── TravelTimeRow.vue            # Travel time calculation row
│   └── LegendItem.vue               # Legend entry component
├── composables/
│   └── useExoplanets.ts             # Main data composable
├── types/
│   └── exoplanet.ts                 # TypeScript interfaces
├── server/
│   └── api/
│       └── exoplanets.ts            # NASA API proxy
└── nuxt.config.ts                   # Nuxt configuration

```

## Components

### 1. ExoplanetOverview
**Purpose**: Main data table with filtering capabilities

**Features**:
- Summary statistics cards
- Real-time filtering by stellar type and distance
- Comprehensive exoplanet table
- Habitable zone status indicators
- Responsive layout

**Data Displayed**:
- Planet name and host star
- Stellar type
- Distance in light years
- Planet radius (Earth radii)
- Habitable zone classification
- Discovery year

### 2. StarMap3D
**Purpose**: Interactive 3D visualization of exoplanet spatial distribution

**Features**:
- Real-time 3D rendering using HTML5 Canvas
- Mouse drag to rotate
- Zoom controls
- Auto-rotation mode
- Color-coded by habitable zone status
- Perspective projection with depth sorting

**Technical Details**:
- Converts RA/Dec/Distance to 3D Cartesian coordinates
- Applies rotation matrices for X and Y axes
- Perspective projection for realistic depth
- Dynamic star background
- Glow effects for planets

### 3. MissionCalculator
**Purpose**: Calculate theoretical interstellar mission parameters

**Features**:
- Planet selection dropdown
- Travel time at different velocities (0.1c, 0.5c, 0.9c)
- Comparison to conventional rocket speeds
- Mission feasibility assessment

**Physics**:
- Uses actual distance data in light years
- Calculates travel duration at fractions of speed of light
- Provides context with current technology limitations

### 4. HabitableZoneAnalysis
**Purpose**: Analyze planetary systems for habitability

**Features**:
- Star system selection
- Stellar properties display
- Habitable zone boundary calculation
- Per-planet analysis with zone classification
- Color-coded status indicators

**Scientific Calculations**:
- Stefan-Boltzmann law for stellar luminosity
- Conservative habitable zone estimates
- Inner boundary: runaway greenhouse limit
- Outer boundary: maximum greenhouse effect limit

## Data Flow

### 1. Data Fetching
```typescript
// Server-side API proxy
server/api/exoplanets.ts
↓
// Composable fetches and processes data
composables/useExoplanets.ts
↓
// Components consume reactive data
components/*.vue
```

### 2. NASA Exoplanet Archive Query
```sql
SELECT
  pl_name,           -- Planet name (e.g., "TOI-700 d")
  hostname,          -- Host star name (e.g., "TOI-700")
  disc_year,         -- Discovery year (e.g., 2020)
  disc_facility,     -- Discovery facility (e.g., "Transiting Exoplanet Survey Satellite (TESS)")
  discoverymethod,   -- Detection method (e.g., "Transit", "Radial Velocity")
  pl_rade,           -- Planet radius in Earth radii (1.0 = Earth-sized)
  pl_radj,           -- Planet radius in Jupiter radii (1.0 = Jupiter-sized)
  pl_masse,          -- Planet mass in Earth masses (1.0 = Earth mass)
  pl_massj,          -- Planet mass in Jupiter masses (1.0 = Jupiter mass)
  pl_orbper,         -- Orbital period in days (365.25 = 1 Earth year)
  pl_orbsmax,        -- Semi-major axis in AU (1.0 = Earth-Sun distance)
  pl_orbeccen,       -- Orbital eccentricity (0 = circular, 0.9 = highly elliptical)
  pl_eqt,            -- Equilibrium temperature in Kelvin (288K = Earth's temp)
  st_teff,           -- Stellar effective temperature in Kelvin (5778K = Sun)
  st_rad,            -- Stellar radius in Solar radii (1.0 = Sun-sized)
  st_mass,           -- Stellar mass in Solar masses (1.0 = Sun mass)
  st_spectype,       -- Stellar spectral type (e.g., "G2V" = Sun-like, "M3" = red dwarf)
  ra,                -- Right ascension in degrees (0-360)
  dec,               -- Declination in degrees (-90 to +90)
  sy_dist            -- System distance in parsecs (1 parsec = 3.262 light years)
FROM ps
WHERE disc_facility LIKE '%TESS%'  -- Only TESS discoveries
  AND default_flag = 1             -- Only default (best) parameters per planet
```

**Note**: The field name is `discoverymethod` (no underscore), not `disc_method`.

### 3. Data Processing
```typescript
// Calculate 3D coordinates
const distance = planet.sy_dist; // parsecs
const raRad = planet.ra * Math.PI / 180;
const decRad = planet.dec * Math.PI / 180;

planet.x = distance * Math.cos(decRad) * Math.cos(raRad);
planet.y = distance * Math.cos(decRad) * Math.sin(raRad);
planet.z = distance * Math.sin(decRad);
```

### 4. Habitable Zone Calculation
```typescript
// Stefan-Boltzmann Law
const luminosity = Math.pow(stellarRadius, 2) * Math.pow(stellarTemp / 5778, 4);

// Conservative habitable zone boundaries
const innerBoundary = Math.sqrt(luminosity / 1.1);  // Runaway greenhouse
const outerBoundary = Math.sqrt(luminosity / 0.53); // Maximum greenhouse
```

## Configuration

### nuxt.config.ts
```typescript
{
  ssr: false,  // Disabled for client-side only rendering
  modules: [
    "@primevue/nuxt-module",  // Can be removed if desired
    "@nuxtjs/tailwindcss"
  ]
}
```

### API Endpoint
- **URL**: `https://exoplanetarchive.ipac.caltech.edu/TAP/sync`
- **Format**: JSON
- **Protocol**: TAP (Table Access Protocol)

## Development

### Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Features

#### 1. Add New Data Field
1. Update TypeScript interface in `types/exoplanet.ts`
2. Add field to SQL query in `composables/useExoplanets.ts`
3. Display in relevant component

#### 2. Add New Visualization
1. Create component in `components/`
2. Add tab in `pages/index.vue`
3. Import composable: `const { exoplanets } = useExoplanets()`
4. Fetch data in `onMounted()` hook

#### 3. Add New Calculation
1. Add function to `composables/useExoplanets.ts`
2. Export from composable
3. Use in components

## Performance Considerations

1. **SSR Disabled**: Eliminates SSR hydration overhead
2. **Composable Pattern**: Shared reactive state without Pinia overhead
3. **Canvas Rendering**: Hardware-accelerated 3D graphics
4. **Lazy Data Fetching**: Data loaded on demand per tab
5. **Computed Properties**: Automatic caching and memoization

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast color scheme
- Responsive text sizing

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

### Planned Features
1. **Advanced 3D with Three.js**
   - Full 3D rendering engine
   - Better camera controls
   - Planet detail overlays
   - Orbital path visualization

2. **Additional Calculations**
   - Relativistic time dilation effects
   - Energy requirements for missions
   - Comparison with known propulsion systems
   - Launch window calculations

3. **Data Export**
   - CSV export
   - JSON API
   - PDF reports
   - Chart image export

4. **Filtering Enhancements**
   - Save filter presets
   - Advanced query builder
   - Custom distance ranges
   - Multiple stellar type selection

5. **Comparison Tools**
   - Side-by-side planet comparison
   - System comparison
   - Historical discovery trends
   - Statistical analysis

## Credits

- **Data Source**: NASA Exoplanet Archive
- **Mission**: TESS (Transiting Exoplanet Survey Satellite)
- **Framework**: Nuxt 3
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons

## License

This project uses data from the NASA Exoplanet Archive, which is operated by the California Institute of Technology, under contract with the National Aeronautics and Space Administration.

---

**Last Updated**: December 2025
**Version**: 2.0.0
