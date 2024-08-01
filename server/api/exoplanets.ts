import { defineEventHandler, getQuery } from 'h3';
import axios from 'axios';

export default defineEventHandler(async (event) => {
  const { query } = getQuery(event);
  const API_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

  try {
    const response = await axios.get(API_URL, {
      params: {
        query,
        format: 'json'
      }
    });

    return response.data;
  } catch (error) {
    return {
      error: 'Error fetching data from Exoplanet Archive'
    };
  }
});
