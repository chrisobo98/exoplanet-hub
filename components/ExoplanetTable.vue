<template>
    <div>
      <Button @click="loadData">Load Exoplanet Data</Button>
      <p>Total Exoplanets: {{ exoplanets.length }}</p>
      <DataTable 
        :value="exoplanets" 
        paginator 
        :rows="10" 
        :loading="loading"
        :globalFilterFields="globalFilterFields"
        :sortField="sortField"
        :sortOrder="1"
      >
        <template #header>
          <div class="flex justify-end">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="globalFilter" placeholder="Keyword Search" />
            </span>
          </div>
        </template>
        <template #empty> No exoplanets found. </template>
        <template #loading> Loading exoplanet data. Please wait. </template>
  
        <Column 
          v-for="column in columns" 
          :key="column.key" 
          :field="column.key" 
          :header="column.label" 
          :sortable="true"
          :frozen="column.frozen"
        >
          <template #body="slotProps">
            {{ slotProps.data[column.key] }}
          </template>
        </Column>
      </DataTable>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useExoplanetStore } from '@/stores/exoplanetStore';
  
  // Define the columns for the table
  const columns = [
    { key: 'pl_name', label: 'Name', frozen: true },
    { key: 'hostname', label: 'Host Name' },
    { key: 'disc_year', label: 'Discovery Year' },
    { key: 'disc_method', label: 'Discovery Method' },
    { key: 'pl_orbper', label: 'Orbital Period (days)' },
    { key: 'disc_facility', label: 'Discovery Facility' },
    { key: 'pl_rade', label: 'Planet Radius (Earth Radius)' },
    { key: 'pl_radj', label: 'Planet Radius (Jupiter Radius)' },
    { key: 'pl_masse', label: 'Planet Mass (Earth Mass)' },
    { key: 'pl_eqt', label: 'Equilibrium Temperature (K)' },
    { key: 'st_teff', label: 'Stellar Effective Temperature (K)' },
    { key: 'st_rad', label: 'Stellar Radius (Solar Radius)' },
    { key: 'st_mass', label: 'Stellar Mass (Solar Mass)' },
    { key: 'st_logg', label: 'Stellar Surface Gravity (log10(cm/s2))' },
    { key: 'st_metfe', label: 'Stellar Metallicity ([Fe/H])' },
    { key: 'ra', label: 'Right Ascension' },
    { key: 'dec', label: 'Declination' },
    { key: 'elat', label: 'Ecliptic Latitude' },
    { key: 'elon', label: 'Ecliptic Longitude' },
    { key: 'glat', label: 'Galactic Latitude' },
    { key: 'glon', label: 'Galactic Longitude' },
    { key: 'sy_snum', label: 'Number of Stars' },
    { key: 'sy_pnum', label: 'Number of Planets' },
    { key: 'sy_mnum', label: 'Number of Moons' },
    // Add more columns as needed
  ];
  
  const exoplanets = ref<any[]>([]);
  const exoplanetStore = useExoplanetStore();
  const globalFilter = ref<string>('');
  const loading = ref<boolean>(false);
  const sortField = ref<string>('pl_name');
  const globalFilterFields = ['pl_name', 'hostname', 'disc_method', 'disc_facility'];
  
  // Load the exoplanet data
  const loadData = async () => {
    loading.value = true;
    await exoplanetStore.fetchExoplanets();
    exoplanets.value = exoplanetStore.exoplanets.sort((a, b) => a.pl_name.localeCompare(b.pl_name));
    loading.value = false;
  };
  
  // Watch for changes in globalFilter to update DataTable's filter
  watch(globalFilter, (newValue) => {
    exoplanetStore.$patch((state) => {
      state.globalFilter = newValue;
    });
  });
  </script>
  