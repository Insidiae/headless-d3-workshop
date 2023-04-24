async function drawDots() {
	//* Step 1. Access data
	const dataset = await d3.json(
		"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
	);

	const timeParser = d3.timeParse("%M:%S");
	const yAccessor = (d) => timeParser(d.Time);
	const xAccessor = (d) => d.Year;
	const colorAccessor = (d) => Boolean(d.Doping);

	//* Step 2. Create chart dimensions
	const chartSize = Math.max(
		650,
		Math.min(window.innerWidth, window.innerHeight) * 0.8
	);

	let dimensions = {
		width: chartSize,
		height: chartSize,
		margin: {
			top: 75,
			right: 25,
			bottom: 50,
			left: 75,
		},
	};

	dimensions.boundedWidth =
		dimensions.width - dimensions.margin.right - dimensions.margin.left;
	dimensions.boundedHeight =
		dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

	//* Step 3. Draw canvas
	const wrapper = d3
		.select("#wrapper")
		.append("svg")
		.attr("width", dimensions.width)
		.attr("height", dimensions.height);

	const bounds = wrapper
		.append("g")
		.style(
			"transform",
			`translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
		);

	//* Step 4. Create scales
	//TODO

	//* Step 5. Draw data
	//TODO

	//* Step 6. Draw peripherals
	//TODO

	//* Step 7. Set up interactions
	//TODO
}

drawDots();
