<template>
    <div>
      <DataTable
        :value="exoplanets"
        paginator
        showGridlines
        selectionMode="single"
        @rowSelect="onRowSelect"
        @rowUnselect="onRowUnselect"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :rows="10"
        resizableColumns 
        columnResizeMode="expand"
        :loading="loading"
        :globalFilterFields="globalFilterFields"
        :sortField="sortField"
        :sortOrder="1"
      >
        <template #header>
          <Button @click="loadData">Load Exoplanet Data</Button>
        </template>
        <template #empty> No exoplanets found. </template>
        <template #loading> Loading exoplanet data. Please wait. </template>
        <template #footer>Total TESS Confirmed Exoplanets: {{ exoplanets.length }}</template>
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
  import { ref, watch, defineEmits } from "vue";
  import { useExoplanetStore } from "@/stores/exoplanetStore";
  
  const emit = defineEmits(['select', 'unselect']);
  
  // Define the columns for the table
  const columns = [
    { key: "pl_name", label: "Name", frozen: true },
    { key: "hostname", label: "Host Name" },
    { key: "disc_year", label: "Discovery Year" },
    { key: "disc_method", label: "Discovery Method" },
    { key: "pl_orbper", label: "Orbital Period (days)" },
    { key: "disc_facility", label: "Discovery Facility" },
    { key: "pl_rade", label: "Planet Radius (Earth Radius)" },
    { key: "pl_radj", label: "Planet Radius (Jupiter Radius)" },
    { key: "pl_masse", label: "Planet Mass (Earth Mass)" },
    { key: "pl_eqt", label: "Equilibrium Temperature (K)" },
    { key: "st_teff", label: "Stellar Effective Temperature (K)" },
    { key: "st_rad", label: "Stellar Radius (Solar Radius)" },
    { key: "st_mass", label: "Stellar Mass (Solar Mass)" },
    { key: "st_logg", label: "Stellar Surface Gravity (log10(cm/s2))" },
    { key: "st_metfe", label: "Stellar Metallicity ([Fe/H])" },
    { key: "ra", label: "Right Ascension" },
    { key: "dec", label: "Declination" },
    { key: "elat", label: "Ecliptic Latitude" },
    { key: "elon", label: "Ecliptic Longitude" },
    { key: "glat", label: "Galactic Latitude" },
    { key: "glon", label: "Galactic Longitude" },
    { key: "sy_snum", label: "Number of Stars" },
    { key: "sy_pnum", label: "Number of Planets" },
    { key: "sy_mnum", label: "Number of Moons" },
    // Add more columns as needed
  ];
  
  const exoplanets = ref<any[]>([]);
  const exoplanetStore = useExoplanetStore();
  const globalFilter = ref<string>("");
  const loading = ref<boolean>(false);
  const sortField = ref<string>("pl_name");
  const globalFilterFields = [
    "pl_name",
    "hostname",
    "disc_method",
    "disc_facility",
  ];
  
  const loadData = async () => {
    loading.value = true;
    await exoplanetStore.fetchExoplanets();
    exoplanets.value = exoplanetStore.exoplanets.sort((a, b) =>
      a.pl_name.localeCompare(b.pl_name)
    );
    loading.value = false;
  };
  
  const onRowSelect = (event) => {
    emit('select', event.data);
  };
  
  const onRowUnselect = (event) => {
    emit('unselect', event.data);
  };
  
  watch(globalFilter, (newValue) => {
    exoplanetStore.$patch((state) => {
      state.globalFilter = newValue;
    });
  });
  </script>
  