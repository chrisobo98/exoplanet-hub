# 🌌 Exoplanet Discovery Hub

A modern, interactive web application for exploring exoplanets discovered by NASA's TESS (Transiting Exoplanet Survey Satellite) mission. Features include real-time 3D visualization, mission planning calculations, and habitable zone analysis—all powered by live data from the NASA Exoplanet Archive.

![Exoplanet Discovery Hub](https://img.shields.io/badge/Status-Active-success)
![Nuxt 3](https://img.shields.io/badge/Nuxt-3.12.4-00DC82)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.7-38B2AC)

## 🚀 Features

### 1. **Interactive Overview**
- Real-time filtering by stellar type and distance
- Comprehensive data table with 20+ exoplanet properties
- Habitable zone status indicators
- Summary statistics dashboard

### 2. **3D Star Map**
- Navigate through space with mouse drag controls
- Auto-rotation mode
- Zoom in/out capabilities
- Color-coded by habitability (green = habitable, red = too hot, blue = too cold)
- Real 3D coordinates calculated from RA/Dec/Distance

### 3. **Mission Planning Calculator**
- Select any TESS-discovered exoplanet
- Calculate travel times at different velocities (0.1c, 0.5c, 0.9c)
- Compare with conventional rocket technology
- Mission feasibility assessment

### 4. **Habitable Zone Analysis**
- Scientific habitable zone boundary calculations
- Per-planet habitability classification
- Stellar properties display
- System-wide analysis

## 🎯 What's New (v2.0)

### Major Improvements from v1.0
- ✅ **Eliminated Pinia dependency** → Lightweight Vue 3 composables
- ✅ **Fixed SSR initialization errors** → Disabled SSR for optimal performance
- ✅ **Modern UI/UX redesign** → Aerospace-focused dark theme with glassmorphism
- ✅ **3D Visualization** → Custom Canvas-based star map with perspective projection
- ✅ **Mission Planning** → Theoretical interstellar mission calculations
- ✅ **Habitable Zone Analysis** → Scientific habitability classification
- ✅ **Enhanced Data** → 20+ properties per planet vs. 4 previously
- ✅ **Better Performance** → Removed PrimeVue, optimized rendering

### Technical Upgrades
- Vue 3 Composition API throughout
- TypeScript with strict typing
- Tailwind CSS for styling
- lucide-vue-next for icons
- Custom 3D rendering engine

## 📊 Data Sources

All data comes directly from the **NASA Exoplanet Archive** via their TAP (Table Access Protocol) service:
- **Source**: https://exoplanetarchive.ipac.caltech.edu/
- **Mission**: TESS (Transiting Exoplanet Survey Satellite)
- **Query**: Real-time SQL queries to the `ps` (Planetary Systems) table
- **Format**: JSON
- **Update Frequency**: Live data from NASA's continuously updated archive

### Data Fields (20+ properties per planet)
- **Identifiers**: Planet name, host star name
- **Discovery**: Year, facility, detection method
- **Planetary Properties**: Radius, mass, orbital period, semi-major axis, eccentricity, temperature
- **Stellar Properties**: Temperature, radius, mass, spectral type
- **Positional Data**: Right ascension, declination, distance
- **Calculated**: 3D Cartesian coordinates, habitable zone status

## 🧮 Scientific Calculations

### Habitable Zone Boundaries
Uses the **Stefan-Boltzmann Law** to calculate where liquid water could exist:

```typescript
// Stellar luminosity (relative to Sun)
L = (R_star / R_sun)² × (T_star / T_sun)⁴

// Conservative habitable zone
Inner Boundary = √(L / 1.1)  // Runaway greenhouse limit
Outer Boundary = √(L / 0.53) // Maximum greenhouse limit
```

### 3D Coordinate Conversion
Converts astronomical coordinates to Cartesian for visualization:

```typescript
// RA, Dec, Distance → X, Y, Z
const raRad = ra * π / 180
const decRad = dec * π / 180

x = distance × cos(dec) × cos(ra)
y = distance × cos(dec) × sin(ra)
z = distance × sin(dec)
```

### Mission Planning
Travel time calculations at fractions of light speed:

```typescript
travel_time = distance_light_years / velocity_fraction_of_c

// Example: 100 light years at 0.1c = 1000 years
```

## 📁 Project Structure

```
exoplanet-discovery/
├── app.vue                          # Main layout with header/footer
├── pages/
│   └── index.vue                    # Tab navigation
├── components/
│   ├── ExoplanetOverview.vue        # Overview tab
│   ├── StarMap3D.vue                # 3D visualization
│   ├── MissionCalculator.vue        # Mission planning
│   ├── HabitableZoneAnalysis.vue    # Habitability analysis
│   └── [Helper Components]          # UI components
├── composables/
│   └── useExoplanets.ts             # Main data logic
├── types/
│   └── exoplanet.ts                 # TypeScript definitions
├── server/api/
│   └── exoplanets.ts                # NASA API proxy
└── nuxt.config.ts                   # Configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/exoplanet-discovery.git
cd exoplanet-discovery

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
# Server runs on http://localhost:3000 (or 3001 if 3000 is busy)
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Nuxt 3** | Vue.js framework with SSR disabled |
| **Vue 3** | Reactive UI framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP client for NASA API |
| **lucide-vue-next** | Icon library |
| **Chart.js** | Charting capabilities |
| **HTML5 Canvas** | Custom 3D rendering |

## 📖 Documentation

For detailed documentation including:
- Architecture overview
- Component specifications
- Data flow diagrams
- API integration details
- Scientific formulas
- Future roadmap

See **[DOCUMENTATION.md](./DOCUMENTATION.md)**

## 🌟 Showcase

### What Makes This Project Stand Out

1. **Real Data, Real Time**: Live connection to NASA's Exoplanet Archive
2. **Scientific Accuracy**: Habitable zone calculations based on astrophysics
3. **Interactive 3D**: Custom-built 3D renderer without heavyweight libraries
4. **Mission Planning**: Theoretical interstellar travel calculations
5. **Modern UI/UX**: Aerospace-inspired design with smooth animations
6. **Performance**: Optimized rendering, no unnecessary dependencies

### Perfect For

- 🎓 **Students**: Learn about exoplanets and space exploration
- 🔭 **Astronomy Enthusiasts**: Explore real TESS discoveries
- 🚀 **Aerospace Professionals**: Understand mission planning concepts
- 💻 **Developers**: Modern Vue 3 + Nuxt architecture example
- 📊 **Data Visualization**: Advanced interactive visualization techniques

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

Data from NASA Exoplanet Archive (public domain).
Code licensed under MIT.

## 🙏 Credits

- **Data**: NASA Exoplanet Archive / Caltech / JPL
- **Mission**: TESS (Transiting Exoplanet Survey Satellite)
- **Framework**: Nuxt 3 / Vue 3
- **Design Inspiration**: Aerospace mission control interfaces

---

**Built with** ❤️ **for space exploration**

Last Updated: December 2025 | Version 2.0.0