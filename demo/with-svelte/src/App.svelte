<script lang="ts">
  import * as d3 from "d3";

  import ScatterPlot from "./lib/ScatterPlot.svelte";

  import type { CyclistData, BoundedDimensions } from "./utils/types";

  //* Step 1a. Fetch Data
  async function promise() {
    const res = await d3.json<CyclistData[]>("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
    return res;
  }
  const fetchData = promise();

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

<div class="wrapper">
  {#await fetchData}
    <div>Loading data...</div>
  {:then dataset} 
    <ScatterPlot {dataset} {dimensions} />
  {/await}
</div>
