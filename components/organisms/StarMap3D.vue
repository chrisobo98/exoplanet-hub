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
              <strong>Known Issue:</strong> Some spatial calculations are still being refined.
              Planets in Star View may appear closer to our Sun than scientifically accurate.
            </p>
            <details class="mt-2">
              <summary class="cursor-pointer text-yellow-200 hover:text-yellow-100 font-medium">
                View Technical Details & Calculations
              </summary>
              <div class="mt-2 space-y-2 text-xs text-yellow-100/90 bg-black/20 p-3 rounded">
                <p><strong>Habitable Zone:</strong> Kopparapu et al. (2013) formulation</p>
                <p><strong>Coordinates:</strong> RA/Dec/Distance → Cartesian (X, Y, Z)</p>
                <p><strong>Star View Filter:</strong> Only showing systems >30 parsecs (~98 ly) from Sun</p>
                <p><strong>System View Scaling:</strong> Square root function (√AU × 40)</p>
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
              @click="viewMode = 'star'"
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
              @click="viewMode = 'system'"
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
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Info, RotateCcw, Maximize2 } from "lucide-vue-next";
import { useExoplanets } from "@/composables/useExoplanets";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

  // Set first system as default
  if (systems.value.length > 0) {
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

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0a1f); // Dark space background

  // Create camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
  camera.position.set(0, 50, 200);

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
  controls.maxDistance = 1000;

  // Create raycaster for click detection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Add click handler
  renderer.domElement.addEventListener("click", handleClick);

  // Add mousemove handler for hover detection
  renderer.domElement.addEventListener("mousemove", handleMouseMove);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 2, 10000);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  // Add star field
  addStarField();

  // Add Sun at origin with habitable zone
  addSun();
  if (showHabitableZone.value) {
    addSunHabitableZone();
  }

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
  scene.add(stars);
}

// ============================================================================
// SUN
// ============================================================================

function addSun() {
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfdb813 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.name = "Sun";
  scene.add(sun);

  // Add glow
  const glowGeometry = new THREE.SphereGeometry(7, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfdb813,
    transparent: true,
    opacity: 0.3,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glow);
}

function addSunHabitableZone() {
  // Our Sun's habitable zone (G2V star: R=1.0, T=5778K)
  // Inner: ~0.95 AU, Outer: ~1.67 AU
  const hzInner = 0.95;
  const hzOuter = 1.67;

  const hzInnerDist = Math.sqrt(hzInner) * 40;
  const hzOuterDist = Math.sqrt(hzOuter) * 40;

  // Create shaded ring mesh
  const ringShape = new THREE.Shape();

  // Outer circle
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const x = Math.cos(angle) * hzOuterDist;
    const y = Math.sin(angle) * hzOuterDist;
    if (i === 0) {
      ringShape.moveTo(x, y);
    } else {
      ringShape.lineTo(x, y);
    }
  }

  // Inner circle (hole)
  const hole = new THREE.Path();
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const x = Math.cos(angle) * hzInnerDist;
    const y = Math.sin(angle) * hzInnerDist;
    if (i === 0) {
      hole.moveTo(x, y);
    } else {
      hole.lineTo(x, y);
    }
  }
  ringShape.holes.push(hole);

  // Create ring mesh
  const ringGeometry = new THREE.ShapeGeometry(ringShape);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xfdb813, // Yellow/gold for our Sun's HZ
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.1;
  ringMesh.name = "sun_hz_ring";
  scene.add(ringMesh);

  // Boundary lines
  const hzLineMaterial = new THREE.LineBasicMaterial({
    color: 0xfdb813,
    transparent: true,
    opacity: 0.4,
  });

  // Inner boundary
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
  const innerLine = new THREE.Line(innerGeometry, hzLineMaterial);
  innerLine.name = "sun_hz_inner";
  scene.add(innerLine);

  // Outer boundary
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
  outerLine.name = "sun_hz_outer";
  scene.add(outerLine);
}

// ============================================================================
// RENDER VIEWS
// ============================================================================

function renderStarView() {
  // Clear existing planets and labels
  const planetsToRemove = scene.children.filter(
    (child) => child.name && child.name.startsWith("planet_")
  );
  planetsToRemove.forEach((planet) => scene.remove(planet));
  clearLabels();
  hoveredPlanet.value = null;

  // Add all exoplanets
  exoplanets.value.forEach((planet) => {
    if (!planet.x || !planet.y || !planet.z) return;

    // Calculate distance from Sun to filter out planets that are too close
    const distanceFromSun = Math.sqrt(planet.x ** 2 + planet.y ** 2 + planet.z ** 2);

    // Filter out planets within 30 parsecs (about 98 light years) to prevent crowding near Sun
    // This gives better spacing and prevents visual overlap
    if (distanceFromSun < 30) return;

    const zone = isInHabitableZone(planet);
    let color = 0x3b82f6; // blue (too-cold) default
    if (zone === "habitable") color = 0x22c55e; // green
    else if (zone === "too-hot") color = 0xef4444; // red

    const geometry = new THREE.SphereGeometry(2, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(planet.x, planet.z, -planet.y);
    mesh.name = `planet_${planet.pl_name}`;
    mesh.userData = { planet }; // Store planet data for raycasting

    scene.add(mesh);
  });
}

function renderSystemView() {
  // Clear existing objects and labels
  const toRemove = scene.children.filter(
    (child) => child.name && (child.name.startsWith("planet_") || child.name.startsWith("orbit_"))
  );
  toRemove.forEach((obj) => scene.remove(obj));
  clearLabels();
  hoveredPlanet.value = null;

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
  star.name = "planet_star";
  scene.add(star);

  // Get habitable zone if needed
  let hzInner = 0;
  let hzOuter = 0;
  const refPlanet = systemPlanets.find(p => p.st_rad && p.st_teff);
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
  sortedPlanets.forEach(({ planet, originalIndex }, index) => {
    if (typeof planet.pl_orbsmax !== "number" || planet.pl_orbsmax <= 0) return;

    // Better scaling for distance: use square root with multiplier
    // This spreads out close planets while keeping distant ones visible
    const distance = Math.max(25, Math.sqrt(planet.pl_orbsmax) * 40);

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
  if (showHabitableZone.value && hzInner > 0 && hzOuter > 0) {
    // Use same square root scaling as planets for consistency
    // Don't apply minimum - this was causing the ring to collapse to a line
    const hzInnerDist = Math.sqrt(hzInner) * 40;
    const hzOuterDist = Math.sqrt(hzOuter) * 40;

    // Only show ring if there's meaningful space between boundaries (at least 3 units)
    const ringVisible = (hzOuterDist - hzInnerDist) > 3;

    // Only create shaded ring if it's wide enough to be visible
    if (ringVisible) {
      // Create shaded ring mesh for habitable zone
      const ringShape = new THREE.Shape();

      // Outer circle
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * hzOuterDist;
        const y = Math.sin(angle) * hzOuterDist;
        if (i === 0) {
          ringShape.moveTo(x, y);
        } else {
          ringShape.lineTo(x, y);
        }
      }

      // Inner circle (hole)
      const hole = new THREE.Path();
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * hzInnerDist;
        const y = Math.sin(angle) * hzInnerDist;
        if (i === 0) {
          hole.moveTo(x, y);
        } else {
          hole.lineTo(x, y);
        }
      }
      ringShape.holes.push(hole);

      // Create mesh from shape
      const ringGeometry = new THREE.ShapeGeometry(ringShape);
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
      ringMesh.name = "orbit_hz_ring";
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
    innerLine.name = "orbit_hz_inner";
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
    outerLine.name = "orbit_hz_outer";
    scene.add(outerLine);
  }

  // Adjust camera
  camera.position.set(0, 150, 200);
  controls.target.set(0, 0, 0);
  controls.update();
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  controls.update();

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
    camera.position.set(0, 50, 200);
    controls.target.set(0, 0, 0);
  } else {
    camera.position.set(0, 150, 200);
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

// ============================================================================
// WATCHERS
// ============================================================================

watch(viewMode, (newMode) => {
  if (newMode === "star") {
    renderStarView();
    camera.position.set(0, 50, 200);
  } else {
    renderSystemView();
    camera.position.set(0, 150, 200);
  }
  controls.target.set(0, 0, 0);
  controls.update();
});

watch(selectedSystem, () => {
  if (viewMode.value === "system") {
    renderSystemView();
  }
});

watch(showHabitableZone, (newValue) => {
  if (viewMode.value === "system") {
    renderSystemView();
  } else {
    // Star View - toggle Sun's habitable zone
    const sunHZObjects = scene.children.filter(
      (child) => child.name && child.name.startsWith("sun_hz_")
    );

    if (newValue && sunHZObjects.length === 0) {
      // Add Sun's HZ
      addSunHabitableZone();
    } else if (!newValue && sunHZObjects.length > 0) {
      // Remove Sun's HZ
      sunHZObjects.forEach((obj) => scene.remove(obj));
    }
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
  const vector = position.clone();
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * containerRef.value!.clientWidth;
  const y = (-(vector.y * 0.5) + 0.5) * containerRef.value!.clientHeight;

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
  const intersects = raycaster.intersectObjects(scene.children);

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
  const intersects = raycaster.intersectObjects(scene.children);

  // Find first planet intersection
  for (const intersect of intersects) {
    if (intersect.object.name && intersect.object.name.startsWith("planet_")) {
      const planet = intersect.object.userData.planet;
      if (planet && planet.hostname) {
        // Switch to system view
        viewMode.value = "system";
        selectedSystem.value = planet.hostname;

        // Animate camera to focus on the system
        // The watch on selectedSystem will trigger renderSystemView
        break;
      }
    }
  }
}

// Import computed
import { computed } from "vue";
</script>
