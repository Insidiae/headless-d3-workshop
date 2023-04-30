# 03. Using D3 With A JavaScript Framework

Great job working through the first part of the workshop and learning the basics of D3! Our first solution is great enough, but most modern JavaScript projects nowadays use a framework of some sort (React, Svelte, Vue, etc.). That's why in this next part of the workshop, we'll be revisiting the same steps we've done, in the context of our favorite JS frameworks.

## Starter Code Recap, Again

For this part, I have included starter code and solutions for **React**, **Svelte**, and **Vue**, all powered by [Vite](https://vitejs.dev/). Same as before, you can find the starter code in the `exercises` folder and choose `with-react`/`with-svelte`/`with-vue`.

The starter code includes some of the basic setup steps, such as fetching the dataset and defining the chart dimensions. We will then pass these as props to a separate `ScatterPlot` component, which we'll be working on later!

<details>
	<summary>Example: Starter Code (React)</summary>

```tsx
import * as React from "react";
import * as d3 from "d3";

import ScatterPlot from "./components/ScatterPlot";

import type { CyclistData, BoundedDimensions } from "./utils/types";

function App() {
	const [dataset, setDataset] = React.useState<CyclistData[] | null>(null);

	React.useEffect(() => {
		//* Step 1a. Fetch Data
		const abortController = new AbortController();
		d3.json<CyclistData[]>(
			"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json",
			{
				signal: abortController.signal,
			}
		).then((data) => setDataset(data ?? null));

		return () => {
			abortController.abort();
		};
	}, []);

	if (!dataset) {
		return <div>Loading data...</div>;
	}

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

	return (
		<div className="wrapper">
			<ScatterPlot dataset={dataset} dimensions={dimensions} />
		</div>
	);
}

export default App;
```

</details>

> **Note**
>
> If you wish to use a different framework, you can generate a simple starter code by simply starting up a basic project, fetching the dataset, defining the chart dimensions, and finally passing the dataset and dimensions as props to the ScatterPlot component we'll be working on together!

## Speedrunning steps 1 to 5

Let's warm up by very quickly (re)-doing Steps 1 through 5. Open up the `ScatterPlot` component file, and copypaste the accessors and scales:

<details>
	<summary>Solution</summary>

```ts
//* Step 1b. Access Data
const timeParser = d3.timeParse("%M:%S");
const yAccessor = (d: CyclistData) => timeParser(d.Time) as Date;
const xAccessor = (d: CyclistData) => d.Year;
const colorAccessor = (d: CyclistData) => Boolean(d.Doping);

//* Step 4. Create scales
const xScale = d3
	.scaleLinear()
	//? Add a bit of "padding" to the x axis
	.domain([
		d3.min(dataset, (d) => d.Year - 1),
		d3.max(dataset, (d) => d.Year + 1),
	] as [number, number])
	.range([0, dimensions.boundedWidth]);

const yScale = d3
	.scaleTime()
	.domain(d3.extent(dataset, yAccessor) as [Date, Date])
	.range([0, dimensions.boundedHeight])
	.nice();
```

</details>

Then draw the data using your framework of choice:

<details>
	<summary>Solution: React</summary>

```tsx
<>
	{/* Step 3. Draw canvas */}
	<svg width={dimensions.width} height={dimensions.height}>
		<g
			transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}
		>
			{/* Step 5. Draw data */}
			{dataset.map((data, idx) => (
				<circle
					key={idx}
					className="dot"
					data-xvalue={xAccessor(data)}
					data-yvalue={yAccessor(data)}
					data-doping={colorAccessor(data)}
					cx={xScale(xAccessor(data))}
					cy={yScale(yAccessor(data))}
					r="5"
				/>
			))}
		</g>
	</svg>
</>
```

</details>

<details>
	<summary>Solution: Svelte</summary>

```svelte
<!-- Step 3. Draw canvas -->
<svg width={dimensions.width} height={dimensions.height}>
	<g transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}>
		<!-- Step 5. Draw data -->
		{#each dataset as data, idx}
			<circle
				class="dot"
				data-xvalue={xAccessor(data)}
				data-yvalue={yAccessor(data)}
				data-doping={colorAccessor(data)}
				cx={xScale(xAccessor(data))}
				cy={yScale(yAccessor(data))}
				r="5"
			/>
		{/each}
	</g>
</svg>
```

</details>

<details>
	<summary>Solution: Vue</summary>

```vue
<template>
	<!-- Step 3. Draw canvas -->
	<svg :width="dimensions.width" :height="dimensions.height">
		<g
			:transform="`translate(${dimensions.margin.left}, ${dimensions.margin.top})`"
		>
			<!-- Step 5. Draw data -->
			<circle
				v-for="data in dataset"
				class="dot"
				:data-xvalue="xAccessor(data)"
				:data-yvalue="yAccessor(data)"
				:data-doping="colorAccessor(data)"
				:cx="xScale(xAccessor(data))"
				:cy="yScale(yAccessor(data))"
				r="5"
			/>
		</g>
	</svg>
</template>
```

</details>

Notice how much more awesome our solution looks this time around! We can use the same helper functions that D3 provides to process the given data, then use the techniques from our framework of choice for a more declarative way to draw our chart. In the next parts, we'll be using these same techniques (albeit with a slightly different approach, as we'll see later) to solve the later steps!
