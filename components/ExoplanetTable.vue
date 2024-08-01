<template>
    <div>
      <button @click="loadData">Load Exoplanet Data</button>
      {{  exoplanets.length }}
      <table v-if="exoplanets.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mass (Earth Masses)</th>
            <th>Right Ascension</th>
            <th>Declination</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="planet in exoplanets" :key="planet.pl_name">
            <td>{{ planet.pl_name }}</td>
            <td>{{ planet.pl_masse }}</td>
            <td>{{ planet.ra }}</td>
            <td>{{ planet.dec }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useExoplanetStore } from '@/stores/exoplanetStore';
  
  const exoplanets = ref<any[]>([]);
  const exoplanetStore = useExoplanetStore();
  
  const loadData = async () => {
    await exoplanetStore.fetchExoplanets();
    exoplanets.value = exoplanetStore.exoplanets;
  };
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  th {
    background-color: #f2f2f2;
    text-align: left;
  }
  
  button {
    margin-bottom: 20px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>
  