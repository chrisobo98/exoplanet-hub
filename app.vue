<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Header -->
    <header class="bg-black/30 backdrop-blur-md border-b border-purple-500/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-3 sm:py-4 md:py-6">
          <!-- Logo and Title -->
          <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Globe class="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <h1 class="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
                Exoplanet Discovery Hub
              </h1>
              <p class="text-purple-200 text-[10px] sm:text-xs md:text-sm hidden sm:block">
                Exploring TESS discoveries from the NASA Exoplanet Archive
              </p>
            </div>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <a href="https://github.com/chrisobo98/exoplanet-hub" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm">GitHub</span>
            </a>
          </nav>

          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-purple-200 hover:text-white hover:bg-purple-500/20 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>

        <!-- Mobile Menu -->
        <div v-show="mobileMenuOpen" class="md:hidden pb-4 pt-2 border-t border-purple-500/20">
          <div class="flex flex-col gap-4">
            <p class="text-purple-200 text-xs">
              Exploring TESS discoveries from the NASA Exoplanet Archive
            </p>
            <a href="https://github.com/chrisobo98/exoplanet-hub" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-3 text-purple-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-purple-500/20">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm">View on GitHub</span>
            </a>
          </div>
        </div>
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
import { ref } from 'vue';
import { Globe, Menu, X } from 'lucide-vue-next';

const mobileMenuOpen = ref(false);
</script>
