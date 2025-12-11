<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Header -->
    <header class="bg-black/30 backdrop-blur-md border-b border-purple-500/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <Globe class="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
            Exoplanet Discovery Hub
          </h1>
        </div>
        <p class="text-purple-200 text-xs sm:text-sm">
          Exploring TESS discoveries from the NASA Exoplanet Archive
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-black/20 backdrop-blur-sm border-t border-purple-500/10 mt-12">
      <div class="max-w-7xl mx-auto px-4 py-6 text-center text-purple-200 text-sm">
        Data sourced from NASA Exoplanet Archive • TESS Mission
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Globe } from 'lucide-vue-next';
</script>
