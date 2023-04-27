# 02. Adding Improvements And Interactions

## Step 6, continued

Our chart is looking much better with the axis lines in place! Let's solve a few more test cases by adding some more annotations to the chart. As an example, let's add a label to the y-axis:

```js
const yAxisLabel = yAxis
	.append("text")
	.attr("x", 0)
	.attr("y", -dimensions.margin.left + 25)
	.attr("transform", "rotate(-90)")
	.attr("fill", "var(--color-text)")
	.style("font-size", "1.6em")
	.style("font-weight", "bold")
	.style("text-anchor", "end")
	.text("Time in Minutes");
```

This is just a simple process of adding a few SVG elements using D3, and we're just setting attributes and styles like we typically would in other web projects.

### Add helpful labels to our chart

Now it's your turn! Let's use D3 to add a title at the top of the chart with the following text:

> Doping in Professional Bicycle Racing
>
> 35 Fastest times up Alpe d'Huez

- Remember to add `id="title"` to your element to make the unit test pass!

<details>
	<summary>Solution</summary>

```js
const title = wrapper
	.append("g")
	.attr("id", "title")
	.style("transform", `translate(${dimensions.width / 2}px, ${35}px)`);

title
	.append("text")
	.attr("fill", "var(--color-text)")
	.style("font-size", "1.6em")
	.style("font-weight", "bold")
	.style("text-anchor", "middle")
	.text("Doping in Professional Bicycle Racing");

title
	.append("text")
	.attr("y", 25)
	.attr("fill", "var(--color-text)")
	.style("font-size", "1.4em")
	.style("font-weight", "medium")
	.style("text-anchor", "middle")
	.text("35 Fastest times up Alpe d'Huez");
```

</details>

### Add legend icons

Let's solve another test case by adding a legend to our chart. Using the same process as before, we can use colored `<rect>`s along with some `<text>` to indicate the color classification of our scatterplot dots.

- Remember to add `id="legend"` to your element to make the unit test pass!

<details>
	<summary>Solution</summary>

```js
const legend = bounds
	.append("g")
	.attr("id", "legend")
	.style(
		"transform",
		`translate(${dimensions.boundedWidth}px, ${
			dimensions.boundedHeight / 2 - 50
		}px)`
	);

legend
	.append("text")
	.attr("x", -35)
	.attr("class", "legend-text")
	.text("No doping allegations");
legend
	.append("rect")
	.attr("x", -25)
	.attr("y", -12.5)
	.attr("width", 20)
	.attr("height", 20)
	.attr("class", "legend-no-doping");

legend
	.append("text")
	.attr("x", -35)
	.attr("y", 25)
	.attr("class", "legend-text")
	.text("Riders with doping allegations");
legend
	.append("rect")
	.attr("x", -25)
	.attr("y", 12.5)
	.attr("width", 20)
	.attr("height", 20)
	.attr("class", "legend-doping");
```

</details>

## Step 7. Set Up Interactions

We can spice up our chart some more by adding some tooltips! This lets us show more information about each data point that would otherwise not fit directly into our chart.

Let's take another look at our starter HTML code. we can see that we already have the basic structure in place:

```html
<div id="tooltip" class="tooltip">
	<div class="tooltip-athlete">
		<span id="name"></span>: <span id="nationality"></span>
	</div>
	<div class="tooltip-date">
		Year: <span id="year"></span>, Time: <span id="time"></span>
	</div>
	<p id="doping"></p>
</div>
```

### Show a tooltip when a dot is hovered

D3 provides some methods to let us attach event handlers to selected elements. [According to the docs](https://github.com/d3/d3-selection#handling-events), we can write event listeners just like how we write `.addEventListener()` in regular JS. Helpfully D3 can also pass a second parameter to our event listener containing the value of the selected data point. That means we can fill out the tooltip's contents with the correct values via our event handler!

Let's complete the final test cases by showing the tooltip when we hover over a dot.

**Hints**

- To show the tooltip when a dot is hovered, we'll need to make two event listeners - one for `mouseenter` (show when hovering) and one for `mouseleave` (hide when not hovered).
- Make sure to set the `data-year` attribute (using our accessor functions) when showing the tooltip. When hiding the tooltip, simply set the `data-year` to `null`.
- You'll need to use the second parameter for the event listener to get the correct values from the hovered data point. Specifically, you'll need `Name`, `Nationality`, `Doping`, and the year and time values covered by our accessor functions.
- The tooltip element already has CSS styles applied, so you only need to show and hide the tooltip vis changing its `opacity`.

<details>
	<summary>Solution</summary>

```js
const tooltip = d3.select("#tooltip");

function showTooltip(event, d) {
	const formatTime = d3.timeFormat("%M:%S");
	tooltip.select("#name").text(d.Name);
	tooltip.select("#nationality").text(d.Nationality);
	tooltip.select("#year").text(xAccessor(d));
	tooltip.select("#time").text(formatTime(yAccessor(d)));
	tooltip
		.select("#doping")
		.style("display", colorAccessor(d) ? "block" : "none")
		.text(d.Doping);

	const x = xScale(xAccessor(d)) + dimensions.margin.left;
	const y = yScale(yAccessor(d)) + dimensions.margin.top;

	tooltip
		.attr("data-year", xAccessor(d))
		.attr("data-doping", colorAccessor(d))
		.style("transform", `translate(calc(${x}px - 50%), calc(${y}px - 100%))`)
		.style("opacity", 1);
}

function hideTooltip() {
	tooltip.attr("data-year", null).style("opacity", 0);
}

bounds
	.selectAll("circle")
	.on("mouseenter", showTooltip)
	.on("mouseleave", hideTooltip);
```

</details>

### A better way to hover dots

With the tooltip interactions in place, we have now completed all test cases for this project. Great job!

There's still a couple more improvements we can make on our chart. Let's spice up the interaction events by adding extra stuff!

You might have noticed this already when testing the interaction events, but it might be difficult for some users to hover over the dots due to their size, not to mention some of the dots are too close that they're almost completely overlapping, making it even more difficult to hover over those specific dots.

One way to address this issue is to create a [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram):

![Example of a Voronoi diagram from Wikipedia](https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Euclidean_Voronoi_diagram.svg/440px-Euclidean_Voronoi_diagram.svg.png)

A Voronoi diagram is a plane which is divided into regions close to a given set of objects. In our case, we can use a Voronoi diagram to divvy up our `bounds` into regions where each region is a set of points closer to a specific dot than any of the other dots. That way, we can use the Voronoi diagram regions to effectively increase the area that we can listen to hover events!

Let's use D3 to start generating a Voronoi diagram:

```js
const delaunay = d3.Delaunay.from(
	dataset,
	(d) => xScale(xAccessor(d)),
	(d) => yScale(yAccessor(d))
);
const voronoi = delaunay.voronoi();
```

> **Note**
>
> [`d3.Delaunay`](https://github.com/d3/d3-delaunay) is an optimized library for computing the Voronoi diagram from a given dataset using [Delaunay Triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation).

Now it's your turn! [Read further into the D3 docs](https://github.com/d3/d3-delaunay#delaunay_voronoi), and use the `voronoi` values we just generated to display the diagram into the page. Remember to attach the same event listeners we are using afterwards!

**Hints**

- To display the Voronoi diagram, you'll need to set `xmax` and `ymax` values using the bounded dimension values we defined in Step 2, and then use the same technique in Step 5 to render each Voronoi region as a `<path>` element. `voronoi.renderCell()` returns the SVG path string you'll need for the `<path>`'s `d` attribute.
- Make sure to set `class="voronoi"` on each Voronoi region.
- In order to see the rendered Voronoi regions, you might want to uncomment the `stroke` style for the `.voronoi` class in `style.css`.

<details>
	<summary>Solution</summary>

```js
voronoi.xmax = dimensions.boundedWidth;
voronoi.ymax = dimensions.boundedHeight;

const voronoiCell = bounds
	.selectAll(".voronoi")
	.data(dataset)
	.join("path")
	.attr("class", "voronoi")
	.attr("d", (d, i) => voronoi.renderCell(i));

// And then after defining the hover functions:
voronoiCell.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
```

</details>

### Enhance the interaction with animations

We can improve the chart even further by adding some micro-interactions. For example, we can "enlarge" a dot when it is hovered!

An easy way to do this is to simply add a separate, larger dot when we run our event handlers. We can also use [D3 transitions](https://github.com/d3/d3-transition) to smoothly animate this dot when we show/hide it!

**Hints**

- We already have the `d` value as a second parameter to our event handlers. Using this value, we can use a similar technique as in Step 5 to display this new dot!
- Make sure to set `class="tooltip-dot"` for this new dot, and use the `data-doping` attribute to give it the same color as the hovered dot.

<details>
	<summary>Solution</summary>

```js
function showTooltip(event, d) {
	/* rest of the function goes here */

	//? Since we can't apply a z-index to an svg element,
	//? we'll just create a temporary fake dot to display
	//? on top of the currently "hovered" dot
	const tooltipDot = bounds
		.append("circle")
		.attr("class", "tooltip-dot")
		.attr("data-doping", colorAccessor(d))
		.attr("cx", xScale(xAccessor(d)))
		.attr("cy", yScale(yAccessor(d)))
		.style("pointer-events", "none")
		.transition()
		.duration(250)
		.attr("r", 7);
}

function hideTooltip() {
	/* rest of the function goes here */

	d3.selectAll(".tooltip-dot").transition().duration(500).attr("r", 0).remove();
}
```

</details>
