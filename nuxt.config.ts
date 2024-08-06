import Aura from "@primevue/themes/aura";

export default defineNuxtConfig({
  modules: ["@pinia/nuxt", "@primevue/nuxt-module", "@nuxtjs/tailwindcss"],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },
  css: [
    'primeicons/primeicons.css',
    '~/styles/styles.scss', // Import the custom styles
    '~/assets/css/tailwind.css', // Import the custom styles
  ],
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
});