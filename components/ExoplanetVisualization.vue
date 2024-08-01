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

const drawChart = () => {
  if (!chart.value) return;

  const data: Exoplanet[] = exoplanetStore.exoplanets;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const containerWidth = chart.value.clientWidth;
  const containerHeight = chart.value.clientHeight;

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  d3.select(chart.value).select('svg').remove(); // Remove any existing SVG element

  const svg = d3.select(chart.value)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, (d: Exoplanet) => d.ra) || 0])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d: Exoplanet) => d.dec) || 0])
    .range([height, 0]);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append('g')
    .call(d3.axisLeft(y));

  svg.selectAll('.dot')
    .data(data)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', (d: Exoplanet) => x(d.ra))
    .attr('cy', (d: Exoplanet) => y(d.dec))
    .attr('r', 3.5)
    .style('fill', '#69b3a2');
};

const handleResize = () => {
  drawChart();
};

onMounted(() => {
  exoplanetStore.fetchExoplanets().then(() => {
    drawChart();
    resizeObserver = new ResizeObserver(handleResize);
    if (chart.value) {
      resizeObserver.observe(chart.value);
    }
  });
});

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
  height: 50vh; /* Adjust height as needed */
}
</style>
