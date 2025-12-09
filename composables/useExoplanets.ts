import { ref, computed } from 'vue';
import axios from 'axios';
import type { Exoplanet, HabitableZone, HabitableZoneBoundaries } from '@/types/exoplanet';

const exoplanets = ref<Exoplanet[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

export const useExoplanets = () => {
  const fetchExoplanets = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get('/api/exoplanets', {
        params: {
          query: `select pl_name, hostname, disc_year, disc_facility, disc_method,
                  pl_rade, pl_radj, pl_masse, pl_massj, pl_orbper, pl_orbsmax, pl_orbeccen, pl_eqt,
                  st_teff, st_rad, st_mass, st_spectype, ra, dec, sy_dist
                  from ps
                  where disc_facility like '%TESS%' and default_flag = 1`,
        }
      });

      // Process and enrich the data
      exoplanets.value = response.data.map((planet: any) => {
        // Calculate 3D coordinates from RA, Dec, and distance
        const distance = planet.sy_dist || 0; // parsecs
        const raRad = (planet.ra || 0) * Math.PI / 180;
        const decRad = (planet.dec || 0) * Math.PI / 180;

        return {
          ...planet,
          // Convert to Cartesian coordinates (scaled for visualization)
          x: distance * Math.cos(decRad) * Math.cos(raRad),
          y: distance * Math.cos(decRad) * Math.sin(raRad),
          z: distance * Math.sin(decRad),
        };
      });
    } catch (err) {
      console.error('Error fetching exoplanet data', err);
      error.value = 'Failed to fetch exoplanet data';
    } finally {
      loading.value = false;
    }
  };

  // Calculate habitable zone boundaries
  const calculateHabitableZone = (stellarRadius: number, stellarTemp: number): HabitableZoneBoundaries => {
    // Stefan-Boltzmann law: L = 4π R² σ T⁴
    // Luminosity relative to Sun
    const luminosity = Math.pow(stellarRadius, 2) * Math.pow(stellarTemp / 5778, 4);

    // Simple habitable zone calculation (conservative estimate)
    // Inner boundary: runaway greenhouse
    const innerBoundary = Math.sqrt(luminosity / 1.1);
    // Outer boundary: maximum greenhouse
    const outerBoundary = Math.sqrt(luminosity / 0.53);

    return { innerBoundary, outerBoundary, luminosity };
  };

  // Determine if planet is in habitable zone
  const isInHabitableZone = (planet: Exoplanet): HabitableZone => {
    const { innerBoundary, outerBoundary } = calculateHabitableZone(planet.st_rad, planet.st_teff);
    const distance = planet.pl_orbsmax;

    if (distance < innerBoundary) return 'too-hot';
    if (distance > outerBoundary) return 'too-cold';
    return 'habitable';
  };

  // Computed statistics
  const stats = computed(() => ({
    total: exoplanets.value.length,
    habitable: exoplanets.value.filter(p => isInHabitableZone(p) === 'habitable').length,
    nearestDistance: exoplanets.value.length > 0
      ? Math.min(...exoplanets.value.map(p => p.sy_dist * 3.262)) // Convert parsecs to light years
      : 0,
    avgDiscoveryYear: exoplanets.value.length > 0
      ? Math.round(exoplanets.value.reduce((sum, p) => sum + p.disc_year, 0) / exoplanets.value.length)
      : 0,
  }));

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
