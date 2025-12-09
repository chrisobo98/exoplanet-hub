<template>
  <div class="space-y-6">
    <!-- Instructions -->
    <div class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6">
      <div class="flex items-start gap-3">
        <Info class="w-5 h-5 text-purple-400 mt-1" />
        <div>
          <h3 class="text-white text-lg font-semibold mb-2">Interactive 3D Star Map</h3>
          <p class="text-purple-200 text-sm">
            This visualization shows the spatial distribution of TESS-discovered exoplanets.
            Drag to rotate the view, use the controls to zoom, or enable auto-rotation.
            Colors indicate habitable zone status: <span class="text-green-400">green (habitable)</span>,
            <span class="text-red-400"> red (too hot)</span>, <span class="text-blue-400">blue (too cold)</span>.
          </p>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
      <div class="flex flex-wrap gap-3">
        <button
          @click="zoom = Math.min(zoom + 0.2, 3)"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <ZoomIn class="w-4 h-4" />
          Zoom In
        </button>
        <button
          @click="zoom = Math.max(zoom - 0.2, 0.3)"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <ZoomOut class="w-4 h-4" />
          Zoom Out
        </button>
        <button
          @click="resetView"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <RotateCcw class="w-4 h-4" />
          Reset View
        </button>
        <button
          @click="autoRotate = !autoRotate"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            autoRotate
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          ]"
        >
          <Camera class="w-4 h-4" />
          {{ autoRotate ? 'Auto-Rotate On' : 'Auto-Rotate Off' }}
        </button>
      </div>
      <div class="mt-3 text-purple-200 text-sm">
        Zoom: {{ zoom.toFixed(1) }}x | Rotation: X={{ rotation.x.toFixed(2) }}, Y={{ rotation.y.toFixed(2) }}
      </div>
    </div>

    <!-- Canvas -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
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

    <!-- Legend -->
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <h3 class="text-white text-lg font-semibold mb-4">Legend</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LegendItem color="#22c55e" label="Habitable Zone" description="Could support liquid water" />
        <LegendItem color="#ef4444" label="Too Hot" description="Too close to host star" />
        <LegendItem color="#3b82f6" label="Too Cold" description="Too far from host star" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Camera, RotateCcw, ZoomIn, ZoomOut, Info } from 'lucide-vue-next';
import { useExoplanets } from '@/composables/useExoplanets';

const { exoplanets, fetchExoplanets, isInHabitableZone } = useExoplanets();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const rotation = ref({ x: 0, y: 0 });
const zoom = ref(1);
const isDragging = ref(false);
const lastMouse = ref({ x: 0, y: 0 });
const autoRotate = ref(true);

onMounted(async () => {
  await fetchExoplanets();
  drawScene();

  // Auto-rotation animation
  const animate = () => {
    if (autoRotate.value) {
      rotation.value.y += 0.005;
      drawScene();
    }
    requestAnimationFrame(animate);
  };
  animate();
});

watch([rotation, zoom], () => {
  drawScene();
}, { deep: true });

function drawScene() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.fillStyle = '#0f0a1f';
  ctx.fillRect(0, 0, width, height);

  // Draw stars background
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 200; i++) {
    const x = (i * 137.508) % width;
    const y = (i * 97.342) % height;
    ctx.globalAlpha = Math.random() * 0.5 + 0.2;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;

  const cx = width / 2;
  const cy = height / 2;

  // Draw Sun at center
  const sunGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
  sunGradient.addColorStop(0, '#FDB813');
  sunGradient.addColorStop(0.5, '#FD8813');
  sunGradient.addColorStop(1, '#FD881330');
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FDB813';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Sol', cx, cy + 30);

  // Draw exoplanets
  exoplanets.value.forEach(planet => {
    const scale = 0.5 * zoom.value;

    let x = planet.x || 0;
    let y = planet.y || 0;
    let z = planet.z || 0;

    // Apply rotation
    const cosY = Math.cos(rotation.value.y);
    const sinY = Math.sin(rotation.value.y);
    const rotatedX = x * cosY - z * sinY;
    const rotatedZ = x * sinY + z * cosY;

    const cosX = Math.cos(rotation.value.x);
    const sinX = Math.sin(rotation.value.x);
    const rotatedY = y * cosX - rotatedZ * sinX;
    const finalZ = y * sinX + rotatedZ * cosX;

    // Perspective
    const perspective = Math.max(0.1, Math.min(2, 1000 / (1000 + finalZ)));
    const screenX = cx + rotatedX * scale * perspective;
    const screenY = cy - rotatedY * scale * perspective;

    // Color based on habitable zone
    const zone = isInHabitableZone(planet);
    let color = zone === 'habitable' ? '#22c55e' : zone === 'too-hot' ? '#ef4444' : '#3b82f6';

    const baseSize = Math.max(3, Math.min(12, (planet.pl_rade || 1) * 2));
    const size = Math.max(2, baseSize * perspective);
    const opacity = Math.max(0.3, Math.min(1, perspective));

    // Draw planet
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw glow
    const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, size * 2);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  });
}

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true;
  autoRotate.value = false;
  lastMouse.value = { x: e.clientX, y: e.clientY };
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    const dx = e.clientX - lastMouse.value.x;
    const dy = e.clientY - lastMouse.value.y;
    rotation.value.x += dy * 0.01;
    rotation.value.y += dx * 0.01;
    lastMouse.value = { x: e.clientX, y: e.clientY };
  }
}

function handleMouseUp() {
  isDragging.value = false;
}

function resetView() {
  rotation.value = { x: 0, y: 0 };
  zoom.value = 1;
  autoRotate.value = true;
}
</script>
