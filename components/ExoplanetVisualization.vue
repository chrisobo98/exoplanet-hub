<template>
  <div ref="chart" class="chart"></div>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import { onMounted, ref, onUnmounted } from 'vue';
import { useExoplanetStore } from '@/stores/exoplanetStore';
import type { Exoplanet } from '@/types/exoplanet';

const chart = ref<HTMLElement | null>(null);
const exoplanetStore = useExoplanetStore();

let resizeObserver: ResizeObserver | null = null;

// Function to draw the star map
const drawStarMap = () => {
  if (!chart.value) return;

  const data: Exoplanet[] = exoplanetStore.exoplanets;
  const width = 600; // Set width of the chart
  const height = 600; // Set height of the chart
  const cx = width / 2;
  const cy = height / 2;
  // Define the radius scale for circles representing exoplanets
  const radius = d3.scaleLinear()
    .domain(d3.extent(data, (d: Exoplanet) => d.pl_masse) as [number, number])
    .range([2, 8]); // Cap the minimum and maximum sizes

  const outline = d3.geoCircle().radius(90).center([0, 90])();
  const graticule = d3.geoGraticule().stepMinor([15, 10])();

  // Define the projection
  const projection = d3.geoStereographic()
      .reflectY(true)
      .scale((width - 120) * 0.5)
      .clipExtent([[0, 0], [width, height]])
      .rotate([0, -90])
      .translate([width / 2, height / 2])
      .precision(0.1);

  const path = d3.geoPath(projection);

  // Define the Voronoi diagram
  const voronoi = d3.Delaunay
    .from(data.map(d => projection([d.ra, d.dec]) as [number, number]))
    .voronoi([0, 0, width, height]);

  // Clear any existing SVG elements
  d3.select(chart.value).select('svg').remove();

  // Create the SVG container
  const svg = d3.select(chart.value)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', "display: block; margin: 0 -14px; width: 100%; height: auto; font: 10px sans-serif; color: white; background: radial-gradient(#081f4b 0%, #061616 100%); border-radius: 15px; overflow: hidden;")
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor');

  // Draw the graticule (grid lines)
  svg.append('path')
      .attr('d', path(graticule))
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.2);

  // Draw the outline
  svg.append('path')
      .attr('d', path(outline))
      .attr('fill', 'none')
      .attr('stroke', 'currentColor');

  // Draw 5-minute ticks
  svg.append("g")
      .attr("stroke", "currentColor")
    .selectAll()
    .data(d3.range(0, 1440, 5)) // every 5 minutes
    .join("line")
      .datum((d: number) => [
        projection([d / 4, 0]),
        projection([d / 4, d % 60 ? -1 : -2])
      ])
      .attr("x1", ([[x1]]: [[number, number]]) => x1)
      .attr("x2", ([, [x2]]: [[number, number], [number, number]]) => x2)
      .attr("y1", ([[, y1]]: [[number, number]]) => y1)
      .attr("y2", ([, [, y2]]: [[number, number], [number, number]]) => y2);

  // Draw hourly ticks and labels
  svg.append("g")
    .selectAll()
    .data(d3.range(0, 1440, 60)) // every hour
    .join("text")
      .attr("dy", "0.35em")
      .text((d: number) => `${d / 60}h`)
      .attr("font-size", (d: number) => d % 360 ? null : 14)
      .attr("font-weight", (d: number) => d % 360 ? null : "bold")
      .datum((d: number) => projection([d / 4, -4]))
      .attr("x", ([x]: [number, number]) => x)
      .attr("y", ([, y]: [number, number]) => y);

  // Draw 10° labels
  svg.append("g")
    .selectAll()
    .data(d3.range(10, 91, 10))
    .join("text")
      .attr("dy", "0.35em")
      .text((d: number) => `${d}°`)
      .datum((d: number) => projection([0, d]))
      .attr("x", ([x]: [number, number]) => x)
      .attr("y", ([, y]: [number, number]) => y);

  // Add focus circles for highlighting
  const focusDeclination = svg.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("fill", "none")
      .attr("stroke", "yellow");

  const focusRightAscension = svg.append("line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", cx)
      .attr("y2", cy)
      .attr("stroke", "yellow");

  // Draw the exoplanets as circles
  svg.append("g")
      .attr("stroke", "black")
    .selectAll()
    .data(data)
    .join("circle")
      .attr("r", (d: Exoplanet) => Math.max(2, Math.min(8, radius(d.pl_masse)))) // Cap the radius
      .attr("transform", (d: Exoplanet) => `translate(${projection([d.ra, d.dec])})`);

  // Draw the Voronoi cells and add event listeners
  svg.append("g")
      .attr("pointer-events", "all")
      .attr("fill", "none")
    .selectAll()
    .data(data)
    .join("path")
      .on("mouseover", (event: MouseEvent, d: Exoplanet) => mouseovered(event, d))
      .on("mouseout", (event: MouseEvent, d: Exoplanet) => mouseouted(event, d))
      .attr("d", (d: Exoplanet, i: number) => voronoi.renderCell(i))
    .append("title")
      .text((d: Exoplanet) => `Name: ${d.pl_name}\nMass: ${d.pl_masse} Earth masses`);

  // Function to handle mouseover event
  function mouseovered(event: MouseEvent, d: Exoplanet) {
    const [px, py] = projection([d.ra, d.dec]);
    const dx = px - cx;
    const dy = py - cy;
    const a = Math.atan2(dy, dx);
    focusDeclination.attr("r", Math.hypot(dx, dy));
    focusRightAscension.attr("x2", cx + 1e3 * Math.cos(a)).attr("y2", cy + 1e3 * Math.sin(a));
  }

  // Function to handle mouseout event
  function mouseouted(event: MouseEvent, d: Exoplanet) {
    focusDeclination.attr("r", null);
    focusRightAscension.attr("x2", cx).attr("y2", cy);
  }
};

// Function to handle resize events
const handleResize = () => {
  drawStarMap();
};

// Set up the component when mounted
onMounted(() => {
  exoplanetStore.fetchExoplanets().then(() => {
    drawStarMap();
    resizeObserver = new ResizeObserver(handleResize);
    if (chart.value) {
      resizeObserver.observe(chart.value);
    }
  });
});

// Clean up the component when unmounted
onUnmounted(() => {
  if (resizeObserver && chart.value) {
    resizeObserver.unobserve(chart.value);
  }
  resizeObserver = null;
});
</script>

<style scoped>
.chart {
  width: 100%;
  max-width: 600px; /* Set max width for better responsiveness */
  height: auto;
  border-radius: 15px; /* Rounds all four corners */
  overflow: hidden; /* Ensures content respects border radius */
}
</style>
