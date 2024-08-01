# Exoplanet Discovery

This project visualizes data from the NASA Exoplanet Archive, specifically focusing on exoplanets discovered by the TESS (Transiting Exoplanet Survey Satellite). It includes two primary components: `ExoplanetTable.vue` and `ExoplanetVisualization.vue`.

## Components

### ExoplanetTable.vue

This component is responsible for displaying a table of exoplanet data fetched from the NASA Exoplanet Archive.

#### Features:
- Fetches data from the NASA Exoplanet Archive using the `exoplanetStore` store.
- Displays the exoplanets' names, masses, right ascensions, and declinations in a tabular format.
- Includes a button to load the exoplanet data.
- The number of loaded exoplanets is displayed above the table.

#### Detailed Breakdown:

- **Template:**
  - Contains a button to trigger data loading.
  - Displays the count of exoplanets.
  - Renders a table with columns for planet name, mass, right ascension, and declination.
  - Uses a `v-for` directive to iterate over the list of exoplanets and display each one in a row.

- **Script:**
  - Utilizes the `setup` script to define component logic.
  - Imports the `useExoplanetStore` store from Pinia.
  - Defines a `ref` to hold the exoplanet data.
  - Implements a `loadData` function to fetch and assign the exoplanet data from the store.

- **Styles:**
  - Basic table styling for width, border, padding, and background color.
  - Button styling for appearance and hover effects.

### ExoplanetVisualization.vue

This component is responsible for visualizing the exoplanet data in a scatter plot using D3.js.

#### Features:
- Fetches data from the NASA Exoplanet Archive using the `exoplanetStore` store.
- Visualizes the exoplanets' right ascension and declination using a scatter plot.
- Dynamically adjusts the chart size based on the container's dimensions to ensure responsiveness.
- Uses `ResizeObserver` to handle resizing of the chart.

#### Detailed Breakdown:

- **Template:**
  - Contains a `div` element with a reference (`ref`) to attach the D3 chart.

- **Script:**
  - Imports necessary modules and functions from D3 and Vue.
  - Utilizes the `setup` script to define component logic.
  - Imports the `useExoplanetStore` store from Pinia.
  - Defines a `ref` for the chart container and a `ResizeObserver` to handle dynamic resizing.
  - Implements a `drawChart` function to create and update the D3 scatter plot.
  - Sets up `onMounted` and `onUnmounted` lifecycle hooks to fetch data, draw the chart, and manage the `ResizeObserver`.

- **Styles:**
  - Sets the chart container to take up the full width and a specified height (50vh).
  - Ensures the chart is responsive by observing the container size changes.

## Understanding Exoplanet Data

Here are some simple explanations for the data we show in the table and chart:

- **Planet Name**: This is the name of the exoplanet, like TOI-849 b. It's like naming a star or a planet.

- **Mass (Earth Masses)**: This tells us how heavy the exoplanet is compared to Earth. If an exoplanet has a mass of 1 Earth mass, it weighs about the same as Earth. If it has a mass of 2 Earth masses, it is twice as heavy as Earth.

- **Right Ascension (RA)**: Imagine the night sky as a big map. Right ascension is like the planet's address on that map, telling us where to look from left to right. It's similar to how we use longitude on Earth to find places east or west.

- **Declination (Dec)**: This is another part of the exoplanet's address in the sky, but it tells us where to look up and down. It's like latitude on Earth, which helps us find places north or south.

### Putting It All Together in a Scatter Plot
In our project, we use a scatter plot to show where different exoplanets (planets outside our solar system) are in the sky:

- **Right Ascension (RA)**: This will be on the horizontal (left to right) axis.
- **Declination (Dec)**: This will be on the vertical (up and down) axis.
- Each dot on the scatter plot represents an exoplanet. By looking at the plot, you can see where each exoplanet is located in the sky.

## Project Structure

The project structure is organized as follows:

- **components/**
  - `ExoplanetTable.vue`: Table component for displaying exoplanet data.
  - `ExoplanetVisualization.vue`: Visualization component for displaying a scatter plot of exoplanet data.

- **pages/**
  - `index.vue`: Main page that includes the table and visualization components.

- **server/api/**
  - `exoplanets.ts`: API endpoint to fetch exoplanet data from the NASA Exoplanet Archive.

- **stores/**
  - `exoplanetStore.ts`: Pinia store for managing and fetching exoplanet data.

- **types/**
  - `d3.d.ts`: TypeScript declarations for D3.js.
  - `exoplanet.ts`: TypeScript type definitions for exoplanet data.

- **public/**
  - Contains static assets like `favicon.ico`.

- **app.vue**: Root Vue component.

- **nuxt.config.ts**: Nuxt.js configuration file.

## Running the Project

1. **Install dependencies**:
   ```sh
   npm install


## Future Improvements
- `Enhanced Filtering`: Add more complex filtering options for the exoplanet data.
- `Interactive Charts`: Improve the D3 visualization to include tooltips and interactive elements.