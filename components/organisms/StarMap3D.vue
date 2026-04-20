<!--
  StarMap3D Component (Organism) - Three.js Implementation

  Professional 3D visualization of TESS-discovered exoplanets using Three.js.
  Inspired by NASA's Exoplanet Catalog visualization.

  Features:
  - True 3D rendering with WebGL (Three.js)
  - Mouse wheel zoom
  - Interactive camera controls (orbit controls)
  - Multiple view modes: Star View, System View
  - Planetary orbits visualization
  - Habitable zone indicators
  - Label system with toggle
  - Fullscreen mode
  - Settings panel overlay
  - Distance indicators

  Views:
  - Star View: Shows all exoplanet systems in 3D space
  - System View: Focuses on one system with orbits

  Technical:
  - Three.js for 3D rendering
  - OrbitControls for camera manipulation
  - CSS2DRenderer for labels
  - Responsive and performant
-->
<template>
  <!-- Loading State -->
  <div
    v-if="loading"
    class="flex items-center justify-center min-h-[600px]"
  >
    <div class="text-center">
      <div
        class="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"
      ></div>
      <p class="text-purple-300 text-lg">Loading 3D star map...</p>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else class="space-y-4">
    <!-- Work in Progress Notice -->
    <div
      class="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-4"
    >
      <div class="flex items-start gap-3">
        <Info class="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
        <div class="flex-1">
          <h3 class="text-white text-lg font-semibold mb-2 flex items-center gap-2">
            ⚠️ Work in Progress
          </h3>
          <div class="text-yellow-100 text-sm space-y-2">
            <p>
              <strong>Known Issue:</strong> Star View preserves each system's direction in space,
              but radial distances are non-linearly expanded so dense nearby regions do not overlap.
            </p>
            <details class="mt-2">
              <summary class="cursor-pointer text-yellow-200 hover:text-yellow-100 font-medium">
                View Technical Details & Calculations
              </summary>
              <div class="mt-2 space-y-2 text-xs text-yellow-100/90 bg-black/20 p-3 rounded">
                <p><strong>Habitable Zone:</strong> Kopparapu et al. (2013) formulation</p>
                <p><strong>Coordinates:</strong> RA/Dec/Distance → Cartesian (X, Y, Z)</p>
                <p><strong>Star View Filter:</strong> Only showing systems >30 parsecs (~98 ly) from Sun</p>
                <p><strong>Star View Display:</strong> Radial distances use a non-linear display scale while preserving sky direction</p>
                <p><strong>Solar Reference:</strong> Earth orbits our Sun in Star View for scale context</p>
                <p><strong>System View Scaling:</strong> Non-linear orbit display with star clearance plus √AU spacing</p>
                <p><strong>Reference:</strong> <a href="https://iopscience.iop.org/article/10.1088/0004-637X/765/2/131" target="_blank" class="underline">ApJ 765, 131 (2013)</a></p>
                <p class="text-yellow-200 mt-2">
                  <strong>Contributing:</strong> This is open source! Help us improve the calculations on GitHub.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions Banner -->
    <div
      class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4"
    >
      <div class="flex items-start gap-3">
        <Info class="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
        <div>
          <h3 class="text-white text-lg font-semibold mb-1">
            Interactive 3D Star Map
          </h3>
          <p class="text-purple-200 text-sm">
            <strong>Drag</strong> to rotate • <strong>Scroll</strong> to zoom • <strong>Right-click + drag</strong> to pan • <strong>Click planets</strong> to view their system
          </p>
        </div>
      </div>
    </div>

    <!-- Main Visualization Container -->
    <div class="relative bg-black/50 backdrop-blur-sm border border-purple-500/20 rounded-lg overflow-hidden">
      <!-- Three.js Canvas Container -->
      <div ref="containerRef" class="w-full h-[700px] relative">
        <!-- Controls Overlay - Top Right -->
        <div class="absolute top-4 right-4 z-10 space-y-2">
          <!-- View Mode Selector -->
          <div class="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg p-3 space-y-2">
            <div class="text-white text-xs font-semibold mb-2">VIEW MODE</div>
            <button
              @click="setViewMode('star')"
              :class="[
                'w-full px-3 py-1.5 text-sm rounded transition-colors',
                viewMode === 'star'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
              ]"
            >
              Star View
            </button>
            <button
              @click="setViewMode('system')"
              :class="[
                'w-full px-3 py-1.5 text-sm rounded transition-colors',
                viewMode === 'system'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
              ]"
            >
              System View
            </button>
          </div>

          <!-- System Selector (only in System View) -->
          <div
            v-if="viewMode === 'system'"
            class="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg p-3"
          >
            <div class="text-white text-xs font-semibold mb-2">SYSTEM</div>
            <select
              v-model="selectedSystem"
              class="w-full bg-purple-950/80 border border-purple-500/30 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-400"
            >
              <option v-for="system in systems" :key="system" :value="system">
                {{ system }}
              </option>
            </select>
          </div>

          <!-- Settings Panel -->
          <div class="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg p-3 space-y-2">
            <div class="text-white text-xs font-semibold mb-2">SETTINGS</div>

            <!-- Labels Toggle -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="showLabels"
                type="checkbox"
                class="w-4 h-4 rounded border-purple-500/30 bg-purple-950/50 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span class="text-purple-200 text-sm">Labels</span>
            </label>

            <!-- Orbits Toggle (System View only) -->
            <label
              v-if="viewMode === 'system'"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                v-model="showOrbits"
                type="checkbox"
                class="w-4 h-4 rounded border-purple-500/30 bg-purple-950/50 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span class="text-purple-200 text-sm">Orbits</span>
            </label>

            <!-- Habitable Zone Toggle (System View only) -->
            <label
              v-if="viewMode === 'system'"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                v-model="showHabitableZone"
                type="checkbox"
                class="w-4 h-4 rounded border-purple-500/30 bg-purple-950/50 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span class="text-purple-200 text-sm">Habitable Zone</span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg p-2 space-y-2">
            <button
              @click="resetCamera"
              class="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              <RotateCcw class="w-4 h-4" />
              Reset
            </button>
            <button
              @click="toggleFullscreen"
              class="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              <Maximize2 class="w-4 h-4" />
              Fullscreen
            </button>
          </div>
        </div>

        <!-- Legend - Bottom Left -->
        <div class="absolute bottom-4 left-4 z-10">
          <div class="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg p-3 space-y-1.5">
            <div class="text-white text-xs font-semibold mb-1">LEGEND</div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span class="text-purple-200 text-xs">Our Sun</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <span class="text-purple-200 text-xs">Habitable</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <span class="text-purple-200 text-xs">Too Hot</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-blue-400"></div>
              <span class="text-purple-200 text-xs">Too Cold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Info, RotateCcw, Maximize2 } from "lucide-vue-next";
import { useExoplanets } from "@/composables/useExoplanets";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const props = withDefaults(
  defineProps<{
    selectedPlanetName?: string;
    selectedSystemName?: string;
  }>(),
  {
    selectedPlanetName: "",
    selectedSystemName: "",
  }
);

const emit = defineEmits<{
  (e: "planet-selected", payload: { planetName: string; systemName: string }): void;
  (e: "selection-cleared"): void;
}>();

// ============================================================================
// COMPOSABLE & STATE
// ============================================================================

const { exoplanets, loading, fetchExoplanets, isInHabitableZone, calculateHabitableZone } =
  useExoplanets();

// ============================================================================
// REFS
// ============================================================================

const containerRef = ref<HTMLDivElement | null>(null);

// Three.js core objects
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationFrameId: number;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let interactablePlanets: THREE.Object3D[] = [];
let earthOrbitAngle = 0;
const focusedPlanetName = ref<string | null>(null);
const lastAppliedExternalSelectionKey = ref("");

// Label tracking
const labels: Map<string, HTMLDivElement> = new Map();
const hoveredPlanet = ref<string | null>(null);

// ============================================================================
// VIEW STATE
// ============================================================================

const viewMode = ref<"star" | "system">("star");
const selectedSystem = ref<string>("");
const showLabels = ref(true);
const showOrbits = ref(true);
const showHabitableZone = ref(true);

const AU_SCALING_FACTOR = 40;
const STAR_VIEW_PLANET_RADIUS = 1.2;
const STAR_VIEW_MIN_DISTANCE_PARSECS = 30;
const STAR_VIEW_BASE_DISTANCE = 140;
const STAR_VIEW_DISTANCE_CURVE = 34;
const STAR_VIEW_CAMERA_Y = 80;
const STAR_VIEW_CAMERA_Z = 700;
const SYSTEM_VIEW_STAR_CLEARANCE = 22;
const SYSTEM_VIEW_DISTANCE_CURVE = 36;
const SYSTEM_VIEW_CAMERA_Y = 150;
const SYSTEM_VIEW_CAMERA_Z = 200;
const EARTH_ORBIT_AU = 1;
const EARTH_ORBIT_SPEED = 0.01;
const EARTH_RADIUS = 1.1;
const STAR_VIEW_OBJECT_PREFIXES = ["planet_", "sun_", "star_field"];
const SYSTEM_VIEW_OBJECT_PREFIXES = ["planet_", "system_", "orbit_", "hz_"];

// ============================================================================
// COMPUTED SYSTEMS
// ============================================================================

// Get unique systems grouped by hostname
const systems = computed(() => {
  const systemSet = new Set(exoplanets.value.map(p => p.hostname));
  return Array.from(systemSet).sort();
});

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(async () => {
  // Only fetch if data not already loaded
  if (exoplanets.value.length === 0) {
    await fetchExoplanets();
  }

  syncExternalSelection();

  // Set first system as default only when nothing external was requested
  if (!selectedSystem.value && systems.value.length > 0) {
    selectedSystem.value = systems.value[0];
  }

  // Initialize Three.js scene
  initThreeJS();

  // Start animation loop
  animate();

  // Handle window resize
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  // Cleanup
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  clearLabels();
  hoveredPlanet.value = null;
  if (renderer) {
    renderer.domElement.removeEventListener("click", handleClick);
    renderer.domElement.removeEventListener("mousemove", handleMouseMove);
    renderer.dispose();
  }
  if (controls) {
    controls.dispose();
  }
  window.removeEventListener("resize", handleResize);
});

// ============================================================================
// THREE.JS INITIALIZATION
// ============================================================================

function initThreeJS() {
  if (!containerRef.value) return;

  if (renderer) {
    renderer.domElement.removeEventListener("click", handleClick);
    renderer.domElement.removeEventListener("mousemove", handleMouseMove);
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
  if (controls) {
    controls.dispose();
  }

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0a1f); // Dark space background

  // Create camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
  camera.position.set(0, STAR_VIEW_CAMERA_Y, STAR_VIEW_CAMERA_Z);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  containerRef.value.appendChild(renderer.domElement);

  // Create controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 2500;

  // Create raycaster for click detection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Add click handler
  renderer.domElement.removeEventListener("click", handleClick);
  renderer.domElement.addEventListener("click", handleClick);

  // Add mousemove handler for hover detection
  renderer.domElement.removeEventListener("mousemove", handleMouseMove);
  renderer.domElement.addEventListener("mousemove", handleMouseMove);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 2, 10000);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  // Add star field
  addStarField();

  // Add Sun at origin with Earth reference orbit
  addSun();
  addEarthReferenceOrbit();

  // Render based on view mode
  renderStarView();
}

// ============================================================================
// STAR FIELD
// ============================================================================

function addStarField() {
  const starsGeometry = new THREE.BufferGeometry();
  const starPositions = [];

  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starPositions.push(x, y, z);
  }

  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    transparent: true,
    opacity: 0.6,
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  stars.name = "star_field";
  scene.add(stars);
}

function scaleDistance(au: number) {
  return Math.sqrt(au) * AU_SCALING_FACTOR;
}

function scaleSystemOrbitDistance(au: number) {
  return SYSTEM_VIEW_STAR_CLEARANCE + Math.sqrt(au) * SYSTEM_VIEW_DISTANCE_CURVE;
}

function scaleStarViewPosition(x: number, y: number, z: number) {
  const distance = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  if (distance === 0) {
    return new THREE.Vector3(0, 0, 0);
  }

  // Preserve direction from the Sun while spreading nearby systems more aggressively.
  const distanceBeyondThreshold = Math.max(
    0,
    distance - STAR_VIEW_MIN_DISTANCE_PARSECS
  );
  const displayDistance =
    STAR_VIEW_BASE_DISTANCE +
    Math.sqrt(distanceBeyondThreshold) * STAR_VIEW_DISTANCE_CURVE;
  const scale = displayDistance / distance;

  return new THREE.Vector3(x * scale, z * scale, -y * scale);
}

function removeSceneObjectsByPrefixes(prefixes: string[]) {
  const objectsToRemove = scene.children.filter(
    (child) => child.name && prefixes.some((prefix) => child.name.startsWith(prefix))
  );

  objectsToRemove.forEach((obj) => scene.remove(obj));
}

function ensureStarViewSceneObjects() {
  removeSceneObjectsByPrefixes(["star_field", "sun_"]);

  addStarField();
  addSun();
  addEarthReferenceOrbit();
}

// ============================================================================
// SUN
// ============================================================================

function addSun() {
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfdb813 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.name = "sun_core";
  scene.add(sun);

  // Add glow
  const glowGeometry = new THREE.SphereGeometry(7, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfdb813,
    transparent: true,
    opacity: 0.3,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.name = "sun_glow";
  scene.add(glow);
}

function addEarthReferenceOrbit() {
  const orbitRadius = scaleDistance(EARTH_ORBIT_AU);

  const orbitGeometry = new THREE.BufferGeometry();
  const orbitPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    orbitPoints.push(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius);
  }
  orbitGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(orbitPoints, 3)
  );

  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x4b9fff,
    transparent: true,
    opacity: 0.45,
  });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  orbitLine.name = "sun_earth_orbit";
  scene.add(orbitLine);

  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
  const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.position.set(orbitRadius, 0, 0);
  earth.name = "sun_earth";
  scene.add(earth);
}

// ============================================================================
// RENDER VIEWS
// ============================================================================

function renderStarView() {
  removeSceneObjectsByPrefixes(SYSTEM_VIEW_OBJECT_PREFIXES);
  ensureStarViewSceneObjects();
  clearLabels();
  hoveredPlanet.value = null;
  interactablePlanets = [];
  focusedPlanetName.value = null;

  // Add all exoplanets
  exoplanets.value.forEach((planet) => {
    if (planet.x == null || planet.y == null || planet.z == null) return;

    // Calculate distance from Sun to filter out planets that are too close
    const distanceFromSun = Math.sqrt(planet.x ** 2 + planet.y ** 2 + planet.z ** 2);

    // Filter out planets within 30 parsecs (about 98 light years) to prevent crowding near Sun
    // This gives better spacing and prevents visual overlap
    if (distanceFromSun < STAR_VIEW_MIN_DISTANCE_PARSECS) return;

    const zone = isInHabitableZone(planet);
    let color = 0x3b82f6; // blue (too-cold) default
    if (zone === "habitable") color = 0x22c55e; // green
    else if (zone === "too-hot") color = 0xef4444; // red

    const geometry = new THREE.SphereGeometry(STAR_VIEW_PLANET_RADIUS, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    const displayPosition = scaleStarViewPosition(planet.x, planet.y, planet.z);

    mesh.position.copy(displayPosition);
    mesh.name = `planet_${planet.pl_name}`;
    mesh.userData = { planet }; // Store planet data for raycasting

    scene.add(mesh);
    interactablePlanets.push(mesh);
  });
}

function renderSystemView() {
  removeSceneObjectsByPrefixes(STAR_VIEW_OBJECT_PREFIXES);
  removeSceneObjectsByPrefixes(SYSTEM_VIEW_OBJECT_PREFIXES);
  clearLabels();
  hoveredPlanet.value = null;
  interactablePlanets = [];

  // Get planets in selected system
  const systemPlanets = exoplanets.value.filter(
    (p) => p.hostname === selectedSystem.value
  );

  if (systemPlanets.length === 0) return;

  // Add central star
  const starGeometry = new THREE.SphereGeometry(8, 32, 32);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.set(0, 0, 0);
  star.name = "system_star";
  scene.add(star);

  // Get habitable zone if needed
  let hzInner = 0;
  let hzOuter = 0;
  const refPlanet = systemPlanets.find(
    (p) =>
      typeof p.st_rad === "number" &&
      p.st_rad > 0 &&
      typeof p.st_teff === "number" &&
      p.st_teff > 0
  );
  if (refPlanet && refPlanet.st_rad && refPlanet.st_teff) {
    const hz = calculateHabitableZone(refPlanet.st_rad, refPlanet.st_teff);
    hzInner = hz.innerBoundary;
    hzOuter = hz.outerBoundary;
  }

  // Sort planets by orbital distance for better visualization
  const sortedPlanets = systemPlanets
    .map((p, idx) => ({ planet: p, originalIndex: idx }))
    .sort((a, b) => (a.planet.pl_orbsmax || 0) - (b.planet.pl_orbsmax || 0));

  // Add planets with orbits
  sortedPlanets.forEach(({ planet, originalIndex }) => {
    if (typeof planet.pl_orbsmax !== "number" || planet.pl_orbsmax <= 0) return;

    // Better scaling for distance: use square root with multiplier
    // This spreads out close planets while keeping distant ones visible
    const distance = scaleSystemOrbitDistance(planet.pl_orbsmax);

    const zone = isInHabitableZone(planet);

    let color = 0x3b82f6;
    if (zone === "habitable") color = 0x22c55e;
    else if (zone === "too-hot") color = 0xef4444;

    // More realistic planet sizing: much smaller relative to star
    // Scale down by factor of 10-20 compared to star
    const radius = Math.max(0.5, Math.min((planet.pl_rade || 1) * 0.3, 2));
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    // Position on orbit - use original index for angle to spread planets evenly
    // This ensures planets don't overlap even if they're at similar distances
    const angle = (originalIndex / systemPlanets.length) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    mesh.name = `planet_${planet.pl_name}`;
    mesh.userData = { planet };

    scene.add(mesh);
    interactablePlanets.push(mesh);

    // Add orbit line if enabled
    if (showOrbits.value) {
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        orbitPoints.push(Math.cos(a) * distance, 0, Math.sin(a) * distance);
      }
      orbitGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(orbitPoints, 3)
      );
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.3,
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      orbitLine.name = `orbit_${planet.pl_name}`;
      scene.add(orbitLine);
    }
  });

  // Add habitable zone visualization if enabled
  if (
    showHabitableZone.value &&
    Number.isFinite(hzInner) &&
    Number.isFinite(hzOuter) &&
    hzInner > 0 &&
    hzOuter > hzInner
  ) {
    // Use same square root scaling as planets for consistency
    // Don't apply minimum - this was causing the ring to collapse to a line
    const hzInnerDist = scaleSystemOrbitDistance(hzInner);
    const hzOuterDist = scaleSystemOrbitDistance(hzOuter);

    // Only show ring if there's meaningful space between boundaries (at least 3 units)
    const ringVisible = (hzOuterDist - hzInnerDist) > 3;

    // Only create shaded ring if it's wide enough to be visible
    if (ringVisible) {
      const ringGeometry = new THREE.RingGeometry(hzInnerDist, hzOuterDist, 96);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false, // Prevent z-fighting issues
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
      ringMesh.position.y = 0.1; // Slightly above orbital plane to be visible
      ringMesh.name = "hz_ring";
      scene.add(ringMesh);
    }

    // Inner boundary line
    const innerGeometry = new THREE.BufferGeometry();
    const innerPoints = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      innerPoints.push(Math.cos(a) * hzInnerDist, 0, Math.sin(a) * hzInnerDist);
    }
    innerGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(innerPoints, 3)
    );
    const hzLineMaterial = new THREE.LineBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.8,
    });
    const innerLine = new THREE.Line(innerGeometry, hzLineMaterial);
    innerLine.name = "hz_inner";
    scene.add(innerLine);

    // Outer boundary line
    const outerGeometry = new THREE.BufferGeometry();
    const outerPoints = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      outerPoints.push(Math.cos(a) * hzOuterDist, 0, Math.sin(a) * hzOuterDist);
    }
    outerGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(outerPoints, 3)
    );
    const outerLine = new THREE.Line(outerGeometry, hzLineMaterial);
    outerLine.name = "hz_outer";
    scene.add(outerLine);
  }

  // Adjust camera
  camera.position.set(0, SYSTEM_VIEW_CAMERA_Y, SYSTEM_VIEW_CAMERA_Z);
  controls.target.set(0, 0, 0);

  if (focusedPlanetName.value) {
    const focusedPlanet = scene.getObjectByName(`planet_${focusedPlanetName.value}`);
    if (focusedPlanet) {
      controls.target.copy(focusedPlanet.position);
    }
  }
  controls.update();
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  controls.update();

  if (viewMode.value === "star") {
    const earth = scene.getObjectByName("sun_earth");
    if (earth) {
      earthOrbitAngle += EARTH_ORBIT_SPEED;
      const orbitRadius = scaleDistance(EARTH_ORBIT_AU);
      earth.position.set(
        Math.cos(earthOrbitAngle) * orbitRadius,
        0,
        Math.sin(earthOrbitAngle) * orbitRadius
      );
    }
  }

  // Update label for hovered planet only
  if (showLabels.value && hoveredPlanet.value) {
    const label = labels.get(hoveredPlanet.value);
    const planet = scene.getObjectByName(`planet_${hoveredPlanet.value}`);
    if (label && planet) {
      updateLabelPosition(label, planet.position);
    }
  }

  renderer.render(scene, camera);
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleResize() {
  if (!containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function resetCamera() {
  if (viewMode.value === "star") {
    camera.position.set(0, STAR_VIEW_CAMERA_Y, STAR_VIEW_CAMERA_Z);
    controls.target.set(0, 0, 0);
  } else {
    camera.position.set(0, SYSTEM_VIEW_CAMERA_Y, SYSTEM_VIEW_CAMERA_Z);
    controls.target.set(0, 0, 0);
  }
  controls.update();
}

function toggleFullscreen() {
  if (!containerRef.value) return;

  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function setViewMode(newMode: "star" | "system") {
  viewMode.value = newMode;

  if (newMode === "star") {
    focusedPlanetName.value = null;
    emit("selection-cleared");
  }
}

function syncExternalSelection() {
  const selectionKey = `${props.selectedPlanetName}::${props.selectedSystemName}`;
  if (!selectionKey.replace("::", "") || selectionKey === lastAppliedExternalSelectionKey.value) {
    return;
  }

  if (props.selectedPlanetName) {
    focusedPlanetName.value = props.selectedPlanetName;
  }

  if (props.selectedSystemName && systems.value.includes(props.selectedSystemName)) {
    selectedSystem.value = props.selectedSystemName;
    viewMode.value = "system";
  } else if (
    props.selectedPlanetName &&
    exoplanets.value.length > 0
  ) {
    const matchedPlanet = exoplanets.value.find(
      (planet) => planet.pl_name === props.selectedPlanetName
    );
    if (matchedPlanet) {
      selectedSystem.value = matchedPlanet.hostname;
      viewMode.value = "system";
    }
  }

  lastAppliedExternalSelectionKey.value = selectionKey;
}

// ============================================================================
// WATCHERS
// ============================================================================

watch(viewMode, (newMode) => {
  if (newMode === "star") {
    renderStarView();
    camera.position.set(0, STAR_VIEW_CAMERA_Y, STAR_VIEW_CAMERA_Z);
  } else {
    renderSystemView();
    camera.position.set(0, SYSTEM_VIEW_CAMERA_Y, SYSTEM_VIEW_CAMERA_Z);
  }
  controls.target.set(0, 0, 0);
  controls.update();
});

watch(selectedSystem, () => {
  if (viewMode.value === "system") {
    renderSystemView();
  }
});

watch(
  [() => props.selectedPlanetName, () => props.selectedSystemName, exoplanets],
  () => {
    syncExternalSelection();
  },
  { immediate: true }
);

watch(focusedPlanetName, () => {
  if (viewMode.value === "system" && selectedSystem.value) {
    renderSystemView();
  }
});

watch(showHabitableZone, (newValue) => {
  if (viewMode.value === "system") {
    renderSystemView();
  }
});

watch(showOrbits, () => {
  if (viewMode.value === "system") {
    renderSystemView();
  }
});

// ============================================================================
// LABEL SYSTEM
// ============================================================================

/**
 * Add a 3D label to a planet
 * Creates an HTML div positioned at the planet's 3D location
 */
function addLabel(planetName: string, position: THREE.Vector3) {
  const label = document.createElement("div");
  label.className = "planet-label";
  label.textContent = planetName;
  label.style.position = "absolute";
  label.style.color = "white";
  label.style.fontSize = "11px";
  label.style.fontWeight = "500";
  label.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  label.style.padding = "2px 6px";
  label.style.borderRadius = "3px";
  label.style.border = "1px solid rgba(147, 51, 234, 0.5)";
  label.style.pointerEvents = "none";
  label.style.whiteSpace = "nowrap";
  label.style.userSelect = "none";

  // Append to container
  if (containerRef.value) {
    containerRef.value.appendChild(label);
    labels.set(planetName, label);

    // Update position immediately
    updateLabelPosition(label, position);
  }
}

/**
 * Update label position based on 3D coordinates
 * Converts 3D world position to 2D screen coordinates
 */
function updateLabelPosition(label: HTMLDivElement, position: THREE.Vector3) {
  if (!containerRef.value) return;

  const vector = position.clone();
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * containerRef.value.clientWidth;
  const y = (-(vector.y * 0.5) + 0.5) * containerRef.value.clientHeight;

  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
  label.style.transform = "translate(-50%, -100%)"; // Center above planet
}

/**
 * Clear all labels from the scene
 */
function clearLabels() {
  labels.forEach((label) => {
    if (label.parentNode) {
      label.parentNode.removeChild(label);
    }
  });
  labels.clear();
}

// ============================================================================
// MOUSE INTERACTION
// ============================================================================

/**
 * Handle mouse move for hover detection
 * Shows label only for the planet being hovered over
 */
function handleMouseMove(event: MouseEvent) {
  if (!containerRef.value || !showLabels.value) return;

  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const rect = containerRef.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(interactablePlanets, true);

  // Find first planet intersection
  let foundPlanet: string | null = null;
  for (const intersect of intersects) {
    if (intersect.object.name && intersect.object.name.startsWith("planet_")) {
      const planet = intersect.object.userData.planet;
      if (planet && planet.pl_name) {
        foundPlanet = planet.pl_name;
        break;
      }
    }
  }

  // Update hovered planet
  if (foundPlanet !== hoveredPlanet.value) {
    // Remove old label
    if (hoveredPlanet.value) {
      const oldLabel = labels.get(hoveredPlanet.value);
      if (oldLabel && oldLabel.parentNode) {
        oldLabel.parentNode.removeChild(oldLabel);
      }
      labels.delete(hoveredPlanet.value);
    }

    // Add new label
    hoveredPlanet.value = foundPlanet;
    if (foundPlanet) {
      const planetMesh = scene.getObjectByName(`planet_${foundPlanet}`);
      if (planetMesh) {
        addLabel(foundPlanet, planetMesh.position);
      }
    }

    // Update cursor style
    if (foundPlanet) {
      renderer.domElement.style.cursor = "pointer";
    } else {
      renderer.domElement.style.cursor = "default";
    }
  }
}

/**
 * Handle planet click events
 * Uses raycasting to detect which planet was clicked
 * Switches to system view and zooms to that system
 */
function handleClick(event: MouseEvent) {
  if (!containerRef.value) return;

  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const rect = containerRef.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(interactablePlanets, true);

  // Find first planet intersection
  for (const intersect of intersects) {
    if (intersect.object.name && intersect.object.name.startsWith("planet_")) {
      const planet = intersect.object.userData.planet;
      if (planet && planet.hostname) {
        // Switch to system view
        viewMode.value = "system";
        selectedSystem.value = planet.hostname;
        focusedPlanetName.value = planet.pl_name;
        emit("planet-selected", {
          planetName: planet.pl_name,
          systemName: planet.hostname,
        });

        // Animate camera to focus on the system
        // The watch on selectedSystem will trigger renderSystemView
        break;
      }
    }
  }
}
</script>
