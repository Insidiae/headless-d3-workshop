<script setup lang="ts">
import { ref } from "vue";
import * as d3 from "d3";

import ScatterPlot from "./components/ScatterPlot.vue";

import type { CyclistData, BoundedDimensions } from "./utils/types";

//* Step 1a. Fetch Data
const dataset = ref<CyclistData[] | null>(null);
d3.json<CyclistData[]>(
	"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((res) => {
	dataset.value = res ?? null;
});

//* Step 2. Create chart dimensions
const chartSize = Math.max(
	650,
	Math.min(window.innerWidth, window.innerHeight) * 0.8
);
const dimensions: BoundedDimensions = {
	width: chartSize,
	height: chartSize,
	margin: {
		top: 75,
		right: 25,
		bottom: 50,
		left: 75,
	},
	boundedWidth: 0,
	boundedHeight: 0,
};

dimensions.boundedWidth =
	dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
	dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
</script>

<template>
	<div v-if="dataset" class="wrapper">
		<ScatterPlot :dataset="dataset" :dimensions="dimensions" />
	</div>
	<div v-else>Loading data...</div>
</template>
