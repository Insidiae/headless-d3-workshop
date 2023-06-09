import * as React from "react";
import * as d3 from "d3";

import type { CyclistData, BoundedDimensions } from "../utils/types";

type TooltipData = {
	name: string;
	nationality: string;
	year: number;
	time: string;
	doping: string;
};

type TooltipState = {
	show: boolean;
	coords: {
		x: number;
		y: number;
	};
	data?: TooltipData;
};

function ScatterPlot({
	dataset,
	dimensions,
}: {
	dataset: CyclistData[];
	dimensions: BoundedDimensions;
}) {
	//* Step 1b. Access Data
	//TODO

	//* Step 4. Create scales
	//TODO

	//* Step 7a. Handle interactions
	//TODO

	return (
		<>
			{/* Step 3. Draw canvas */}
			<svg width={dimensions.width} height={dimensions.height}>
				<g
					transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}
				>
					{/* Step 5. Draw data */}
					{/* TODO */}
					{/* Step 6. Draw peripherals */}
					{/* TODO */}
				</g>
			</svg>
			{/* Step 7b. Create interactions */}
			{/* TODO */}
		</>
	);
}

export default ScatterPlot;
