import * as React from "react";
import * as d3 from "d3";
import { TransitionGroup, CSSTransition } from "react-transition-group";

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

function ScatterPlot({
	dataset,
	dimensions,
}: {
	dataset: CyclistData[];
	dimensions: BoundedDimensions;
}) {
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
	const [tooltip, setTooltip] = React.useState<TooltipState>({
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

		setTooltip({
			show: true,
			coords: { x, y },
			data: {
				name: d.Name,
				nationality: d.Nationality,
				year: xAccessor(d),
				time: formatTime(yAccessor(d)),
				doping: d.Doping,
			},
			dot: {
				cx: xScale(xAccessor(d)),
				cy: yScale(yAccessor(d)),
			},
		});
	}

	function hideTooltip() {
		setTooltip((prevState) => ({
			...prevState,
			show: false,
		}));
	}

	const delaunay = d3.Delaunay.from(
		dataset,
		(d) => xScale(xAccessor(d)),
		(d) => yScale(yAccessor(d))
	);
	const voronoi = delaunay.voronoi();
	voronoi.xmax = dimensions.boundedWidth;
	voronoi.ymax = dimensions.boundedHeight;

	return (
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
							//? OPTIONAL: uncomment these to make the freeCodeCamp tests pass
							// onMouseEnter={() => showTooltip(data)}
							// onMouseLeave={() => hideTooltip()}
						/>
					))}
					{dataset.map((data, idx) => (
						<path
							key={idx}
							className="voronoi"
							d={voronoi.renderCell(idx)}
							onMouseEnter={() => showTooltip(data)}
							onMouseLeave={() => hideTooltip()}
						/>
					))}
					{/* Step 6. Draw peripherals */}
					<TransitionGroup component={null}>
						<CSSTransition
							key={
								tooltip.show ? `${tooltip.dot?.cx}-${tooltip.dot?.cy}` : "hide"
							}
							timeout={{ enter: 250, exit: 500 }}
							classNames="tooltip-dot"
							unmountOnExit
						>
							{tooltip.show ? (
								<circle
									className="tooltip-dot"
									data-doping={!!tooltip.data?.doping}
									cx={tooltip.dot?.cx || 0}
									cy={tooltip.dot?.cy || 0}
									style={{
										pointerEvents: "none",
									}}
								/>
							) : (
								//? This is just to let <TransitionGroup /> trigger
								//? the exit animation when hiding the tooltip
								<g />
							)}
						</CSSTransition>
					</TransitionGroup>
					<g
						id="x-axis"
						fontSize={10}
						fontFamily="sans-serif"
						textAnchor="middle"
						transform={`translate(0, ${dimensions.boundedHeight})`}
					>
						<line stroke="currentColor" x2={dimensions.boundedWidth} />
						{xTicks.map((tick, i) => (
							<g
								key={i}
								className="tick"
								transform={`translate(${xScale(tick)}, 0)`}
							>
								<line stroke="currentColor" y2={6} />
								<text fill="currentColor" y={9} dy="0.71em">
									{tick}
								</text>
							</g>
						))}
					</g>
					<g id="y-axis" fontSize={10} fontFamily="sans-serif" textAnchor="end">
						<line stroke="currentColor" y2={dimensions.boundedHeight} />
						{yTicks.map((tick, i) => (
							<g
								key={i}
								className="tick"
								transform={`translate(0, ${yScale(tick)})`}
							>
								<line stroke="currentColor" x2={-6} />
								<text fill="currentColor" x={-9} dy="0.32em">
									{d3.timeFormat("%M:%S")(tick)}
								</text>
							</g>
						))}
						<text
							x={0}
							y={-dimensions.margin.left + 25}
							transform="rotate(-90)"
							fill="var(--color-text)"
							style={{
								fontSize: "1.6em",
								fontWeight: "bold",
								textAnchor: "end",
							}}
						>
							Time in Minutes
						</text>
					</g>
					<g
						id="legend"
						style={{
							transform: `translate(${dimensions.boundedWidth}px, ${
								dimensions.boundedHeight / 2 - 50
							}px)`,
						}}
					>
						<text x={-35} className="legend-text">
							No doping allegations
						</text>
						<rect
							x={-25}
							y={-12.5}
							width={20}
							height={20}
							className="legend-no-doping"
						/>
						<text x={-35} y={25} className="legend-text">
							Riders with doping allegations
						</text>
						<rect
							x={-25}
							y={12.5}
							width={20}
							height={20}
							className="legend-doping"
						/>
					</g>
				</g>
				<g id="title" transform={`translate(${dimensions.width / 2}, 35)`}>
					<text
						style={{
							fill: "var(--color-text)",
							fontSize: "1.6em",
							fontWeight: "bold",
							textAnchor: "middle",
						}}
					>
						Doping in Professional Bicycle Racing
					</text>
					<text
						y={25}
						style={{
							fill: "var(--color-text)",
							fontSize: "1.4em",
							fontWeight: "medium",
							textAnchor: "middle",
						}}
					>
						35 Fastest times up Alpe d'Huez
					</text>
				</g>
			</svg>
			{/* Step 7b. Create interactions */}
			<div
				id="tooltip"
				className="tooltip"
				style={{
					opacity: tooltip.show ? 1 : 0,
					transform: `translate(calc(${tooltip.coords.x}px - 50%), calc(${tooltip.coords.y}px - 100%))`,
				}}
				data-year={tooltip.data?.year ?? null}
				data-doping={!!tooltip.data?.doping}
			>
				<div className="tooltip-athlete">
					<span id="name">{tooltip.data?.name}</span>:{" "}
					<span id="nationality">{tooltip.data?.nationality}</span>
				</div>
				<div className="tooltip-date">
					Year: <span id="year">{tooltip.data?.year}</span>, Time:{" "}
					<span id="time">{tooltip.data?.time}</span>
				</div>
				<p
					id="doping"
					style={{ display: tooltip.data?.doping ? "block" : "none" }}
				>
					{tooltip.data?.doping}
				</p>
			</div>
		</>
	);
}

export default ScatterPlot;
