# API Documentation

## Overview

The Exoplanet Discovery Hub uses a server-side API proxy to fetch data from NASA's Exoplanet Archive. This document provides comprehensive information about the API structure, endpoints, data models, and usage patterns.

---

## Table of Contents

1. [Architecture](#architecture)
2. [NASA Exoplanet Archive API](#nasa-exoplanet-archive-api)
3. [Internal API Endpoints](#internal-api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Usage Examples](#usage-examples)

---

## Architecture

### Request Flow

```
Client Component
    ↓
composables/useExoplanets.ts (fetchExoplanets)
    ↓
axios.get('/api/exoplanets')
    ↓
server/api/exoplanets.ts (Nuxt API route)
    ↓
NASA Exoplanet Archive TAP Service
    ↓
Response flows back through the stack
```

### Why Use a Proxy?

1. **CORS Handling**: Browser restrictions on cross-origin requests
2. **Query Sanitization**: Server-side validation of SQL queries
3. **Error Handling**: Centralized error management
4. **Future Caching**: Easy to add Redis/memory caching
5. **Security**: Hide API implementation details from client

---

## NASA Exoplanet Archive API

### Base URL
```
https://exoplanetarchive.ipac.caltech.edu/TAP/sync
```

### Protocol
**TAP (Table Access Protocol)** - A standard protocol for querying astronomical databases using SQL-like syntax.

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | SQL query in ADQL (Astronomical Data Query Language) |
| `format` | string | Yes | Response format (`json`, `csv`, `xml`, `votable`) |

### Available Tables

#### `ps` (Planetary Systems)
The main table containing confirmed exoplanet data. Each row represents one planet with its properties.

**Key Fields:**

| Field | Type | Unit | Description | Example |
|-------|------|------|-------------|---------|
| `pl_name` | string | - | Planet name | "TOI-700 d" |
| `hostname` | string | - | Host star name | "TOI-700" |
| `disc_year` | integer | years | Discovery year | 2020 |
| `disc_facility` | string | - | Discovery facility | "TESS" |
| `discoverymethod` | string | - | Detection method | "Transit" |
| `pl_rade` | float | R⊕ | Planet radius (Earth radii) | 1.19 |
| `pl_radj` | float | R♃ | Planet radius (Jupiter radii) | 0.106 |
| `pl_masse` | float | M⊕ | Planet mass (Earth masses) | 1.72 |
| `pl_massj` | float | M♃ | Planet mass (Jupiter masses) | 0.0054 |
| `pl_orbper` | float | days | Orbital period | 37.42 |
| `pl_orbsmax` | float | AU | Semi-major axis | 0.163 |
| `pl_orbeccen` | float | - | Orbital eccentricity (0-1) | 0.0 |
| `pl_eqt` | float | K | Equilibrium temperature | 269.3 |
| `st_teff` | float | K | Stellar temperature | 3480 |
| `st_rad` | float | R☉ | Stellar radius (Solar radii) | 0.42 |
| `st_mass` | float | M☉ | Stellar mass (Solar masses) | 0.415 |
| `st_spectype` | string | - | Spectral classification | "M2V" |
| `ra` | float | degrees | Right ascension | 106.393 |
| `dec` | float | degrees | Declination | -65.155 |
| `sy_dist` | float | parsecs | Distance from Earth | 31.13 |

### Detection Methods

| Method | Description | TESS Usage |
|--------|-------------|------------|
| **Transit** | Planet passes in front of star, dimming light | Primary method (~95%) |
| **Radial Velocity** | Star's wobble detected via Doppler shift | Confirmation method |
| **Transit Timing Variations** | Planet's gravity affects other planets' orbits | Secondary discovery |

### Stellar Spectral Types

| Type | Color | Temp (K) | Example | Relative Size |
|------|-------|----------|---------|---------------|
| **O** | Blue | 30,000+ | - | Massive |
| **B** | Blue-white | 10,000-30,000 | Rigel | Very large |
| **A** | White | 7,500-10,000 | Sirius | Large |
| **F** | Yellow-white | 6,000-7,500 | Procyon | Medium-large |
| **G** | Yellow | 5,200-6,000 | Sun | Medium |
| **K** | Orange | 3,700-5,200 | Arcturus | Medium-small |
| **M** | Red | 2,400-3,700 | Proxima Centauri | Small (most common) |

**Note**: Most TESS discoveries are around M and K type stars (cooler, smaller) because they're easier to detect transits around.

---

## Internal API Endpoints

### GET `/api/exoplanets`

Fetches exoplanet data from NASA's archive with optional query customization.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Custom SQL query (defaults to TESS discoveries) |

**Example Request:**
```typescript
axios.get('/api/exoplanets', {
  params: {
    query: `
      SELECT pl_name, hostname, disc_year, st_teff, sy_dist
      FROM ps
      WHERE disc_facility LIKE '%TESS%' AND default_flag = 1
    `
  }
})
```

#### Response

**Success (200 OK):**
```json
[
  {
    "pl_name": "TOI-700 d",
    "hostname": "TOI-700",
    "disc_year": 2020,
    "disc_facility": "Transiting Exoplanet Survey Satellite (TESS)",
    "discoverymethod": "Transit",
    "pl_rade": 1.19,
    "pl_radj": 0.106,
    "pl_masse": 1.72,
    "pl_massj": 0.0054,
    "pl_orbper": 37.42,
    "pl_orbsmax": 0.163,
    "pl_orbeccen": 0.0,
    "pl_eqt": 269.3,
    "st_teff": 3480,
    "st_rad": 0.42,
    "st_mass": 0.415,
    "st_spectype": "M2V",
    "ra": 106.393,
    "dec": -65.155,
    "sy_dist": 31.13,
    "x": 8.52,
    "y": 29.36,
    "z": -28.12
  },
  ...
]
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch exoplanet data",
  "details": "ORA-00904: 'INVALID_FIELD': invalid identifier"
}
```

#### Response Headers
```
Content-Type: application/json
Cache-Control: public, max-age=3600
```

---

## Data Models

### TypeScript Interfaces

#### Exoplanet
```typescript
export interface Exoplanet {
  // ==========================================
  // IDENTIFIERS
  // ==========================================
  pl_name: string;      // Official IAU planet designation
  hostname: string;     // Host star name

  // ==========================================
  // DISCOVERY INFORMATION
  // ==========================================
  disc_year: number;         // Year of discovery
  disc_facility: string;     // Facility/telescope that discovered it
  discoverymethod: string;   // Detection method used

  // ==========================================
  // PLANETARY PROPERTIES
  // ==========================================
  pl_rade: number;      // Radius in Earth radii (R⊕)
  pl_radj: number;      // Radius in Jupiter radii (R♃)
  pl_masse: number;     // Mass in Earth masses (M⊕)
  pl_massj: number;     // Mass in Jupiter masses (M♃)
  pl_orbper: number;    // Orbital period in days
  pl_orbsmax: number;   // Semi-major axis in AU
  pl_orbeccen: number;  // Orbital eccentricity (0 = circular)
  pl_eqt: number;       // Equilibrium temperature in Kelvin

  // ==========================================
  // STELLAR PROPERTIES
  // ==========================================
  st_teff: number;      // Stellar effective temperature (K)
  st_rad: number;       // Stellar radius (Solar radii)
  st_mass: number;      // Stellar mass (Solar masses)
  st_spectype: string;  // Spectral classification (e.g., "M2V", "G2V")

  // ==========================================
  // POSITIONAL DATA
  // ==========================================
  ra: number;           // Right ascension (degrees, 0-360)
  dec: number;          // Declination (degrees, -90 to +90)
  sy_dist: number;      // Distance from Earth (parsecs)

  // ==========================================
  // CALCULATED PROPERTIES (client-side)
  // ==========================================
  x?: number;           // Cartesian X coordinate (parsecs)
  y?: number;           // Cartesian Y coordinate (parsecs)
  z?: number;           // Cartesian Z coordinate (parsecs)
}
```

#### HabitableZone
```typescript
export type HabitableZone = 'habitable' | 'too-hot' | 'too-cold';
```

#### HabitableZoneBoundaries
```typescript
export interface HabitableZoneBoundaries {
  innerBoundary: number;  // Inner edge in AU (runaway greenhouse limit)
  outerBoundary: number;  // Outer edge in AU (maximum greenhouse limit)
  luminosity: number;     // Stellar luminosity (Solar luminosities)
}
```

### Coordinate System Conversions

#### Celestial to Cartesian
Converts astronomical coordinates (RA, Dec, Distance) to 3D Cartesian coordinates for visualization.

```typescript
/**
 * Convert celestial coordinates to Cartesian (X, Y, Z)
 *
 * Input:
 * - ra: Right Ascension (degrees, 0-360)
 * - dec: Declination (degrees, -90 to +90)
 * - distance: Distance from Earth (parsecs)
 *
 * Output:
 * - x, y, z: Cartesian coordinates (parsecs)
 *
 * Coordinate System:
 * - X axis: Points toward RA = 0°, Dec = 0°
 * - Y axis: Points toward RA = 90°, Dec = 0°
 * - Z axis: Points toward North Celestial Pole (Dec = 90°)
 */
function celestialToCartesian(ra: number, dec: number, distance: number) {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;

  return {
    x: distance * Math.cos(decRad) * Math.cos(raRad),
    y: distance * Math.cos(decRad) * Math.sin(raRad),
    z: distance * Math.sin(decRad),
  };
}
```

#### Distance Units
```typescript
// Parsecs to Light Years
const lightYears = parsecs * 3.262;

// Parsecs to Kilometers
const km = parsecs * 3.086e13;

// AU to Kilometers
const km = au * 1.496e8;
```

---

## Error Handling

### Common Errors

#### Invalid Field Name
```json
{
  "error": "Failed to fetch exoplanet data",
  "details": "ORA-00904: 'DISC_METHOD': invalid identifier"
}
```
**Cause**: Using incorrect field name (e.g., `disc_method` instead of `discoverymethod`)

**Solution**: Check field names against the ps table schema

#### Syntax Error
```json
{
  "error": "Failed to fetch exoplanet data",
  "details": "Encountered \" \"FROM\" \"FROM \"\" at line 1, column 8."
}
```
**Cause**: Invalid SQL syntax in query

**Solution**: Validate SQL query before sending

#### Network Timeout
```json
{
  "error": "Failed to fetch exoplanet data",
  "details": "ETIMEDOUT"
}
```
**Cause**: NASA API is slow or unresponsive

**Solution**: Implement retry logic with exponential backoff

### Client-Side Error Handling

```typescript
try {
  const response = await axios.get('/api/exoplanets', { params });
  exoplanets.value = response.data;
} catch (err) {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 500) {
      error.value = 'Server error: ' + err.response.data.details;
    } else if (err.code === 'ECONNABORTED') {
      error.value = 'Request timeout. Please try again.';
    } else {
      error.value = 'Failed to fetch data.';
    }
  }
  console.error('Error fetching exoplanet data:', err);
}
```

---

## Rate Limiting

### NASA Exoplanet Archive
- **Rate Limit**: Not officially documented, but recommended to limit to 1 request/second
- **Concurrent Requests**: Avoid more than 3 simultaneous requests
- **Best Practice**: Cache results on server-side for 1 hour

### Future Implementation
```typescript
// Example Redis caching strategy
const CACHE_TTL = 3600; // 1 hour

async function fetchWithCache(query: string) {
  const cacheKey = `exoplanets:${hashQuery(query)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from NASA
  const data = await fetchFromNASA(query);

  // Store in cache
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

  return data;
}
```

---

## Usage Examples

### Basic Fetch (Default TESS Data)
```typescript
import { useExoplanets } from '@/composables/useExoplanets';

const { exoplanets, loading, error, fetchExoplanets } = useExoplanets();

onMounted(async () => {
  if (exoplanets.value.length === 0) {
    await fetchExoplanets();
  }
});
```

### Custom Query
```typescript
// Fetch only habitable zone candidates
const response = await axios.get('/api/exoplanets', {
  params: {
    query: `
      SELECT pl_name, hostname, pl_rade, pl_orbsmax, st_teff, st_rad
      FROM ps
      WHERE disc_facility LIKE '%TESS%'
        AND default_flag = 1
        AND pl_rade BETWEEN 0.5 AND 2.0
        AND pl_eqt BETWEEN 200 AND 350
    `
  }
});
```

### Filter by Discovery Year
```typescript
const response = await axios.get('/api/exoplanets', {
  params: {
    query: `
      SELECT *
      FROM ps
      WHERE disc_facility LIKE '%TESS%'
        AND disc_year >= 2022
        AND default_flag = 1
      ORDER BY disc_year DESC
    `
  }
});
```

### Filter by Distance
```typescript
// Planets within 100 parsecs (326 light years)
const response = await axios.get('/api/exoplanets', {
  params: {
    query: `
      SELECT *
      FROM ps
      WHERE disc_facility LIKE '%TESS%'
        AND sy_dist < 100
        AND default_flag = 1
      ORDER BY sy_dist ASC
    `
  }
});
```

### Complex Multi-Filter Query
```typescript
const response = await axios.get('/api/exoplanets', {
  params: {
    query: `
      SELECT *
      FROM ps
      WHERE disc_facility LIKE '%TESS%'
        AND default_flag = 1
        AND st_spectype LIKE 'M%'      -- Red dwarf stars
        AND pl_rade < 2.0               -- Super-Earths or smaller
        AND sy_dist < 50                -- Within 163 light years
        AND pl_eqt BETWEEN 200 AND 350  -- Potentially habitable temperature
      ORDER BY sy_dist ASC
    `
  }
});
```

---

## Performance Tips

### 1. Select Only Needed Fields
```typescript
// BAD - Fetches all columns
SELECT * FROM ps WHERE ...

// GOOD - Fetches only what you need
SELECT pl_name, hostname, sy_dist FROM ps WHERE ...
```

### 2. Use Efficient Filtering
```typescript
// BAD - Returns all data, filters client-side
SELECT * FROM ps

// GOOD - Filters server-side
SELECT * FROM ps WHERE disc_facility LIKE '%TESS%'
```

### 3. Limit Results
```typescript
// Get top 100 nearest systems
SELECT * FROM ps WHERE ... ORDER BY sy_dist ASC LIMIT 100
```

---

## Related Documentation

- [NASA Exoplanet Archive TAP Documentation](https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html)
- [ADQL (Astronomical Data Query Language) Reference](https://www.ivoa.net/documents/ADQL/20180112/PR-ADQL-2.1-20180112.html)
- [TESS Mission Overview](https://tess.mit.edu/)

---

**Last Updated**: December 2025
**API Version**: 1.0
**Maintained by**: Exoplanet Discovery Hub Team
