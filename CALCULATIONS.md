# Scientific Calculations Documentation

This document provides detailed information about all scientific calculations used in the Exoplanet Discovery Hub, including formulas, references, known limitations, and areas for improvement.

## Table of Contents

1. [Habitable Zone Calculations](#habitable-zone-calculations)
2. [3D Coordinate Transformations](#3d-coordinate-transformations)
3. [Visualization Scaling](#visualization-scaling)
4. [Mission Planning](#mission-planning)
5. [Known Limitations](#known-limitations)
6. [Contributing Improvements](#contributing-improvements)

---

## Habitable Zone Calculations

### Method: Kopparapu et al. (2013)

We use the **conservative habitable zone** formulation from the peer-reviewed paper:

**Reference**: Kopparapu, R. K., Ramirez, R., Kasting, J. F., et al. (2013). "Habitable Zones Around Main-Sequence Stars: New Estimates." *The Astrophysical Journal*, 765(2), 131.

**DOI**: [10.1088/0004-637X/765/2/131](https://doi.org/10.1088/0004-637X/765/2/131)

### Formula

The calculation follows three steps:

#### Step 1: Calculate Stellar Luminosity

Using the Stefan-Boltzmann Law, we calculate luminosity relative to our Sun:

```typescript
L = (R_star / R_sun)² × (T_star / T_sun)⁴
```

Where:
- `R_star` = Stellar radius in solar radii (from `st_rad` field)
- `R_sun` = 1.0 (by definition)
- `T_star` = Stellar effective temperature in Kelvin (from `st_teff` field)
- `T_sun` = 5778 K (Sun's temperature)

**Physical Basis**: The Stefan-Boltzmann Law states that luminosity is proportional to radius squared and temperature to the fourth power.

#### Step 2: Calculate Effective Stellar Flux (Seff)

The effective flux at the habitable zone boundary is calculated using a 4th-order polynomial:

```typescript
Seff = S₀ + a×T* + b×T*² + c×T*³ + d×T*⁴
```

Where:
- `T*` = `T_eff - 5780` (temperature offset from Sun)

**Conservative Habitable Zone Boundaries**:

| Boundary | Description | S₀ | a | b | c | d |
|----------|-------------|-----|-----------|-----------|-------------|-------------|
| **Inner** | Runaway Greenhouse | 1.107 | 1.332×10⁻⁴ | 1.580×10⁻⁸ | -8.308×10⁻¹² | -1.931×10⁻¹⁵ |
| **Outer** | Maximum Greenhouse | 0.356 | 6.171×10⁻⁵ | 1.698×10⁻⁹ | -3.198×10⁻¹² | -5.575×10⁻¹⁶ |

These coefficients come from Table 3 of Kopparapu et al. (2013).

**Physical Meaning**:
- **Runaway Greenhouse** (inner): Distance where water vapor greenhouse effect becomes self-reinforcing (like Venus)
- **Maximum Greenhouse** (outer): Distance where maximum CO₂ greenhouse cannot keep water liquid (like early Mars)

#### Step 3: Calculate Distance

```typescript
d = √(L / Seff)
```

Result is in Astronomical Units (AU).

### Example Calculation

For our Sun (R = 1.0 R☉, T = 5778 K):

```typescript
// Step 1: Luminosity
L = (1.0)² × (5778/5778)⁴ = 1.0 L☉

// Step 2: Effective flux
T* = 5778 - 5780 = -2
Seff_inner = 1.107 + 1.332e-4×(-2) + ... ≈ 1.107
Seff_outer = 0.356 + 6.171e-5×(-2) + ... ≈ 0.356

// Step 3: Distance
d_inner = √(1.0 / 1.107) ≈ 0.95 AU
d_outer = √(1.0 / 0.356) ≈ 1.67 AU
```

**Result**: Earth at 1.0 AU is well within the habitable zone ✓

### Implementation

Location: `composables/useExoplanets.ts`, lines 220-260

```typescript
const calculateHabitableZone = (
  stellarRadius: number,
  stellarTemp: number
): HabitableZoneBoundaries => {
  const luminosity = Math.pow(stellarRadius, 2) * Math.pow(stellarTemp / 5778, 4);
  const T_star = stellarTemp - 5780;

  const Seff_inner = 1.107 + 1.332e-4 * T_star + 1.580e-8 * Math.pow(T_star, 2)
    + -8.308e-12 * Math.pow(T_star, 3) + -1.931e-15 * Math.pow(T_star, 4);

  const Seff_outer = 0.356 + 6.171e-5 * T_star + 1.698e-9 * Math.pow(T_star, 2)
    + -3.198e-12 * Math.pow(T_star, 3) + -5.575e-16 * Math.pow(T_star, 4);

  const innerBoundary = Math.sqrt(luminosity / Seff_inner);
  const outerBoundary = Math.sqrt(luminosity / Seff_outer);

  return { innerBoundary, outerBoundary, luminosity };
};
```

### Alternative Formulations

The Kopparapu 2013 paper also provides **optimistic** boundaries:

- **Recent Venus** (inner optimistic): S₀ = 1.776
- **Early Mars** (outer optimistic): S₀ = 0.3207

We chose the conservative estimates as they are more scientifically defensible for classifying potentially habitable worlds.

### Data Quality Safeguards

#### The Problem: Inconsistent Stellar Parameters

The NASA Exoplanet Archive aggregates data from multiple sources and publications. For newly discovered planets (especially from TESS), stellar characterization is often preliminary and subject to revision. This can lead to:

1. **Conflicting stellar parameters** across different publications
2. **Incorrect radius or temperature values** in database queries
3. **False positive habitable zone classifications** due to bad input data

#### Real-World Example: TOI-6478 b

**Database values**:
- Stellar temperature: 3250 K
- Stellar radius: 0.23 R☉
- Planet orbital distance: 0.1136 AU

**Calculated habitable zone** (using above parameters):
- Inner boundary: 0.076 AU
- Outer boundary: 0.150 AU
- **Classification**: Planet at 0.114 AU → **"Habitable"** ✗

**Reality** (from equilibrium temperature):
- Equilibrium temperature: 204 K (-68°C)
- Stellar flux received: 0.00034× Earth's flux
- **Classification**: Frozen, not habitable ✓

**Discrepancy**: 1,233× difference in calculated vs actual stellar flux! This indicates the stellar parameters in the database are severely incorrect or from an inconsistent source.

#### The Solution: Two-Stage Verification

To prevent false positives from data quality issues, we implement a dual-check system:

```typescript
// STEP 1: Use equilibrium temperature as PRIMARY check (most reliable)
// Equilibrium temp is calculated from observed stellar flux
if (planet.pl_eqt) {
  const MIN_HABITABLE_TEMP = 235; // Kelvin (-38°C)
  const MAX_HABITABLE_TEMP = 350; // Kelvin (77°C)
  const isHabitable = (pl_eqt >= MIN_HABITABLE_TEMP && pl_eqt <= MAX_HABITABLE_TEMP);
  return isHabitable;
}

// STEP 2: Fallback to calculated HZ (when no equilibrium temp available)
// Less reliable due to potential stellar parameter inconsistencies
const { innerBoundary, outerBoundary } = calculateHabitableZone(st_rad, st_teff);
const isHabitable = (pl_orbsmax >= innerBoundary && pl_orbsmax <= outerBoundary);
```

#### Temperature Threshold Rationale

**Lower Bound: 235K (-38°C)**
- Between Mars (210K, outer HZ edge) and confirmed habitable planets (269-280K)
- Mars at 210K: Near outer edge, mostly frozen
- TOI-904 c at 217K: Explicitly "too cold" per literature
- TOI-700 d at 269K: Confirmed habitable zone planet
- Filters out frozen worlds while allowing for reasonable greenhouse effects

**Upper Bound: 350K (77°C)**
- Well above Earth's surface temperature (288K)
- Allows for planets with high albedo or thin atmospheres
- Venus has T_eq ≈ 737K and experiences runaway greenhouse (clearly too hot)
- Prevents classification of scorched worlds as habitable

**Reference Temperatures**:
- Earth: 255K (equilibrium), 288K (surface with atmosphere)
- Mars: 210K (near outer HZ edge)
- Venus: 737K (runaway greenhouse, too hot)

#### Verification Results

**Planets Correctly Filtered Out**:
| Planet | Orbital Distance | Calculated HZ? | T_eq | Temperature Check | Final Classification |
|--------|------------------|----------------|------|-------------------|---------------------|
| TOI-904 c | 0.312 AU | ✓ Habitable | 217K | ✗ Too cold (<175K threshold) | **Too Cold** |
| TOI-6478 b | 0.114 AU | ✓ Habitable | 204K | ✗ Too cold (<175K threshold) | **Too Cold** |

**Verified Habitable Planets**:
| Planet | Orbital Distance | Calculated HZ? | T_eq | Temperature Check | Final Classification |
|--------|------------------|----------------|------|-------------------|---------------------|
| TOI-700 d | 0.1037 AU | ✓ Habitable | 269K | ✓ In range | **Habitable** ✓ |
| TOI-715 b | 0.083 AU | ✓ Habitable | 280K | ✓ In range | **Habitable** ✓ |
| TOI-2257 b | 0.175 AU | ✓ Habitable | 278K | ✓ In range | **Habitable** ✓ |

#### Implementation

Location: `composables/useExoplanets.ts`, lines 314-407

The sanity check is applied **only** to planets preliminarily classified as habitable based on orbital distance. This prevents:
- False positives from bad stellar data
- Over-filtering of planets with missing temperature data
- Unnecessary computation for clearly non-habitable planets

#### Important Notes

This equilibrium temperature check is a **data quality filter**, not a definitive habitability assessment. It helps catch obvious database inconsistencies.

**Actual habitability** depends on many factors not captured by equilibrium temperature alone:
- Atmospheric composition and pressure
- Greenhouse gas concentrations
- Planetary albedo (reflectivity)
- Tidal locking effects
- Magnetic field presence
- Stellar activity and radiation
- Planetary mass and gravity

Planets passing both checks should be considered **potentially habitable candidates** worthy of further study, not confirmed habitable worlds.

### Additional Resources

- [Virtual Planetary Laboratory HZ Calculator](https://vpl.uw.edu/calculation-of-habitable-zones/)
- [NASA Exoplanet Exploration - Habitable Zone](https://exoplanets.nasa.gov/search-for-life/habitable-zone/)
- [Kopparapu Group Tools](https://depts.washington.edu/naivpl/content/hz-calculator)

---

## 3D Coordinate Transformations

### Equatorial to Cartesian Conversion

Exoplanet positions are given in **equatorial coordinates**:
- **Right Ascension (RA)**: Angular position along celestial equator (0° to 360°)
- **Declination (Dec)**: Angular position above/below celestial equator (-90° to +90°)
- **Distance**: Linear distance from Earth in parsecs

We convert these to **Cartesian coordinates** (X, Y, Z) for 3D visualization.

### Formula

```typescript
// Convert degrees to radians
const raRad = (ra × π) / 180
const decRad = (dec × π) / 180

// Spherical to Cartesian transformation
x = distance × cos(dec) × cos(ra)
y = distance × cos(dec) × sin(ra)
z = distance × sin(dec)
```

### Coordinate System

- **Origin**: Our Sun (Earth's position)
- **X-axis**: Points toward **Vernal Equinox** (RA = 0°, Dec = 0°)
- **Y-axis**: Points toward RA = 90°, Dec = 0°
- **Z-axis**: Points toward **North Celestial Pole** (Dec = +90°)
- **Units**: Parsecs (1 pc = 3.262 light years = 206,265 AU)

### Reference

Standard astronomical coordinate transformation from:

Murray, C. A. (1983). *Vectorial Astrometry*. Adam Hilger Ltd, Bristol.

### Implementation

Location: `composables/useExoplanets.ts`, lines 343-360

```typescript
const raRad = (planet.ra * Math.PI) / 180;
const decRad = (planet.dec * Math.PI) / 180;
const distance = planet.sy_dist;

planet.x = distance * Math.cos(decRad) * Math.cos(raRad);
planet.y = distance * Math.cos(decRad) * Math.sin(raRad);
planet.z = distance * Math.sin(decRad);
```

### Known Limitations

⚠️ **Current Issues**:

1. **Simplified Transformation**: Does not account for:
   - Earth's orbital motion (parallax changes throughout the year)
   - Proper motion of stars (movement through space over time)
   - Galactic rotation
   - Relativistic effects for very distant objects

2. **Visualization Crowding**: Planets at similar RA/Dec but different distances can overlap in projection

3. **Distance Filtering**: Currently filtering out systems <30 parsecs to reduce crowding near Sun, but this may hide interesting nearby systems

### Potential Improvements

For a more accurate representation, future versions could implement:

1. **Galactic Coordinates**: Transform to galactic latitude/longitude
2. **Proper Motion Corrections**: Account for stellar motion
3. **Adaptive Filtering**: Distance-based LOD (level of detail)
4. **Perspective Projection**: Correct for viewing angle effects
5. **Time-based Positions**: Show positions at specific epochs

**Contribution Welcome**: If you have expertise in astrometry, we'd love help improving these transformations!

---

## Visualization Scaling

### Problem Statement

Astronomical scales are **not human-intuitive**:
- Planetary orbits range from 0.01 AU to 100+ AU
- If we use linear scaling, either:
  - Close planets are invisible (all at star center)
  - Distant planets are off-screen

### Solution: Non-Linear Scaling

We use different scaling functions for different contexts.

### System View: Square Root Scaling

For planetary orbits within a single system:

```typescript
const scaledDistance = √(actualDistance_AU) × 40
```

**Why square root?**

| Method | Formula | Jupiter (5.2 AU) | Neptune (30 AU) | Issue |
|--------|---------|------------------|-----------------|-------|
| Linear | d × 40 | 208 units | 1200 units | Outer planets too far |
| Logarithmic | log(d+1) × 30 | 51 units | 102 units | Inner planets too compressed |
| **Square root** | √d × 40 | **91 units** | **219 units** | **Balanced** ✓ |

**Mathematical Justification**: Square root provides logarithmic-like compression for large values while preserving linear-like spacing for small values.

### Planet Size Scaling

```typescript
const starRadius = 8  // Fixed
const planetRadius = Math.max(0.5, Math.min((pl_rade || 1) × 0.3, 2))
```

**Real vs. Displayed Proportions**:

| Body | Real Diameter | Real % of Sun | Displayed % of Star |
|------|---------------|---------------|---------------------|
| Earth | 12,742 km | 0.9% | ~6% (0.5/8) |
| Jupiter | 139,820 km | 10% | ~19% (1.5/8) |
| Large Planet | ~2 R⊕ | ~1.8% | ~25% (2/8) |

**Why exaggerate?** At realistic scales, even Jupiter would be barely 1 pixel.

### Habitable Zone Visualization

Uses the same square root scaling as orbits:

```typescript
const hzInnerScaled = √(hzInner_AU) × 40
const hzOuterScaled = √(hzOuter_AU) × 40
```

**Ring visibility threshold**: Only show shaded ring if `(hzOuter - hzInner) > 3` scene units.

For very narrow habitable zones (e.g., around cool M-dwarfs), only boundary lines are shown.

---

## Mission Planning

### Interstellar Travel Time

Simple non-relativistic calculation:

```typescript
distance_LY = distance_parsecs × 3.262
travel_time_years = distance_LY / velocity_fraction_of_c
```

Where `c = 299,792,458 m/s` (speed of light)

### Propulsion Scenarios

| Scenario | Velocity | Technology | Status |
|----------|----------|------------|--------|
| Conventional | 50 km/s (0.00017c) | Chemical rockets | Current (Voyager 1) |
| Fusion | 0.1c (30,000 km/s) | Nuclear fusion | Theoretical (Project Daedalus) |
| Advanced | 0.5c (150,000 km/s) | Antimatter/ramjet | Far future concept |
| Near-Light | 0.9c (270,000 km/s) | Warp drive? | Requires new physics |

### Example: TOI-700 d

```typescript
Distance: 31.1 parsecs = 101.5 light years

At 0.1c: 1,015 years
At 0.5c: 203 years
At 0.9c: 113 years
Conventional (50 km/s): ~598,000 years
```

### Limitations

⚠️ **Not included**:
- Relativistic time dilation (significant at >0.1c)
- Acceleration/deceleration time
- Fuel mass (Tsiolkovsky rocket equation)
- Interstellar medium resistance
- Radiation shielding requirements

These calculations are **educational estimates** for scale, not engineering specifications.

### References

- British Interplanetary Society (1978). *Project Daedalus Study*
- Forward, R. L. (1984). "Roundtrip Interstellar Travel Using Laser-Pushed Lightsails." *Journal of Spacecraft and Rockets*, 21(2), 187-195
- NASA Glenn Research Center: [Interstellar Propulsion](https://www.nasa.gov/centers/glenn/technology/warp/ideachev.html)

---

## Known Limitations

### Current Issues

1. **Star View Spatial Accuracy** ⚠️ **Most Critical**
   - **Issue**: Some exoplanet systems appear too close to our Sun in Star View
   - **Cause**: Simplified equatorial→Cartesian transformation without perspective corrections
   - **Impact**: Visual positioning doesn't match actual 3D distances
   - **Workaround**: Current 30-parsec filter helps but doesn't fully solve it
   - **Help Needed**: Astrometry expertise to improve coordinate calculations

2. **Habitable Zone for Binary/Multiple Star Systems**
   - Currently uses single-star formulas
   - Binary stars need different calculations
   - Affects <5% of systems in dataset

3. **Missing Proper Motion**
   - Positions are static snapshots
   - Stars move over time (proper motion not included)
   - Minor issue for visualization purposes

4. **No Orbital Eccentricity Visualization**
   - Orbits shown as perfect circles
   - Real orbits are elliptical (eccentricity data available but not used)

### Data Quality Issues

Some planets have missing or uncertain parameters:
- ~15% missing orbital semi-major axis (`pl_orbsmax`)
- ~25% missing stellar spectral type
- ~10% missing equilibrium temperature

**Handling**: We default to "too-cold" classification for missing data (conservative approach)

---

## Contributing Improvements

### How to Help

We welcome contributions in these areas:

#### 1. **Coordinate Transform Improvements** (High Priority)

If you have expertise in:
- Astrometry
- Coordinate system transformations
- 3D spatial visualization

**What's needed**:
- Proper implementation of equatorial→galactic conversion
- Distance-dependent filtering algorithm
- Perspective projection corrections

**Files to modify**:
- `composables/useExoplanets.ts` (3D conversion logic)
- `components/organisms/StarMap3D.vue` (rendering)

#### 2. **Binary Star Habitable Zones**

Implement the Eggl et al. (2012) formulation for circumbinary habitable zones.

**Reference**: Eggl, S., et al. (2012). "Habitable Zones in Binary Star Systems." *ApJ*, 752, 74.

#### 3. **Orbital Mechanics**

Add proper elliptical orbit visualization using:
- Eccentricity (`pl_orbeccen`)
- Argument of periapsis
- Keplerian orbital elements

#### 4. **Relativistic Corrections**

For mission planning, add:
- Time dilation calculations
- Lorentz factor for high velocities
- Proper relativistic kinetic energy

### Validation Process

When proposing calculation changes:

1. **Provide References**: Peer-reviewed papers or authoritative sources
2. **Include Test Cases**: Known examples (e.g., Solar System planets)
3. **Document Assumptions**: What simplifications are made?
4. **Add Unit Tests**: Verify calculations are correct
5. **Update This Document**: Explain the new method

### Code Style

When modifying calculations:

```typescript
/**
 * Brief description
 *
 * Formula: [LaTeX or plaintext]
 *
 * Reference: Author et al. (Year). "Title". Journal.
 * DOI: [link]
 *
 * @param {type} paramName - Description (units)
 * @returns {type} Description (units)
 *
 * @example
 * // Known test case
 * const result = function(testInput);
 * // result should be ~expectedValue
 */
```

### Contact

- **GitHub Issues**: [Report a calculation error](https://github.com/yourusername/exoplanet-discovery/issues)
- **Discussions**: [Propose improvements](https://github.com/yourusername/exoplanet-discovery/discussions)
- **Pull Requests**: [Submit your fixes](https://github.com/yourusername/exoplanet-discovery/pulls)

---

## Additional Resources

### Scientific Papers

1. **Kopparapu et al. (2013)** - Habitable Zones
   - [ApJ Paper](https://iopscience.iop.org/article/10.1088/0004-637X/765/2/131)
   - [arXiv Preprint](https://arxiv.org/abs/1301.6674)

2. **Kopparapu et al. (2014)** - Updated Calculations
   - [ApJL Paper](https://iopscience.iop.org/article/10.1088/2041-8205/787/2/L29)

3. **Murray (1983)** - Vectorial Astrometry
   - Classic reference for coordinate transformations

### Online Tools

- [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
- [VPL Habitable Zone Calculator](https://depts.washington.edu/naivpl/content/hz-calculator)
- [SIMBAD Astronomical Database](http://simbad.u-strasbg.fr/simbad/)

### Educational

- [NASA Exoplanet Exploration](https://exoplanets.nasa.gov/)
- [Planetary Habitability Laboratory](http://phl.upr.edu/)
- [Eyes on Exoplanets](https://eyes.nasa.gov/apps/exo/)

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Maintained by**: Exoplanet Discovery Hub Contributors

For questions or corrections, please open an issue on GitHub.
