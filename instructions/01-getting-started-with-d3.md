# 01. Getting Started with D3

## Introduction

In this workshop, we'll be building one of [freeCodeCamp's Data Visualization certification projects](https://www.freecodecamp.org/learn/data-visualization/#data-visualization-projects). Specifically, we'll be [building a scatterplot graph](https://www.freecodecamp.org/learn/data-visualization/data-visualization-projects/visualize-data-with-a-scatterplot-graph) depicting the Doping allegations for the 35 fastest times for Bicycle Racing up Alpe d'Huez.

To build the scatterplot graph, we'll be using [**D3.js**](https://d3js.org/). D3 (which stands for **D**ata-**D**riven **D**ocuments) is perhaps the most popular framework for building data-driven visualizations in the web. It offers a wide variety of tools that give dynamic properties based on the data that we pass in.

When building dataviz projects with D3, I like to follow a 7-step guideline I learned from [Newline's Fullstack D3 course](https://www.newline.co/fullstack-d3):

1. Fetch/Access data
2. Create chart dimensions (how big do we want our chart to be?)
3. Draw the canvas (use the dimensions to define the inner/outer bounds of our chart)
4. Create scales (transform data values into dynamic properties)
5. Draw data
6. Draw peripherals (like the X/Y axes, annotations/legends, etc.)
7. Set up interactions (like showing tooltips on hover)

By itself, D3 is a fully-featured framework for working with the DOM, allowing us to turn dynamic properties from our data into tangible elements in the web page. This means we actually don't even need a JS framework to start building dataviz projects with D3! In this first part of the workshop, Let's follow the 7-step guideline to build the freeCodeCamp's Scatterplot project using plain HTML+CSS+JS.

## Starter Code Recap

For starters, navigate to `examples/vanilla/`, where you should see some starter code for this project. It only contains HTML+CSS+JS files, but it's recommended to use a local server to host these so that data fetching can work properly. Here are some quick options to serve these files via a local server:

- Use the [Live Server extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- In your terminal, navigate to `examples/vanilla/` and run `npx serve`

I've already written out the HTML and CSS we need, so we only need to work on `chart.js`. Steps 1 to 3 mainly deal with setting up the project, so I already filled out the code to speed things along. You can ship ahead to Step 4 if you like, or keep reading for a quick recap:

### Step 1. Access Data

To access the data we need, we first need to fetch the dataset from the link freeCodeCamp gave us. Next, we'll need to define some _accessor functions_ to help us specify which parts of the data we'll be using for the scatterplot. In this case, we need to use the `Year` for the x-axis, the `Time` for the y-axis, and we also need to set different colors for the dots based on if a cyclist had `Doping` allegations:

<details>
	<summary>Example</summary>

```js
//* Step 1. Access data
const dataset = await d3.json(
	"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
);

const timeParser = d3.timeParse("%M:%S");
const yAccessor = (d) => timeParser(d.Time);
const xAccessor = (d) => d.Year;
const colorAccessor = (d) => Boolean(d.Doping);
```

</details>

### Step 2. Create Chart Dimensions

We also need to specify the dimensions of the chart, to specify how big of a space our chart will take on the screen. For scatterplots, it's usually recommended to use equal width and height for the chart.

We also want to add margins to make space for later steps, such as adding the x- and y-axes and showing some helpful titles and annotations for our chart.

<details>
	<summary>Example</summary>

```js
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
```

</details>

### Step 3. Draw Canvas

Now that we have specified the dimensions for our chart, we can use the values we have set to draw our canvas to the DOM. For this project, we'll use SVG elements to draw our chart.

The `wrapper` contains the entirety of our chart, including any annotations we add later. We can simply set the `width` and `height` of this `<svg>` element to the corresponding full values we've defined in Step 2.

For the `bounds`, we only need to specify the space for the data points we'll be drawing. This is where we'll use the `boundedWidth` and `boundedHeight` values later, but for now we just need to nudge them a bit via `transform` to make space for our margins:

<details>
	<summary>Example</summary>

```js
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
```

</details>

## Step 4. Create Scales

Next, we'll need to scale our data to constrain our values within a certain range - In our case, we need to scale the `Year` values to the x-axis and the `Time` values to the y-axis.

D3 has built-in methods to generate these scale values. These methods require domain values (coming from our data) and range values (positions in the x/y axis). Remember the `boundedWidth` and `boundedHeight` values from Step 2? This is where we'll use them for the range values!

These scale functions will then let us map the data values into specific positions as we draw them into the canvas later.

**Hints**

- Read the docs on D3 scale functions. In our case, we'll need to scale the values using a [continuous scale](https://github.com/d3/d3-scale#continuous-scales).
- Our dataset is already an array of values. That means we can use [D3's array helper functions](https://github.com/d3/d3-array#statistics) to easily get the min/max values we need for the domain values.

<details>
	<summary>Solution</summary>

```js
//* Step 4. Create scales
const xScale = d3
	.scaleLinear()
	//? Add a bit of "padding" to the x axis
	.domain([
		d3.min(dataset, (d) => d.Year - 1),
		d3.max(dataset, (d) => d.Year + 1),
	])
	.range([0, dimensions.boundedWidth]);

const yScale = d3
	.scaleTime()
	.domain(d3.extent(dataset, yAccessor))
	.range([0, dimensions.boundedHeight])
	.nice();
```

</details>

## Step 5. Draw Data

Now it's time to put our data points into the canvas! This is where we make D3 manipulate the DOM to add elements corresponding to our data.

First, we define a D3 selection to tell it to manipulate `<circle>` elements, then we bind this D3 selection to our dataset:

```js
//* Step 5. Draw data
const dots = bounds.selectAll("circle").data(dataset);
```

With the D3 selection in place, your task is to [join the data](https://github.com/d3/d3-selection#joining-data) to finally place the scatterplot dots to our canvas. Make sure to apply the following attributes to each element:

- Each element should have `class="dot"` and `r="5"`.
- Each element should have `data-xvalue`, `data-yvalue`, and `data-doping` attributes corresponding to the data values. (**Hint:** Use the accessor functions from Step 1)
- Each element should have `cx` and `cy` attributes corresponding to the _scaled_ data values. (**Hint:** Use the scale functions from Step 4 combined with the accessor functions from Step 1)

<details>
	<summary>Solution</summary>

```js
//* Step 5. Draw data
const dots = bounds.selectAll("circle").data(dataset);

dots
	.join("circle")
	.attr("class", "dot")
	.attr("data-xvalue", (d) => xAccessor(d))
	.attr("data-yvalue", (d) => yAccessor(d))
	.attr("data-doping", (d) => colorAccessor(d))
	.attr("cx", (d) => xScale(xAccessor(d)))
	.attr("cy", (d) => yScale(yAccessor(d)))
	.attr("r", 5);
```

> **Note**: **How did we apply colors to our scatterplot dots?**
>
> Notice the `data-doping` attribute we just applied to our `dots`:
>
> ```js
> dots
> 	.join("circle")
> 	.attr("class", "dot")
> 	.attr("data-xvalue", (d) => xAccessor(d))
> 	.attr("data-yvalue", (d) => yAccessor(d))
> 	.attr("data-doping", (d) => colorAccessor(d));
> ```
>
> I actually defined the colors in the `style.css` and used the `data-doping` attribute to apply the colors:
>
> ```css
> :root {
> 	--color-no-doping: hsl(250deg 100% 75%);
> 	--color-doping: hsl(330deg 100% 75%);
> }
>
> .dot,
> .tooltip-dot {
> 	fill: var(--color-no-doping);
> }
>
> .dot[data-doping="true"],
> .tooltip-dot[data-doping="true"] {
> 	fill: var(--color-doping);
> }
> ```
>
> Alternatively, we can also create a scale function for coloring our scatterplot dots:
>
> <details>
> <summary>Example</summary>
>
> ```js
> // Create a colorScale function in step 4:
> const colorScale = d3
> 	.scaleOrdinal()
> 	.domain([true, false])
> 	.range(["hsl(330deg 100% 75%)", "hsl(250deg 100% 75%)"]); //["#FF80BF", "#9580FF"]
>
> // And then use it in step 5:
> dots
> 	.join("circle")
> 	.attr("class", "dot")
> 	.attr("cx", (d) => xScale(xAccessor(d)))
> 	.attr("cy", (d) => yScale(yAccessor(d)))
> 	.attr("fill", (d) => colorScale(colorAccessor(d)));
> ```
>
> </details>

</details>

## Step 6. Draw Peripherals

Having the scatterplot dots on the screen looks nice, but it's still difficult to make sense of our data because we're still missing an important part: we need to display the x- and y-axes!

Again, D3 has built-in methods to display each axis:

```js
const axisGenerator = d3
	.axisBottom() // or axisLeft/axisTop/axisRight
	.scale(/* your scale function */)
	.tickFormat(/* if you want to format exis ticks */);
const axis = bounds
	.append("g")
	.call(axisGenerator)
	.attr(/* any attaibute you want to apply */)
	.style(/* any style you want to apply */);
```

We already have everything we need to display the axis lines, so now is a good time to [read the D3 docs](https://github.com/d3/d3-axis#api-reference) and implement our x- and y-axes!

Some things to take note:

- Make sure to set `id="x-axis"` or `id="y-axis"` when displaying each axis line.
- Make sure to use the scale functions from Step 4 so that the axis lines actually correspond to our data points.
- You might also want to format each tick value when the axis lines are displayed.

<details>
	<summary>Solution</summary>

```js
//* Step 6. Draw peripherals
const xAxisGenerator = d3.axisBottom().scale(xScale).tickFormat(d3.format(""));
const xAxis = bounds
	.append("g")
	.call(xAxisGenerator)
	.attr("id", "x-axis")
	.style("transform", `translateY(${dimensions.boundedHeight}px)`);

const yAxisGenerator = d3
	.axisLeft()
	.scale(yScale)
	.tickFormat(d3.timeFormat("%M:%S"));
const yAxis = bounds.append("g").call(yAxisGenerator).attr("id", "y-axis");
```

</details>
