import { defineStore } from 'pinia';
import axios from 'axios';

export const useExoplanetStore = defineStore('exoplanetStore', {
  state: () => ({
    exoplanets: [] as any[],
    globalFilter: '' as string
  }),
  actions: {
    async fetchExoplanets() {
      try {
        const response = await axios.get('/api/exoplanets', {
          params: {
            query: `select pl_name, pl_masse, ra, dec from ps where disc_facility like '%TESS%' and default_flag = 1`,
          }
        });
        this.exoplanets = response.data;
      } catch (error) {
        console.error('Error fetching exoplanet data', error);
      }
    }
  }
});
