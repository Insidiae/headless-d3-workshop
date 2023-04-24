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
