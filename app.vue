<template>
  <div>
    <Header />
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from "@/layouts/Header.vue";
</script>

<style scoped>
header {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  padding: 2rem;
}
</style>
