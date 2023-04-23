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

	const xTicks = xScale.ticks();
	const yTicks = yScale.ticks();

	//* Step 7a. Handle interactions
	let isTooltipVisible = false;
	let tooltipPosition = {
		x: 0,
		y: 0
	};

	let tooltipData: TooltipData | undefined;
	let tooltipDot: { cx: number; cy: number } | null = null;

	function showTooltip(d: CyclistData) {
		const formatTime = d3.timeFormat("%M:%S");
		const x = xScale(xAccessor(d)) + dimensions.margin.left;
		const y = yScale(yAccessor(d)) + dimensions.margin.top;

		isTooltipVisible = true;
		tooltipPosition = { x, y };
		tooltipData = {
			name: d.Name,
			nationality: d.Nationality,
			year: xAccessor(d),
			time: formatTime(yAccessor(d)),
			doping: d.Doping,
		}
		tooltipDot = {
			cx: xScale(xAccessor(d)),
			cy: yScale(yAccessor(d)),
		};
	}

	function hideTooltip() {
		isTooltipVisible = false;
		tooltipDot = null;
	}

	function animateDot(node, params?) {
		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || sineIn,
			css: (t) => `r: ${t * 7}`
		};
	}

	const delaunay = d3.Delaunay.from(
		dataset,
		(d) => xScale(xAccessor(d)),
		(d) => yScale(yAccessor(d))
	);
	const voronoi = delaunay.voronoi();
	voronoi.xmax = dimensions.boundedWidth;
	voronoi.ymax = dimensions.boundedHeight;
</script>

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
				on:mouseenter={() => showTooltip(data)}
				on:mouseleave={() => hideTooltip()}
			/>
			<path
				class="voronoi"
				d={voronoi.renderCell(idx)}
				on:mouseenter={() => showTooltip(data)}
				on:mouseleave={() => hideTooltip()}
			/>
		{/each}
		<!-- Step 6. Draw peripherals -->
		{#key tooltipDot}
			{#if isTooltipVisible}
				<circle
					in:animateDot="{{ duration: 250 }}"
					out:animateDot="{{ duration: 500, easing: sineOut }}"
					class="tooltip-dot"
					data-doping={!!tooltipData?.doping}
					cx={tooltipDot?.cx}
					cy={tooltipDot?.cy}
					style="pointer-events: none; r: 7"
				/>
			{/if}
		{/key}
		<g
			id="x-axis"
			font-size={10}
			font-family="sans-serif"
			text-anchor="middle"
			transform={`translate(0, ${dimensions.boundedHeight})`}
		>
			<line stroke="currentColor" x2={dimensions.boundedWidth} />
			{#each xTicks as tick}
				<g
					class="tick"
					transform={`translate(${xScale(tick)}, 0)`}
				>
					<line stroke="currentColor" y2={6} />
					<text fill="currentColor" y={9} dy="0.71em">
						{tick}
					</text>
				</g>
			{/each}
		</g>
		<g id="y-axis" font-size={10} font-family="sans-serif" text-anchor="end">
			<line stroke="currentColor" y2={dimensions.boundedHeight} />
			{#each yTicks as tick}
				<g
					class="tick"
					transform={`translate(0, ${yScale(tick)})`}
				>
					<line stroke="currentColor" x2={-6} />
					<text fill="currentColor" x={-9} dy="0.32em">
						{d3.timeFormat("%M:%S")(tick)}
					</text>
				</g>
			{/each}
			<text
				x={0}
				y={-dimensions.margin.left + 25}
				transform="rotate(-90)"
				fill="var(--color-text)"
				style="font-size: 1.6em; font-weight: bold; text-anchor: end;"
			>
				Time in Minutes
			</text>
		</g>
		<g
			id="legend"
			style="transform: translate({dimensions.boundedWidth}px, {dimensions.boundedHeight / 2 - 50}px)"
		>
			<text x={-35} class="legend-text">
				No doping allegations
			</text>
			<rect
				x={-25}
				y={-12.5}
				width={20}
				height={20}
				class="legend-no-doping"
			/>
			<text x={-35} y={25} class="legend-text">
				Riders with doping allegations
			</text>
			<rect
				x={-25}
				y={12.5}
				width={20}
				height={20}
				class="legend-doping"
			/>
		</g>
	</g>
	<g id="title" transform={`translate(${dimensions.width / 2}, 35)`}>
		<text
			style="fill: var(--color-text); font-size: 1.6em; font-weight: bold; text-anchor: middle"
		>
			Doping in Professional Bicycle Racing
		</text>
		<text
			y={25}
			style="fill: var(--color-text); font-size: 1.4em; font-weight: medium; text-anchor: middle"
		>
			35 Fastest times up Alpe d'Huez
		</text>
	</g>
</svg>
<!-- Step 7b. Create interactions -->
<div
	id="tooltip"
	class="tooltip"
	style="
		opacity: {isTooltipVisible ? 1 : 0};
		transform: translate(calc({tooltipPosition.x}px - 50%), calc({tooltipPosition.y}px - 100%));
	"
	data-year={tooltipData?.year ?? null}
	data-doping={!!tooltipData?.doping}
>
	<div class="tooltip-athlete">
		<span id="name">{tooltipData?.name}</span>:{" "}
		<span id="nationality">{tooltipData?.nationality}</span>
	</div>
	<div class="tooltip-date">
		Year: <span id="year">{tooltipData?.year}</span>, Time:{" "}
		<span id="time">{tooltipData?.time}</span>
	</div>
	<p
		id="doping"
		style="display: {tooltipData?.doping ? "block" : "none"}"
	>
		{tooltipData?.doping}
	</p>
</div>