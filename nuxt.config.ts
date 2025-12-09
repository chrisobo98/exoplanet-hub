import Aura from "@primevue/themes/aura";

export default defineNuxtConfig({
  ssr: false,
  modules: ["@primevue/nuxt-module", "@nuxtjs/tailwindcss"],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },
  css: [
    'primeicons/primeicons.css',
    '~/styles/styles.scss',
    '~/assets/css/tailwind.css',
  ],
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
});