<script setup lang="ts">
import { reactive } from "vue";
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
	dot?: {
		cx: number;
		cy: number;
	};
};

const { dataset, dimensions } = defineProps<{
	dataset: CyclistData[];
	dimensions: BoundedDimensions;
}>();

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
const tooltipState: TooltipState = reactive({
	show: false,
	coords: {
		x: 0,
		y: 0,
	},
});

function showTooltip(d: CyclistData) {
	const formatTime = d3.timeFormat("%M:%S");
	const x = xScale(xAccessor(d)) + dimensions.margin.left;
	const y = yScale(yAccessor(d)) + dimensions.margin.top;

	tooltipState.show = true;
	tooltipState.coords = { x, y };
	tooltipState.data = {
		name: d.Name,
		nationality: d.Nationality,
		year: xAccessor(d),
		time: formatTime(yAccessor(d)),
		doping: d.Doping,
	};
	tooltipState.dot = {
		cx: xScale(xAccessor(d)),
		cy: yScale(yAccessor(d)),
	};
}

function hideTooltip() {
	tooltipState.show = false;
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
				@mouseenter="showTooltip(data)"
				@mouseleave="hideTooltip"
			/>
			<path
				v-for="(data, idx) in dataset"
				class="voronoi"
				:d="voronoi.renderCell(idx)"
				@mouseenter="showTooltip(data)"
				@mouseleave="hideTooltip"
			/>
			<!-- Step 6. Draw peripherals -->
			<Transition>
				<circle
					v-if="tooltipState.show"
					:key="`${tooltipState.dot?.cx}-${tooltipState.dot?.cy}`"
					class="tooltip-dot"
					:data-doping="!!tooltipState.data?.doping"
					:cx="tooltipState.dot?.cx || 0"
					:cy="tooltipState.dot?.cy || 0"
					r="7"
					style="pointer-events: none"
				/>
			</Transition>
			<g
				id="x-axis"
				font-size="10"
				font-family="sans-serif"
				text-anchor="middle"
				:transform="`translate(0, ${dimensions.boundedHeight})`"
			>
				<line stroke="currentColor" :x2="dimensions.boundedWidth" />
				<g
					v-for="tick in xTicks"
					class="tick"
					:transform="`translate(${xScale(tick)}, 0)`"
				>
					<line stroke="currentColor" y2="6" />
					<text fill="currentColor" y="9" dy="0.71em">{{ tick }}</text>
				</g>
			</g>
			<g id="y-axis" font-size="10" font-family="sans-serif" text-anchor="end">
				<line stroke="currentColor" :y2="dimensions.boundedHeight" />
				<g v-for="tick in yTicks" :transform="`translate(0, ${yScale(tick)})`">
					<line stroke="currentColor" x2="-6" />
					<text fill="currentColor" x="-9" dy="0.32em">
						{{ d3.timeFormat("%M:%S")(tick) }}
					</text>
				</g>
				<text
					x="0"
					:y="-dimensions.margin.left + 25"
					transform="rotate(-90)"
					fill="var(--color-text)"
					style="font-size: 1.6em; font-weight: bold; text-anchor: end"
				>
					Time in Minutes
				</text>
			</g>
			<g
				id="legend"
				:style="`transform: translate(${dimensions.boundedWidth}px, ${
					dimensions.boundedHeight / 2 - 50
				}px)`"
			>
				<text x="-35" class="legend-text">No doping allegations</text>
				<rect
					x="-25"
					y="-12.5"
					width="20"
					height="20"
					class="legend-no-doping"
				/>
				<text x="-35" y="25" class="legend-text">
					Riders with doping allegations
				</text>
				<rect x="-25" y="12.5" width="20" height="20" class="legend-doping" />
			</g>
		</g>
		<g id="title" :transform="`translate(${dimensions.width / 2}, 35)`">
			<text
				style="
					fill: var(--color-text);
					font-size: 1.6em;
					font-weight: bold;
					text-anchor: middle;
				"
			>
				Doping in Professional Bicycle Racing
			</text>
			<text
				y="25"
				style="
					fill: var(--color-text);
					font-size: 1.4em;
					font-weight: medium;
					text-anchor: middle;
				"
			>
				35 Fastest times up Alpe d'Huez
			</text>
		</g>
	</svg>
	<!-- Step 7b. Create interactions -->
	<div
		id="tooltip"
		class="tooltip"
		:style="`
			opacity: ${tooltipState.show ? 1 : 0};
			transform: translate(calc(${tooltipState.coords.x}px - 50%), calc(${
			tooltipState.coords.y
		}px - 100%));
		`"
		:data-year="tooltipState.data?.year ?? null"
		:data-doping="!!tooltipState.data?.doping"
	>
		<div className="tooltip-athlete">
			<span id="name">{{ tooltipState.data?.name }}</span
			>:
			<span id="nationality">{{ tooltipState.data?.nationality }}</span>
		</div>
		<div className="tooltip-date">
			Year: <span id="year">{{ tooltipState.data?.year }}</span
			>, Time:
			<span id="time">{{ tooltipState.data?.time }}</span>
		</div>
		<p
			id="doping"
			:style="`display: ${tooltipState.data?.doping ? 'block' : 'none'}`"
		>
			{{ tooltipState.data?.doping }}
		</p>
	</div>
</template>
