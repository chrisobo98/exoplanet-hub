/**
 * useExoplanets Composable
 *
 * Global state management and data operations for exoplanet exploration.
 *
 * This composable provides:
 * - Centralized data fetching from NASA Exoplanet Archive
 * - 3D coordinate calculation from celestial coordinates
 * - Habitable zone boundary calculations using Stefan-Boltzmann Law
 * - Planet habitability classification
 * - Computed statistics (total, habitable count, nearest distance, avg discovery year)
 *
 * Architecture:
 * - Singleton pattern: State is shared across all component instances
 * - Reactive refs: Automatically trigger UI updates when data changes
 * - Computed properties: Efficiently cache derived values
 *
 * Data Flow:
 * 1. Component calls fetchExoplanets()
 * 2. API proxy fetches from NASA TAP service
 * 3. Data enriched with 3D coordinates
 * 4. Reactive state updated
 * 5. All components auto-update via Vue reactivity
 *
 * @module composables/useExoplanets
 */

import { ref, computed } from "vue";
import axios from "axios";
import type {
  Exoplanet,
  HabitableZone,
  HabitableZoneBoundaries,
} from "@/types/exoplanet";

// ============================================================================
// GLOBAL REACTIVE STATE (Singleton Pattern)
// ============================================================================

/**
 * Exoplanet data array - shared across all component instances
 * Contains all TESS-discovered exoplanets with enriched 3D coordinates
 * @type {Ref<Exoplanet[]>}
 */
const exoplanets = ref<Exoplanet[]>([]);

/**
 * Loading state indicator
 * true: API request in progress
 * false: Idle or request complete
 * @type {Ref<boolean>}
 */
const loading = ref<boolean>(false);

/**
 * Error message from failed API requests
 * null: No error
 * string: User-friendly error message
 * @type {Ref<string | null>}
 */
const error = ref<string | null>(null);

// ============================================================================
// COMPOSABLE FUNCTION
// ============================================================================

/**
 * Main composable function providing exoplanet data and utilities
 *
 * Usage:
 * ```typescript
 * const { exoplanets, loading, stats, fetchExoplanets, isInHabitableZone } = useExoplanets();
 *
 * onMounted(async () => {
 *   if (exoplanets.value.length === 0) {
 *     await fetchExoplanets();
 *   }
 * });
 * ```
 *
 * @returns {Object} Composable API with state, computed properties, and methods
 */
export const useExoplanets = () => {
  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  /**
   * Fetch exoplanet data from NASA Exoplanet Archive
   *
   * Process:
   * 1. Set loading state
   * 2. Query NASA TAP service via our API proxy
   * 3. Enrich data with 3D Cartesian coordinates
   * 4. Update global reactive state
   * 5. Handle errors gracefully
   *
   * API Query:
   * - Table: ps (Planetary Systems)
   * - Filter: TESS discoveries only (disc_facility LIKE '%TESS%')
   * - Filter: Default parameters only (default_flag = 1)
   * - Fields: 20+ properties (identifiers, discovery, planetary, stellar, positional)
   *
   * Data Enrichment:
   * - Converts RA/Dec/Distance → X/Y/Z Cartesian coordinates
   * - Enables 3D visualization in StarMap3D component
   *
   * Error Handling:
   * - Logs detailed error to console for debugging
   * - Sets user-friendly error message
   * - Maintains app stability on failure
   *
   * @async
   * @returns {Promise<void>}
   * @throws {Error} On network failure or invalid API response
   */
  const fetchExoplanets = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Query NASA Exoplanet Archive via our server-side proxy
      const response = await axios.get("/api/exoplanets", {
        params: {
          query: `select pl_name, hostname, disc_year, disc_facility, discoverymethod,
                  pl_rade, pl_radj, pl_masse, pl_massj, pl_orbper, pl_orbsmax, pl_orbeccen, pl_eqt,
                  st_teff, st_rad, st_mass, st_spectype, st_age, st_met, st_logg, ra, dec, sy_dist
                  from ps
                  where disc_facility like '%TESS%' and default_flag = 1`,
        },
      });

      // Process and enrich the data with 3D coordinates
      exoplanets.value = response.data.map((planet: any) => {
        /**
         * 3D Coordinate Calculation
         *
         * Converts celestial coordinates (RA, Dec, Distance) to Cartesian (X, Y, Z)
         * for 3D visualization.
         *
         * Coordinate System:
         * - X axis: Points toward RA = 0°, Dec = 0° (Vernal Equinox)
         * - Y axis: Points toward RA = 90°, Dec = 0° (East)
         * - Z axis: Points toward North Celestial Pole (Dec = 90°)
         *
         * Formula:
         * X = distance × cos(dec) × cos(ra)
         * Y = distance × cos(dec) × sin(ra)
         * Z = distance × sin(dec)
         *
         * Units:
         * - Input distance: parsecs (from NASA API)
         * - Output coordinates: parsecs
         * - 1 parsec = 3.262 light years = 3.086×10¹³ km
         */
        const distance = planet.sy_dist || 0; // parsecs (default 0 if missing)
        const raRad = ((planet.ra || 0) * Math.PI) / 180; // Convert degrees to radians
        const decRad = ((planet.dec || 0) * Math.PI) / 180; // Convert degrees to radians

        return {
          ...planet, // Preserve all original NASA data
          // Add Cartesian coordinates for 3D visualization
          x: distance * Math.cos(decRad) * Math.cos(raRad),
          y: distance * Math.cos(decRad) * Math.sin(raRad),
          z: distance * Math.sin(decRad),
        };
      });
    } catch (err) {
      // Detailed error logging for debugging
      console.error(
        `[Exoplanet API] Error fetching exoplanet data: ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`,
        err
      );

      // User-friendly error message
      error.value = "Failed to fetch exoplanet data. Please try again later.";
    } finally {
      // Always reset loading state, even on error
      loading.value = false;
    }
  };

  // ==========================================================================
  // HABITABLE ZONE CALCULATIONS
  // ==========================================================================

  /**
   * Calculate habitable zone boundaries for a star
   *
   * Uses the Stefan-Boltzmann Law to determine where liquid water could exist
   * on a planet's surface based on stellar properties.
   *
   * Scientific Background:
   * - Habitable Zone: Distance range where water remains liquid (0-100°C)
   * - Too close: Runaway greenhouse effect (like Venus)
   * - Too far: Water freezes (like Mars)
   *
   * Formula Derivation:
   * 1. Calculate stellar luminosity relative to Sun:
   *    L = (R_star / R_sun)² × (T_star / T_sun)⁴
   *
   * 2. Calculate boundaries in AU:
   *    Inner = √(L / 1.1)   - Runaway greenhouse limit
   *    Outer = √(L / 0.53)  - Maximum greenhouse limit
   *
   * Constants Explained:
   * - 5778K: Sun's effective temperature (reference)
   * - 1.1: Runaway greenhouse flux ratio
   * - 0.53: Maximum greenhouse flux ratio
   *
   * Reference:
   * Kopparapu et al. (2013) "Habitable Zones around Main-sequence Stars"
   *
   * @param {number} stellarRadius - Stellar radius in Solar radii (R☉)
   * @param {number} stellarTemp - Stellar effective temperature in Kelvin
   * @returns {HabitableZoneBoundaries} Object with inner/outer boundaries (AU) and luminosity
   *
   * @example
   * // Sun-like star (G2V)
   * const hz = calculateHabitableZone(1.0, 5778);
   * // hz.innerBoundary ≈ 0.95 AU
   * // hz.outerBoundary ≈ 1.37 AU
   * // hz.luminosity ≈ 1.0 L☉
   *
   * @example
   * // Red dwarf (M-type)
   * const hz = calculateHabitableZone(0.5, 3500);
   * // hz.innerBoundary ≈ 0.18 AU (much closer!)
   * // hz.outerBoundary ≈ 0.25 AU
   * // hz.luminosity ≈ 0.04 L☉ (much dimmer)
   */
  const calculateHabitableZone = (
    stellarRadius: number,
    stellarTemp: number
  ): HabitableZoneBoundaries => {
    /**
     * Step 1: Calculate stellar luminosity using Stefan-Boltzmann Law
     *
     * L = 4π R² σ T⁴
     *
     * Since we're calculating relative to the Sun, constants cancel out:
     * L_relative = (R_star / R_sun)² × (T_star / T_sun)⁴
     *
     * For the Sun: R=1, T=5778K → L=1 (by definition)
     */
    const luminosity =
      Math.pow(stellarRadius, 2) * Math.pow(stellarTemp / 5778, 4);

    /**
     * Step 2: Calculate habitable zone boundaries
     *
     * Conservative estimate using empirical flux limits:
     * - Inner boundary: Recent Venus (runaway greenhouse threshold)
     * - Outer boundary: Early Mars (maximum greenhouse threshold)
     */

    // Inner boundary: Runaway greenhouse limit (1.1× solar flux)
    const innerBoundary = Math.sqrt(luminosity / 1.1);

    // Outer boundary: Maximum greenhouse limit (0.53× solar flux)
    const outerBoundary = Math.sqrt(luminosity / 0.53);

    return { innerBoundary, outerBoundary, luminosity };
  };

  /**
   * Determine if a planet is in the habitable zone
   *
   * Classifies a planet's orbital distance relative to its star's habitable zone.
   *
   * Classification:
   * - 'habitable': Planet orbit within habitable zone (liquid water possible)
   * - 'too-hot': Planet too close to star (water evaporates)
   * - 'too-cold': Planet too far from star (water freezes)
   *
   * Function Overloads:
   * 1. isInHabitableZone(planet) - Calculate boundaries from planet's stellar data
   * 2. isInHabitableZone(planet, inner, outer) - Use pre-calculated boundaries
   *
   * Overload #2 is useful when analyzing multiple planets in the same system
   * to avoid recalculating boundaries repeatedly.
   *
   * @param {Exoplanet} planet - Planet object with orbital and stellar properties
   * @param {number} [innerBoundary] - Optional pre-calculated inner boundary (AU)
   * @param {number} [outerBoundary] - Optional pre-calculated outer boundary (AU)
   * @returns {HabitableZone} Classification: 'habitable' | 'too-hot' | 'too-cold'
   *
   * @example
   * // Automatic boundary calculation
   * const zone = isInHabitableZone(planet);
   *
   * @example
   * // Pre-calculated boundaries (more efficient for same system)
   * const { innerBoundary, outerBoundary } = calculateHabitableZone(st_rad, st_teff);
   * const zone1 = isInHabitableZone(planet1, innerBoundary, outerBoundary);
   * const zone2 = isInHabitableZone(planet2, innerBoundary, outerBoundary);
   */
  const isInHabitableZone = (
    planet: Exoplanet,
    innerBoundary?: number,
    outerBoundary?: number
  ): HabitableZone => {
    // If boundaries not provided, calculate them from planet's stellar properties
    let inner = innerBoundary;
    let outer = outerBoundary;

    if (inner === undefined || outer === undefined) {
      const { st_rad, st_teff } = planet;

      // Return 'too-cold' if stellar data is missing (conservative choice)
      // Most planets with missing stellar data are likely inhospitable
      if (typeof st_rad !== "number" || typeof st_teff !== "number") {
        return "too-cold";
      }

      // Calculate boundaries from stellar properties
      const boundaries = calculateHabitableZone(st_rad, st_teff);
      inner = boundaries.innerBoundary;
      outer = boundaries.outerBoundary;
    }

    // Get planet's orbital distance (semi-major axis in AU)
    const distance = planet.pl_orbsmax;

    // Classify based on orbital distance relative to boundaries
    if (distance < inner) return "too-hot"; // Like Mercury or Venus
    if (distance > outer) return "too-cold"; // Like Mars or beyond
    return "habitable"; // Goldilocks zone!
  };

  // ==========================================================================
  // COMPUTED STATISTICS
  // ==========================================================================

  /**
   * Computed statistics derived from exoplanet data
   *
   * Automatically recalculates when exoplanets array changes.
   * Vue's computed() caches the result until dependencies change.
   *
   * Statistics:
   * - total: Count of all fetched exoplanets
   * - habitable: Count in habitable zone
   * - nearestDistance: Distance to nearest exoplanet (parsecs, converted to ly in UI)
   * - avgDiscoveryYear: Average discovery year (rounded)
   *
   * Performance:
   * - Cached by Vue's reactivity system
   * - Only recalculates when exoplanets.value changes
   * - Filter operations are O(n) but cached
   *
   * @type {ComputedRef<Object>}
   */
  const stats = computed(() => ({
    /**
     * Total number of exoplanets in dataset
     * Simple array length
     */
    total: exoplanets.value.length,

    /**
     * Number of planets in habitable zone
     *
     * Process:
     * 1. Filter planets with valid stellar data
     * 2. Calculate habitable zone for each star
     * 3. Check if planet's orbit falls within zone
     * 4. Count matches
     *
     * Note: Conservative calculation - requires valid st_rad and st_teff
     */
    habitable: exoplanets.value.filter((p) => {
      // Use stellar radius and temperature from each planet's host star
      const { st_rad, st_teff } = p;

      // Skip planets with missing stellar data
      if (typeof st_rad !== "number" || typeof st_teff !== "number")
        return false;

      // Calculate habitable zone boundaries for this star
      const { innerBoundary, outerBoundary } = calculateHabitableZone(
        st_rad,
        st_teff
      );

      // Check if planet is in the habitable zone
      return isInHabitableZone(p, innerBoundary, outerBoundary) === "habitable";
    }).length,

    /**
     * Distance to nearest exoplanet system
     *
     * Process:
     * 1. Filter out planets with invalid distance data
     * 2. Find minimum distance
     * 3. Return in parsecs (convert to light years in UI: parsecs × 3.262)
     *
     * Edge Cases:
     * - Returns 0 if no planets
     * - Filters NaN and non-number values
     *
     * Units: parsecs (1 parsec = 3.262 light years)
     */
    nearestDistance:
      exoplanets.value.length > 0
        ? Math.min(
            ...exoplanets.value
              .filter((p) => typeof p.sy_dist === "number" && !isNaN(p.sy_dist))
              .map((p) => p.sy_dist as number)
          )
        : 0,

    /**
     * Average discovery year across all exoplanets
     *
     * Process:
     * 1. Extract discovery years
     * 2. Convert to numbers and filter invalid values
     * 3. Calculate mean
     * 4. Round to nearest integer
     *
     * Edge Cases:
     * - Returns 0 if no valid years
     * - Handles string years (converts to number)
     * - Filters NaN values
     *
     * Uses IIFE (Immediately Invoked Function Expression) for multi-step calculation
     */
    avgDiscoveryYear: (() => {
      const validYears = exoplanets.value
        .map((p) => Number(p.disc_year))
        .filter((year) => !isNaN(year));

      return validYears.length > 0
        ? Math.round(
            validYears.reduce((sum, year) => sum + year, 0) / validYears.length
          )
        : 0;
    })(),
  }));

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Return composable API
   *
   * Exports:
   * - Reactive state: exoplanets, loading, error
   * - Computed properties: stats
   * - Methods: fetchExoplanets, calculateHabitableZone, isInHabitableZone
   */
  return {
    exoplanets,
    loading,
    error,
    stats,
    fetchExoplanets,
    calculateHabitableZone,
    isInHabitableZone,
  };
};
