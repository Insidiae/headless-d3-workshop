<script lang="ts">
	import { sineIn, sineOut } from 'svelte/easing';
	import * as d3 from "d3";

	import type { CyclistData, BoundedDimensions } from "../utils/types";

	type TooltipData = {
		name: string;
		nationality: string;
		year: number;
		time: string;
		doping: string;
	};

	export let dataset: CyclistData[];
	export let dimensions: BoundedDimensions;

	//* Step 1b. Access Data
	//TODO

	//* Step 4. Create scales
	//TODO

	//* Step 7a. Handle interactions
	//TODO
</script>

<!-- Step 3. Draw canvas -->
<svg width={dimensions.width} height={dimensions.height}>
	<g transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}>
		<!-- Step 5. Draw data -->
		<!-- TODO -->
		<!-- Step 6. Draw peripherals -->
		<!-- TODO -->
	</g>
</svg>
<!-- Step 7b. Create interactions -->
<!-- TODO -->