export interface Exoplanet {
  // Identifiers
  pl_name: string;
  hostname: string;

  // Discovery
  disc_year: number;
  disc_facility: string;
  disc_method: string;

  // Planetary properties
  pl_rade: number; // Planet radius (Earth radii)
  pl_radj: number; // Planet radius (Jupiter radii)
  pl_masse: number; // Planet mass (Earth masses)
  pl_massj: number; // Planet mass (Jupiter masses)
  pl_orbper: number; // Orbital period (days)
  pl_orbsmax: number; // Semi-major axis (AU)
  pl_orbeccen: number; // Eccentricity
  pl_eqt: number; // Equilibrium temperature (K)

  // Stellar properties
  st_teff: number; // Stellar effective temperature (K)
  st_rad: number; // Stellar radius (Solar radii)
  st_mass: number; // Stellar mass (Solar masses)
  st_spectype: string; // Stellar spectral type

  // Positional data
  ra: number; // Right ascension
  dec: number; // Declination
  sy_dist: number; // Distance (parsecs)

  // Calculated properties
  x?: number; // 3D coordinates
  y?: number;
  z?: number;
}

export type HabitableZone = 'habitable' | 'too-hot' | 'too-cold';

export interface HabitableZoneBoundaries {
  innerBoundary: number; // AU
  outerBoundary: number; // AU
  luminosity: number; // Solar luminosities
}
  