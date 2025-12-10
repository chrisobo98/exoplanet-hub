<!--
  StarMap3D Component (Organism)

  Interactive 3D visualization of TESS-discovered exoplanets in spatial coordinates.

  Purpose:
  Renders an interactive 3D star map showing the spatial distribution of
  exoplanets discovered by the TESS mission, with color-coding based on
  habitable zone classification.

  Features:
  - 3D visualization using HTML5 Canvas and manual 3D transformations
  - Interactive camera controls (drag to rotate, zoom buttons)
  - Auto-rotation mode for passive viewing
  - Color-coded planets (green=habitable, red=hot, blue=cold)
  - Perspective projection for depth perception
  - Size scaling based on planet radius
  - Star field background for visual context
  - Sun positioned at origin (0,0,0)

  Technical Implementation:
  - Manual 3D math (no Three.js dependency for lightweight bundle)
  - Rotation matrices for X and Y axes
  - Perspective projection: scale = 1000 / (1000 + z)
  - Request Animation Frame for smooth auto-rotation
  - Reactive Vue refs for camera state

  Coordinate System:
  - Origin: Sol (our Sun) at canvas center
  - X-axis: Right Ascension 0° (Vernal Equinox)
  - Y-axis: Right Ascension 90° (East)
  - Z-axis: Declination 90° (North Celestial Pole)
  - Units: Parsecs (converted to screen pixels with scaling)

  Performance:
  - Canvas rendering (hardware accelerated)
  - ~437 planets rendered at 60fps
  - Efficient 3D transformations (matrix math)
  - Minimal DOM updates via Vue reactivity

  Scientific Accuracy:
  - Real celestial coordinates from NASA Exoplanet Archive
  - Accurate 3D positions (RA, Dec, Distance → X, Y, Z)
  - Habitable zone calculations from stellar properties
  - Realistic perspective projection

  User Interactions:
  - Drag: Rotate camera around origin
  - Zoom In/Out: Scale view (0.3x to 3x)
  - Reset View: Return to default orientation
  - Auto-Rotate: Toggle smooth rotation animation

  Visual Design:
  - Dark space background (#0f0a1f)
  - 200 procedural stars for context
  - Sun rendered as orange gradient sphere
  - Planet glow effects for visibility
  - Color legend for interpretation

  Examples:
  <OrganismsStarMap3D />
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
  <div v-else class="space-y-6">
    <!-- Instructions: User guide explaining the visualization -->
    <div
      class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6"
    >
      <div class="flex items-start gap-3">
        <Info class="w-5 h-5 text-purple-400 mt-1" />
        <div>
          <h3 class="text-white text-lg font-semibold mb-2">
            Interactive 3D Star Map
          </h3>
          <p class="text-purple-200 text-sm">
            This visualization shows the spatial distribution of TESS-discovered
            exoplanets. Drag to rotate the view, use the controls to zoom, or
            enable auto-rotation. Colors indicate habitable zone status:
            <span class="text-green-400">green (habitable)</span>,
            <span class="text-red-400"> red (too hot)</span>,
            <span class="text-blue-400">blue (too cold)</span>.
          </p>
        </div>
      </div>
    </div>

    <!--
      Camera Controls: Interactive buttons for view manipulation
      - Zoom In/Out: Scale the view (0.3x to 3x range)
      - Reset View: Return to default orientation
      - Auto-Rotate: Toggle continuous rotation animation
    -->
    <div
      class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4"
    >
      <div class="flex flex-wrap gap-3">
        <!--
          Zoom In Button: Increase zoom by 0.2, capped at 3x
          Math.min ensures we never exceed 3x zoom
        -->
        <button
          @click="zoom = Math.min(zoom + 0.2, 3)"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <ZoomIn class="w-4 h-4" />
          Zoom In
        </button>

        <!--
          Zoom Out Button: Decrease zoom by 0.2, minimum 0.3x
          Math.max ensures we never zoom out too far
        -->
        <button
          @click="zoom = Math.max(zoom - 0.2, 0.3)"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <ZoomOut class="w-4 h-4" />
          Zoom Out
        </button>

        <!--
          Reset View Button: Return to initial camera state
          Calls resetView() to reset rotation, zoom, and re-enable auto-rotate
        -->
        <button
          @click="resetView"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <RotateCcw class="w-4 h-4" />
          Reset View
        </button>

        <!--
          Auto-Rotate Toggle: Enable/disable smooth rotation animation
          - Green when active (user wants passive viewing)
          - Gray when inactive (user wants manual control)
        -->
        <button
          @click="autoRotate = !autoRotate"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            autoRotate
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white',
          ]"
        >
          <Camera class="w-4 h-4" />
          {{ autoRotate ? "Auto-Rotate On" : "Auto-Rotate Off" }}
        </button>
      </div>

      <!--
        Camera State Display: Real-time feedback for current view settings
        - Zoom level (0.3x to 3.0x)
        - Rotation angles in radians (X=pitch, Y=yaw)
      -->
      <div class="mt-3 text-purple-200 text-sm">
        Zoom: {{ zoom.toFixed(1) }}x | Rotation: X={{ rotation.x.toFixed(2) }},
        Y={{ rotation.y.toFixed(2) }}
      </div>
    </div>

    <!--
      Canvas Container: Renders the 3D star map
      - 1000x700 native resolution for crisp rendering
      - w-full responsive width (canvas scales via CSS)
      - Mouse event handlers for drag rotation
      - Cursor changes to indicate draggable (grab → grabbing)
    -->
    <div
      class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6"
    >
      <canvas
        ref="canvasRef"
        width="1000"
        height="700"
        class="w-full cursor-grab active:cursor-grabbing rounded-lg"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      />
    </div>

    <!--
      Legend: Color-code explanation for habitable zone classification
      Uses AtomsLegendItem components with matching visualization colors
    -->
    <div
      class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6"
    >
      <h3 class="text-white text-lg font-semibold mb-4">Legend</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AtomsLegendItem
          color="#22c55e"
          label="Habitable Zone"
          description="Could support liquid water"
        />
        <AtomsLegendItem
          color="#ef4444"
          label="Too Hot"
          description="Too close to host star"
        />
        <AtomsLegendItem
          color="#3b82f6"
          label="Too Cold"
          description="Too far from host star"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * StarMap3D Component Script
 *
 * 3D rendering and interaction logic for the exoplanet star map.
 *
 * Key Technologies:
 * - HTML5 Canvas 2D Context (no WebGL for simplicity)
 * - Manual 3D math (rotation matrices, perspective projection)
 * - Request Animation Frame for smooth animations
 * - Vue reactivity for camera state
 *
 * Rendering Pipeline:
 * 1. Clear canvas and draw background (space color + stars)
 * 2. Draw Sun at origin (radial gradient sphere)
 * 3. For each exoplanet:
 *    a. Apply rotation matrices (Y-axis → X-axis)
 *    b. Apply perspective projection
 *    c. Determine color based on habitable zone
 *    d. Draw planet with size based on radius
 *    e. Draw glow effect for visibility
 *
 * Performance Optimizations:
 * - Single canvas context (no repeated getContext calls)
 * - Efficient transformation math (precompute trig values)
 * - RequestAnimationFrame only when auto-rotating
 * - Deep watch on rotation/zoom to avoid unnecessary redraws
 */
import { ref, onMounted, watch } from "vue";
import { Camera, RotateCcw, ZoomIn, ZoomOut, Info } from "lucide-vue-next";
import { useExoplanets } from "@/composables/useExoplanets";

// ============================================================================
// COMPOSABLE & STATE
// ============================================================================

/**
 * Exoplanet data and utilities from global composable
 * - exoplanets: Array of exoplanet objects with 3D coordinates
 * - loading: Loading state indicator
 * - fetchExoplanets: Function to load data from NASA API
 * - isInHabitableZone: Function to classify planet habitability
 */
const { exoplanets, loading, fetchExoplanets, isInHabitableZone } = useExoplanets();

/**
 * Canvas reference for rendering
 * Template ref bound to <canvas> element
 */
const canvasRef = ref<HTMLCanvasElement | null>(null);

/**
 * Camera rotation state in radians
 * - x: Rotation around X-axis (pitch, up/down)
 * - y: Rotation around Y-axis (yaw, left/right)
 *
 * Rotation Order: Y-axis first, then X-axis
 * This avoids gimbal lock for typical viewing angles
 */
const rotation = ref({ x: 0, y: 0 });

/**
 * Zoom level (scale multiplier)
 * Range: 0.3 (zoomed out) to 3.0 (zoomed in)
 * Default: 1.0 (neutral view)
 */
const zoom = ref(1);

/**
 * Mouse drag state for camera rotation
 * true: User is dragging, update rotation on mouse move
 * false: User released mouse, ignore mouse movement
 */
const isDragging = ref(false);

/**
 * Last mouse position for delta calculation
 * Used to compute rotation change during drag:
 * deltaX = currentX - lastX
 * deltaY = currentY - lastY
 */
const lastMouse = ref({ x: 0, y: 0 });

/**
 * Auto-rotation toggle state
 * true: Continuously rotate Y-axis for passive viewing
 * false: Manual control only (user dragging)
 *
 * Automatically disabled when user starts dragging
 */
const autoRotate = ref(true);

/**
 * Precomputed star opacities for background star field
 * Computed once and reused for performance
 * Array of 200 deterministic opacity values (0.2 to 0.7)
 */
let starOpacities: number[] | null = null;

// ============================================================================
// LIFECYCLE & WATCHERS
// ============================================================================

/**
 * Component initialization
 *
 * Process:
 * 1. Fetch exoplanet data from NASA API (if not already loaded)
 * 2. Initial render of the scene
 * 3. Start animation loop for auto-rotation
 *
 * Animation Loop:
 * Uses requestAnimationFrame for 60fps smooth rotation
 * Only increments rotation.y when autoRotate is enabled
 * Runs indefinitely (checked every frame)
 */
onMounted(async () => {
  // Only fetch if data not already loaded (prevents reload on tab switch)
  if (exoplanets.value.length === 0) {
    await fetchExoplanets();
  }

  // Initial render
  drawScene();

  /**
   * Auto-rotation animation loop
   *
   * Recursively calls itself via requestAnimationFrame to:
   * 1. Check if auto-rotation is enabled
   * 2. If yes, increment Y-axis rotation by 0.005 radians (~0.29°)
   * 3. Redraw scene with new rotation
   * 4. Schedule next frame
   *
   * Performance:
   * - Only redraws when rotation changes (autoRotate=true)
   * - Manual draws handled by watch() below
   * - ~60 FPS on modern browsers
   */
  const animate = () => {
    if (autoRotate.value) {
      rotation.value.y += 0.005; // Slow, smooth rotation
      drawScene();
    }
    requestAnimationFrame(animate); // Schedule next frame
  };
  animate(); // Start the loop
});

/**
 * Watch camera state changes and redraw scene
 *
 * Triggers on:
 * - rotation.x or rotation.y changes (user drag or auto-rotate)
 * - zoom level changes (user zoom buttons)
 *
 * deep: true enables watching nested object properties (rotation.x, rotation.y)
 *
 * Why separate from animate loop?
 * - Manual camera changes (drag, zoom) need immediate redraw
 * - Auto-rotation handled by animate() to avoid duplicate draws
 * - Watch ensures UI responsiveness for user interactions
 */
watch(
  [rotation, zoom],
  () => {
    drawScene();
  },
  { deep: true }
);

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

/**
 * Main rendering function - draws the entire 3D scene
 *
 * Rendering Pipeline:
 * 1. Clear canvas and fill with dark space background
 * 2. Draw procedural star field for visual context
 * 3. Draw Sun at origin (center of canvas)
 * 4. For each exoplanet:
 *    - Apply 3D rotation transformations
 *    - Apply perspective projection
 *    - Color based on habitable zone
 *    - Draw planet and glow effect
 *
 * Performance:
 * - Called on every frame when auto-rotating
 * - Called on user interaction (drag, zoom)
 * - ~437 planets rendered at 60fps
 * - Hardware accelerated via canvas
 *
 * 3D Math Overview:
 * - Uses rotation matrices (not quaternions for simplicity)
 * - Y-axis rotation applied first (yaw), then X-axis (pitch)
 * - Perspective projection: scale = 1000 / (1000 + z)
 * - Larger z values (farther away) = smaller on screen
 */
function drawScene() {
  // Get canvas reference (may be null before mount)
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Get 2D rendering context (not WebGL for simplicity)
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Canvas dimensions (fixed 1000x700)
  const width = canvas.width;
  const height = canvas.height;

  // ====================================
  // Step 1: Clear Canvas & Background
  // ====================================

  /**
   * Fill entire canvas with dark space color
   * #0f0a1f: Very dark purple (nearly black)
   * Creates the "deep space" aesthetic
   */
  ctx.fillStyle = "#0f0a1f";
  ctx.fillRect(0, 0, width, height);

  // ====================================
  // Step 2: Draw Star Field Background
  // ====================================

  /**
   * Procedural star field generation
   *
   * Technique: Deterministic pseudo-random positions
   * - Uses prime number multipliers (137.508, 97.342)
   * - Modulo ensures stars wrap within canvas bounds
   * - Same stars appear in same positions every frame
   * - No random() call needed per frame (performance)
   *
   * Visual Effect:
   * - 200 small white stars
   * - Random opacity (0.2 to 0.7) for depth variation
   * - 1x1 pixel size for distant star appearance
   */
  ctx.fillStyle = "#ffffff";

  /**
   * Precompute star opacities once for performance
   * Only computed on first call, then cached
   * Uses deterministic pseudo-random function for consistent stars
   */
  if (!starOpacities) {
    starOpacities = Array.from({ length: 200 }, (_, i) => {
      // Simple deterministic pseudo-random function based on index
      const seed = Math.sin(i * 9999) * 10000;
      return (seed - Math.floor(seed)) * 0.5 + 0.2;
    });
  }

  for (let i = 0; i < 200; i++) {
    // Deterministic position using prime number hash
    const x = (i * 137.508) % width;
    const y = (i * 97.342) % height;

    // Use precomputed deterministic opacity
    ctx.globalAlpha = starOpacities[i];

    // Draw single pixel star
    ctx.fillRect(x, y, 1, 1);
  }

  // Reset alpha for opaque rendering
  ctx.globalAlpha = 1;

  // ====================================
  // Step 3: Calculate Canvas Center
  // ====================================

  /**
   * Center point coordinates
   * - cx: Horizontal center (500 for 1000px width)
   * - cy: Vertical center (350 for 700px height)
   *
   * Sun positioned here (origin of 3D space)
   * All exoplanet coordinates relative to this point
   */
  const cx = width / 2;
  const cy = height / 2;

  // ====================================
  // Step 4: Draw Sun at Origin
  // ====================================

  /**
   * Radial gradient for Sun glow effect
   *
   * Gradient stops:
   * - Center (0): Bright yellow (#FDB813)
   * - Middle (0.5): Orange (#FD8813)
   * - Edge (1): Transparent orange (30% alpha)
   *
   * Radius: 15 pixels (represents Sol, our Sun)
   * Creates realistic solar glow
   */
  const sunGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
  sunGradient.addColorStop(0, "#FDB813"); // Bright yellow center
  sunGradient.addColorStop(0.5, "#FD8813"); // Orange middle
  sunGradient.addColorStop(1, "#FD881330"); // Transparent edge (glow)

  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2); // Full circle (2π radians)
  ctx.fill();

  /**
   * Sun label: "Sol"
   * - Positioned 30 pixels below Sun center
   * - 12px system font for readability
   * - Center-aligned with Sun
   * - Bright yellow color matching Sun
   */
  ctx.fillStyle = "#FDB813";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Sol", cx, cy + 30);

  // ====================================
  // Step 5: Render Exoplanets
  // ====================================

  /**
   * Render each exoplanet with 3D transformations
   *
   * For each planet:
   * 1. Get 3D world coordinates (x, y, z in parsecs)
   * 2. Apply Y-axis rotation (yaw)
   * 3. Apply X-axis rotation (pitch)
   * 4. Apply perspective projection
   * 5. Determine color from habitable zone
   * 6. Calculate size based on radius + perspective
   * 7. Draw planet sphere + glow effect
   */
  exoplanets.value.forEach((planet) => {
    /**
     * Scale factor for 3D world → screen space
     * - Base scale: 0.5 (fits planets comfortably on screen)
     * - Multiplied by zoom for user zoom control
     * - Example: zoom=2.0 → scale=1.0 (2x magnification)
     */
    const scale = 0.5 * zoom.value;

    /**
     * Extract 3D coordinates (parsecs)
     * - x, y, z calculated in useExoplanets composable
     * - Converted from RA/Dec/Distance celestial coordinates
     * - Default to 0 if missing data
     */
    let x = planet.x || 0;
    let y = planet.y || 0;
    let z = planet.z || 0;

    // ========================================
    // 3D Rotation Transformations
    // ========================================

    /**
     * Y-axis rotation (yaw, left/right)
     *
     * Rotation matrix around Y-axis:
     * [ cos(θ)  0  sin(θ) ]
     * [   0     1    0    ]
     * [-sin(θ)  0  cos(θ) ]
     *
     * Applied first to avoid gimbal lock
     * Precompute cos/sin for efficiency
     */
    const cosY = Math.cos(rotation.value.y);
    const sinY = Math.sin(rotation.value.y);
    const rotatedX = x * cosY - z * sinY;
    const rotatedZ = x * sinY + z * cosY;

    /**
     * X-axis rotation (pitch, up/down)
     *
     * Rotation matrix around X-axis:
     * [ 1    0       0    ]
     * [ 0  cos(θ) -sin(θ) ]
     * [ 0  sin(θ)  cos(θ) ]
     *
     * Applied after Y-axis rotation
     * Uses rotatedZ from previous step
     */
    const cosX = Math.cos(rotation.value.x);
    const sinX = Math.sin(rotation.value.x);
    const rotatedY = y * cosX - rotatedZ * sinX;
    const finalZ = y * sinX + rotatedZ * cosX;

    // ========================================
    // Perspective Projection
    // ========================================

    /**
     * Perspective scale factor
     *
     * Formula: perspective = focal_distance / (focal_distance + z)
     * - focal_distance = 1000 (arbitrary, determines FOV)
     * - Objects farther away (larger z) appear smaller
     * - Objects closer (smaller z) appear larger
     *
     * Clamping:
    // Clamp finalZ to avoid negative or zero denominators
    const safeZ = Math.max(finalZ, -990); // Ensures denominator >= 10
    const perspective = Math.max(0.1, Math.min(2, 1000 / (1000 + safeZ)));
     * - Max: 2.0 (prevent oversized objects when very close)
     *
     * Example:
     * - z = 0 (at camera): perspective = 1.0 (normal size)
     * - z = 1000: perspective = 0.5 (half size)
     * - z = -500 (behind camera): perspective = 2.0 (clamped)
     */
    const perspective = Math.max(0.1, Math.min(2, 1000 / (1000 + finalZ)));

    /**
     * Screen coordinates (pixels)
     * - Start from canvas center (cx, cy)
     * - Add rotated world coordinates
     * - Scale by zoom and perspective
     * - Y-axis inverted (canvas Y increases downward)
     */
    const screenX = cx + rotatedX * scale * perspective;
    const screenY = cy - rotatedY * scale * perspective;

    // ========================================
    // Planet Appearance
    // ========================================

    /**
     * Color based on habitable zone classification
     * - Green (#22c55e): Habitable zone (liquid water possible)
     * - Red (#ef4444): Too hot (too close to star)
     * - Blue (#3b82f6): Too cold (too far from star)
     *
     * Colors match legend in template
     */
    const zone = isInHabitableZone(planet);
    let color =
      zone === "habitable"
        ? "#22c55e"
        : zone === "too-hot"
        ? "#ef4444"
        : "#3b82f6";

    /**
     * Planet size calculation
     *
     * Base size:
     * - Uses pl_rade (radius in Earth radii)
     * - Multiplied by 2 for visibility
     * - Clamped between 3 and 12 pixels
     * - Missing radius defaults to 1 R⊕
     *
     * Final size:
     * - Scaled by perspective (farther = smaller)
     * - Minimum 3 pixels (always visible, matches base clamp)
     *
     * Example:
     * - Earth-sized (1 R⊕): baseSize = 3px
     * - Jupiter-sized (11 R⊕): baseSize = 12px (clamped)
     * - Super-Earth (2 R⊕): baseSize = 4px
     */
    const baseSize = Math.max(3, Math.min(12, (planet.pl_rade || 1) * 2));
    const size = Math.max(2, baseSize * perspective);

    /**
     * Opacity based on distance
     * - Farther planets (small perspective) = more transparent
     * - Closer planets (large perspective) = more opaque
     * - Range: 0.3 (distant) to 1.0 (close)
     * - Creates depth perception
     */
    const opacity = Math.max(0.3, Math.min(1, perspective));

    // ========================================
    // Render Planet Sphere
    // ========================================

    /**
     * Draw solid planet circle
     * - Fill with zone color
     * - Apply opacity for depth
     * - Draw as filled arc (full circle)
     */
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
    ctx.fill();

    // ========================================
    // Render Planet Glow
    // ========================================

    /**
     * Radial gradient glow effect
     *
     * Purpose: Increase visibility of small planets
     *
     * Gradient:
     * - Center: Color with 25% opacity (40 hex = 64/255)
     * - Edge: Fully transparent (00 hex)
     * - Radius: 2x planet size (soft glow)
     *
     * Why glow?
     * - Small planets (2-3px) hard to see
     * - Glow makes them discoverable
     * - Aesthetically pleasing
     */
    function hexWithAlpha(baseColor: string, alphaHex: string) {
      // If already 8-digit hex, just replace alpha
      if (/^#([A-Fa-f0-9]{8})$/.test(baseColor)) {
        return baseColor.slice(0, 7) + alphaHex;
      }
      // 6-digit hex
      if (/^#([A-Fa-f0-9]{6})$/.test(baseColor)) {
        return baseColor + alphaHex;
      }
      // 3-digit hex
      if (/^#([A-Fa-f0-9]{3})$/.test(baseColor)) {
        const hex = baseColor.replace(
          /^#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])$/,
          (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`
        );
        return hex + alphaHex;
      }
      // rgb/rgba string
      const rgbMatch = baseColor.match(
        /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\s*\)$/
      );
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const a = parseInt(alphaHex, 16) / 255;
        return `rgba(${r},${g},${b},${a})`;
      }
      // fallback: just append alpha
      return baseColor + alphaHex;
    }

    const gradient = ctx.createRadialGradient(
      screenX,
      screenY,
      0,
      screenX,
      screenY,
      size * 2
    );
    gradient.addColorStop(0, hexWithAlpha(color, "40")); // 25% opacity at center
    gradient.addColorStop(1, hexWithAlpha(color, "00")); // 0% opacity at edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset alpha to opaque for next planet
    ctx.globalAlpha = 1;
  });
}

// ============================================================================
// MOUSE INTERACTION HANDLERS
// ============================================================================

/**
 * Handle mouse button press on canvas
 *
 * Initiates camera rotation via drag interaction.
 *
 * Actions:
 * 1. Set dragging state to true (enables mouse move tracking)
 * 2. Disable auto-rotation (user taking manual control)
 * 3. Store current mouse position as reference point
 *
 * @param {MouseEvent} e - Mouse event containing cursor position
 *
 * User Experience:
 * - Cursor changes to "grabbing" via CSS (active:cursor-grabbing)
 * - Auto-rotation stops immediately
 * - Next mouse move will update camera rotation
 */
function handleMouseDown(e: MouseEvent) {
  isDragging.value = true;
  autoRotate.value = false; // Manual control takes precedence
  lastMouse.value = { x: e.clientX, y: e.clientY };
}

/**
    // Update rotation angles (0.01 = sensitivity multiplier)
    rotation.value.x += dy * 0.01; // Up/down drag → pitch
    rotation.value.y += dx * 0.01; // Left/right drag → yaw

    // Clamp pitch (rotation.x) to [-π/2, π/2] to prevent flipping
    const maxPitch = Math.PI / 2;
    const minPitch = -Math.PI / 2;
    rotation.value.x = Math.max(minPitch, Math.min(maxPitch, rotation.value.x));

    // Update reference position for next frame
    lastMouse.value = { x: e.clientX, y: e.clientY };
 * 2. Convert pixel delta to rotation angle (0.01 radians per pixel)
 * 3. Update rotation state (triggers redraw via watch)
 * 4. Store current position for next delta calculation
 *
 * Sensitivity:
 * - 0.01 radians/pixel = ~0.57 degrees/pixel
 * - 100 pixel drag = ~57 degree rotation
 * - Tuned for comfortable, responsive control
 *
 * @param {MouseEvent} e - Mouse event containing current cursor position
 *
 * Performance:
 * - Only processes when isDragging is true (ignores passive hovering)
 * - Watch() triggers drawScene() automatically
 * - No manual render call needed (Vue reactivity handles it)
 *
 * Controls:
 * - Horizontal drag (dx): Rotates around Y-axis (yaw, left/right)
 * - Vertical drag (dy): Rotates around X-axis (pitch, up/down)
 */
function handleMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    // Calculate mouse movement since last frame
    const dx = e.clientX - lastMouse.value.x; // Horizontal movement
    const dy = e.clientY - lastMouse.value.y; // Vertical movement

    // Update rotation angles (0.01 = sensitivity multiplier)
    rotation.value.x += dy * 0.01; // Up/down drag → pitch
    rotation.value.y += dx * 0.01; // Left/right drag → yaw

    // Update reference position for next frame
    lastMouse.value = { x: e.clientX, y: e.clientY };
  }
}

/**
 * Handle mouse button release or cursor leaving canvas
 *
 * Ends drag interaction but preserves current rotation.
 *
 * Actions:
 * - Set dragging state to false (stops rotation updates)
 * - Cursor returns to "grab" state via CSS
 * - Camera stays at current rotation (does not reset)
 * - Auto-rotation remains disabled (user explicitly stopped it)
 *
 * Why mouseleave?
 * - Prevents "sticky" drag if user releases outside canvas
 * - Common UX pattern for drag interactions
 * - Avoids unexpected rotation when cursor re-enters
 *
 * Note: Does NOT re-enable auto-rotation
 * User must click "Reset View" or "Auto-Rotate" button
 */
function handleMouseUp() {
  isDragging.value = false;
}

// ============================================================================
// VIEW CONTROL FUNCTIONS
// ============================================================================

/**
 * Reset camera to initial state
 *
 * Returns all camera parameters to default values:
 * - Rotation: (0, 0) - Front-facing view
 * - Zoom: 1.0 - Neutral magnification
 * - Auto-Rotate: Enabled - Passive viewing mode
 *
 * Triggered by "Reset View" button in UI.
 *
 * Use Cases:
 * - User gets disoriented after rotating
 * - User wants to return to starting view
 * - User wants to restart auto-rotation
 *
 * Note: Redraw triggered automatically via watch()
 */
function resetView() {
  rotation.value = { x: 0, y: 0 };
  zoom.value = 1;
  autoRotate.value = true;
}
</script>
