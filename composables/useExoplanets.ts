import { ref } from 'vue';
import axios from 'axios';

const exoplanets = ref<any[]>([]);
const globalFilter = ref<string>('');

export const useExoplanets = () => {
  const fetchExoplanets = async () => {
    try {
      const response = await axios.get('/api/exoplanets', {
        params: {
          query: `select pl_name, pl_masse, ra, dec from ps where disc_facility like '%TESS%' and default_flag = 1`,
        }
      });
      exoplanets.value = response.data;
    } catch (error) {
      console.error('Error fetching exoplanet data', error);
    }
  };

  return {
    exoplanets,
    globalFilter,
    fetchExoplanets
  };
};
