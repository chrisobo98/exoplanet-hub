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

### 2. **3D Star Map** ⚠️ Work in Progress

- **Two View Modes**: Star View (all exoplanet systems) and System View (individual planetary systems)
- **WebGL Rendering**: Powered by Three.js for smooth 3D graphics
- **Interactive Controls**:
  - Mouse drag to rotate camera
  - Scroll to zoom in/out
  - Right-click drag to pan
  - Click planets to zoom to their system
- **Visual Features**:
  - Color-coded by habitability (green = habitable, red = too hot, blue = too cold)
  - Planetary orbits in System View
  - Habitable zone visualization (shaded green ring)
  - Hover labels showing planet names
  - Our Sun's habitable zone (yellow ring)
- **Spatial Calculations**: Real 3D coordinates from RA/Dec/Distance

⚠️ **Known Issues**: Some spatial calculations are still being refined. Planets may appear closer to our Sun than scientifically accurate. We're actively working on improving coordinate transformations and distance scaling.

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

- **Source**: <https://exoplanetarchive.ipac.caltech.edu/>
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

All calculations are documented with scientific references to ensure accuracy and reproducibility.

### Habitable Zone Boundaries

Uses the **Kopparapu et al. (2013)** formulation for calculating conservative habitable zones:

**Reference**: Kopparapu, R. K., et al. (2013). "Habitable Zones Around Main-Sequence Stars: New Estimates." *The Astrophysical Journal*, 765(2), 131. [DOI: 10.1088/0004-637X/765/2/131](https://iopscience.iop.org/article/10.1088/0004-637X/765/2/131)

**Formula**:

```typescript
// Step 1: Calculate stellar luminosity using Stefan-Boltzmann Law
L = (R_star / R_sun)² × (T_star / T_sun)⁴

// Step 2: Calculate effective stellar flux using 4th-order polynomial
// where T* = T_eff - 5780 K
Seff = S₀ + a×T* + b×T*² + c×T*³ + d×T*⁴

// Step 3: Calculate distance in AU
d = √(L / Seff)

// Conservative Habitable Zone (used in this application):
// Inner: Runaway Greenhouse (S₀ = 1.107)
// Outer: Maximum Greenhouse (S₀ = 0.356)
```

**Coefficients** (from Kopparapu 2013, Table 3):

| Boundary | S₀ | a | b | c | d |
|----------|-----|-----------|-----------|-------------|-------------|
| Inner (Runaway Greenhouse) | 1.107 | 1.332×10⁻⁴ | 1.580×10⁻⁸ | -8.308×10⁻¹² | -1.931×10⁻¹⁵ |
| Outer (Maximum Greenhouse) | 0.356 | 6.171×10⁻⁵ | 1.698×10⁻⁹ | -3.198×10⁻¹² | -5.575×10⁻¹⁶ |

**Example**: For our Sun (R = 1.0 R☉, T = 5778 K):
- Inner boundary: ~0.95 AU (Venus-like)
- Outer boundary: ~1.67 AU (Mars-like)
- Earth at 1.0 AU is comfortably within this zone ✓

**Additional Resources**:
- [Virtual Planetary Laboratory - HZ Calculator](https://vpl.uw.edu/calculation-of-habitable-zones/)
- [NASA Exoplanet Exploration - Habitable Zone](https://exoplanets.nasa.gov/search-for-life/habitable-zone/)

### 3D Coordinate Conversion

Converts equatorial coordinates (Right Ascension, Declination, Distance) to Cartesian coordinates for 3D visualization:

**Reference**: Standard astronomical coordinate transformation (Murray, C. A., 1983. *Vectorial Astrometry*)

**Formula**:

```typescript
// Convert degrees to radians
const raRad = (ra * π) / 180
const decRad = (dec * π) / 180

// Equatorial to Cartesian transformation
x = distance × cos(dec) × cos(ra)
y = distance × cos(dec) × sin(ra)
z = distance × sin(dec)
```

**Coordinate System**:
- **X-axis**: Points toward RA = 0°, Dec = 0° (Vernal Equinox direction)
- **Y-axis**: Points toward RA = 90°, Dec = 0°
- **Z-axis**: Points toward Dec = 90° (North Celestial Pole)
- **Units**: Parsecs (1 pc ≈ 3.26 light years)

⚠️ **Known Limitation**: The current 3D visualization uses a simplified Cartesian transformation. For a more accurate representation at scale, future versions may implement:
- Proper motion corrections
- Galactic coordinate system
- Perspective-corrected scaling
- Distance-dependent filtering

**Note**: Our Sun is at the origin (0, 0, 0). Distances are filtered to show only systems >30 parsecs away to prevent visual crowding.

### System View Orbital Scaling

Planetary orbital distances are scaled using a **square root function** for better visualization:

```typescript
// Actual orbital distance in AU
const actualDistance = planet.pl_orbsmax

// Scaled distance for 3D rendering (in scene units)
const scaledDistance = √(actualDistance) × 40

// Why square root?
// - Linear scaling: Distant planets too far to see
// - Logarithmic scaling: Close planets too close to star
// - Square root: Best compromise for visibility
```

**Example** (Jupiter at 5.2 AU):
- Linear (×40): 208 units (too far)
- Square root (×40): ~91 units (visible) ✓
- Logarithmic (×30): ~51 units (too compressed)

### Planet Size Scaling

Planets are scaled relative to their host stars for visibility while maintaining approximate proportions:

```typescript
// Star radius: 8 scene units (fixed)
// Planet radius: based on Earth radii (pl_rade)
const planetRadius = Math.max(0.5, Math.min((pl_rade || 1) × 0.3, 2))

// Capped between 0.5-2 units (6-25% of star size)
// Real proportions: Jupiter ≈ 10% of Sun, Earth ≈ 1% of Sun
```

**Note**: Planet sizes are exaggerated for visibility. In reality, even Jupiter would be barely visible at these scales.

### Mission Planning

Travel time calculations at fractions of light speed:

**Formula**:

```typescript
// Convert distance from parsecs to light years
const distanceLY = distanceParsecs × 3.262

// Calculate travel time
travel_time_years = distanceLY / velocity_fraction_of_c

// Example: TOI-700 d at 31.1 pc (101.5 ly) at 0.1c
// travel_time = 101.5 / 0.1 = 1,015 years
```

**Propulsion Scenarios**:
- **0.1c**: Theoretical nuclear fusion drives (e.g., Project Daedalus concept)
- **0.5c**: Advanced antimatter or fusion ramjet (far future)
- **0.9c**: Requires breakthrough physics (warp drive, etc.)
- **Conventional rockets** (~50 km/s ≈ 0.00017c): Current technology baseline

**Reference**:
- Project Daedalus: British Interplanetary Society (1978)
- Interstellar travel physics: Forward, R. L. (1984). "Roundtrip Interstellar Travel Using Laser-Pushed Lightsails"

**Reality Check**: No spacecraft has exceeded 0.0002c to date (Voyager 1 at ~17 km/s)

## 📁 Project Structure

```text
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
| **Three.js** | WebGL 3D graphics library |
| **Axios** | HTTP client for NASA API |
| **lucide-vue-next** | Icon library |

## 📖 Documentation

### Main Documentation

For detailed documentation including architecture, components, and data flow:
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Technical overview and architecture

### Scientific Calculations

For detailed scientific formulas, references, and contribution guidelines:
- **[CALCULATIONS.md](./CALCULATIONS.md)** - All calculations with peer-reviewed references
  - Habitable zone formulas (Kopparapu 2013)
  - 3D coordinate transformations
  - Visualization scaling methods
  - Known limitations and areas for improvement
  - How to contribute calculation improvements

## 🌟 Why Choose Exoplanet Discovery Hub?

### Competitive Analysis

| Feature | This Project | NASA Exoplanet Archive | Eyes on Exoplanets | Exoplanet.eu |
|---------|--------------|------------------------|-------------------|--------------|
| **UI/UX** | Modern, web-based | Professional scientific interface | Immersive 3D experience | Research-focused tables |
| **3D Visualization** | ✅ WebGL browser-based, Two view modes | ✅ 3D thumbnails per planet | ✅ Full 3D (desktop app) | ❌ 2D plots only |
| **Interactivity** | Click, drag, zoom, hover labels | Click for individual views | Fly through space | Plot configuration |
| **Mission Planning** | ✅ Travel time calculator | ❌ Not available | ✅ Spacecraft views | ❌ Not available |
| **Habitable Zone** | ✅ Kopparapu 2013 formulas + viz | Data available in tables | Visual indicators | Data available |
| **Filtering** | Real-time multi-parameter | Advanced TAP queries | Mission-based | Multi-parameter |
| **Mobile Support** | ✅ Fully responsive | Desktop-optimized | Desktop-only app | Desktop-optimized |
| **Data Scope** | TESS discoveries (~700+) | All confirmed (6000+) | All confirmed (5500+) | All confirmed (5000+) |
| **Installation** | None (web-based) | None (web-based) | Desktop download required | None (web-based) |
| **Open Source** | ✅ MIT License | ❌ Closed | ❌ Closed | ❌ Closed |

**Sources**:
- [NASA Exoplanet Catalog](https://science.nasa.gov/exoplanets/exoplanet-catalog/)
- [Eyes on Exoplanets](https://science.nasa.gov/eyes/)
- [Exoplanet.eu](http://exoplanet.eu/)

### What Makes This Project Stand Out

1. **🌐 Web-Based 3D**: Full Three.js visualization in the browser - no downloads or installations required
2. **📱 Mobile-First Design**: Fully responsive interface that works on phones, tablets, and desktops
3. **🔬 Scientific Transparency**: Open-source Kopparapu 2013 formulas with full documentation and peer-reviewed citations
4. **🚀 Educational Mission Planning**: Unique interstellar travel calculator comparing theoretical propulsion systems
5. **🎯 TESS Focus**: Specialized for NASA's newest exoplanet discoveries (2018-present)
6. **🆓 Completely Open Source**: MIT licensed - fork it, learn from it, contribute to it
7. **⚡ Modern Stack**: Vue 3, Nuxt 3, Three.js, TypeScript - learn cutting-edge web development
8. **🎓 Learning Tool**: Perfect for students, educators, and space enthusiasts to explore real NASA data
9. **📊 Comprehensive Documentation**: CALCULATIONS.md explains every formula with academic references

### Perfect For

- 🎓 **Students & Educators**: Interactive learning tool for astronomy and space exploration
- 🔭 **Astronomy Enthusiasts**: Explore real TESS discoveries with professional-grade visualizations
- 🚀 **Aerospace Professionals**: Understand mission planning concepts and habitability analysis
- 💻 **Developers**: Modern Vue 3 + Nuxt architecture reference, best practices in action
- 📊 **Data Scientists**: Advanced interactive data visualization techniques
- 🏫 **Planetariums & Museums**: Public display-ready interface with auto-rotation mode

## 🚢 Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/exoplanet-discovery)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/exoplanet-discovery)

### Manual Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

#### Docker

```dockerfile
# Coming soon - Docker support planned for v2.1
```

### Environment Variables

No environment variables required! The app works out of the box with NASA's public API.

### Build Output

```bash
npm run build
# Outputs to .output/ directory (Nuxt 3 default)
# Ready for serverless deployment
```

---

## 📋 Release Checklist

### Pre-Release (v2.0)

- [x] Remove Pinia dependency → Vue 3 composables
- [x] Fix SSR initialization errors → Disable SSR
- [x] Implement modern UI/UX with glassmorphism
- [x] Build custom 3D star map visualization
- [x] Add mission planning calculator
- [x] Add habitable zone analysis
- [x] Enhance data model (20+ fields)
- [x] Fix API field name (`discoverymethod`)
- [x] Add watch logic for stellar types filter
- [x] Remove unused components
- [x] Add comprehensive documentation
  - [x] API.md - Complete API reference
  - [x] COMPONENTS.md - Component architecture
  - [x] DOCUMENTATION.md - Technical overview
- [x] Heavy code commenting (ExoplanetOverview)
- [ ] Heavy code commenting (remaining components)
- [ ] Add screenshots/demo GIF to README
- [ ] Create demo video
- [ ] Set up GitHub repository
- [ ] Configure GitHub Pages for live demo
- [ ] Add CONTRIBUTING.md
- [ ] Add CODE_OF_CONDUCT.md
- [ ] Create initial GitHub release (v2.0.0)

### Post-Release

- [ ] Submit to Show HN / Product Hunt
- [ ] Share on r/dataisbeautiful
- [ ] Share on r/space and r/Astronomy
- [ ] Post on Twitter/X with demo
- [ ] Add to Awesome Vue list
- [ ] Add to NASA's Third-Party Tools page
- [ ] Create YouTube tutorial
- [ ] Write blog post about architecture

### Future Roadmap (v2.1+)

- [ ] Add Three.js option for advanced 3D
- [ ] Implement data export (CSV, JSON)
- [ ] Add chart visualizations (Chart.js)
- [ ] Create comparison tool
- [ ] Add saved filter presets
- [ ] Implement server-side caching (Redis)
- [ ] Add Docker support
- [ ] Create mobile app (React Native)
- [ ] Add more missions (Kepler, K2)
- [ ] Implement user accounts (optional)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**

   ```bash
   npm run dev
   # Verify all tabs work correctly
   ```

5. **Commit your changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Keep components under 500 lines
- Add JSDoc comments for functions
- Use semantic commit messages
- Test on mobile devices

---

## 📝 License

MIT License

Copyright (c) 2025 Exoplanet Discovery Hub

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**Data License**: All exoplanet data sourced from NASA Exoplanet Archive is in the public domain.

---

## 🙏 Credits & Acknowledgments

### Data Sources

- **NASA Exoplanet Archive** - Caltech / JPL / NASA
- **TESS Mission** - MIT / NASA Goddard Space Flight Center
- **TAP Service** - IPAC / Caltech

### Technologies

- **Framework**: [Nuxt 3](https://nuxt.com/) / [Vue 3](https://vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Deployment**: [Vercel](https://vercel.com/) / [Netlify](https://netlify.com/)

### Inspiration

- NASA mission control interfaces
- SpaceX Dragon interface
- James Webb Space Telescope operations UI
- Aerospace-grade data visualization systems

### Special Thanks

- The NASA Exoplanet Archive team for maintaining excellent public API documentation
- The TESS mission team for discovering thousands of exoplanets
- The Vue.js and Nuxt communities for amazing open-source tools
- All contributors and users who help improve this project

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [docs/](./docs/)
- **GitHub Issues**: [Report a Bug](https://github.com/yourusername/exoplanet-discovery/issues)
- **NASA Archive**: [exoplanetarchive.ipac.caltech.edu](https://exoplanetarchive.ipac.caltech.edu/)
- **TESS Mission**: [tess.mit.edu](https://tess.mit.edu/)

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/exoplanet-discovery?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/exoplanet-discovery?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/exoplanet-discovery)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/exoplanet-discovery)
![License](https://img.shields.io/github/license/yourusername/exoplanet-discovery)

---

Built with ❤️ for space exploration and scientific discovery

> "The universe is under no obligation to make sense to you." - Neil deGrasse Tyson

---

**Version**: 2.0.0
**Last Updated**: December 2025
**Status**: Active Development
**Maintained by**: Exoplanet Discovery Hub Team
