# 05. Refactoring The Chart Interactions

## Adding the tooltip interactions

This step is also slightly trickier to implement using a framework. The implementation for the event handlers may vary slightly depending on how your framework lets you manage state, but the overall logic should remain the same.

To implement the tooltip, we'll use state variables to manage three things:

- Whether the tooltip should be shown or not
- The position of the tooltip (x/y coordinates)
- The data we'll be displaying in the tooltip

With these pointers in mind, let's implement the `showTooltip` and `hideTooltip` functions using a framework!

**Hints**

- You can get the HTML code for the tooltip from the `index.html` file from the previous version.
- Since we're using TypeScript for this new version of the project, I've included a `TooltipData` and/or `TooltipState` types to help you figure out what you need to keep track of using state!
- The tooltip should initially be hidden, and the x/y coordinates can also be both set to `0` initially.
- For the `showTooltip` function, we'll only need to pass the `CyclistData` parameter from the hovered dot.

<details>
	<summary>Solution: React</summary>

Setup the interaction event handlers:

```tsx
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
	});
}

function hideTooltip() {
	setTooltip((prevState) => ({
		...prevState,
		show: false,
	}));
}
```

Then, display the tooltip data:

```tsx
{
	/* Step 7b. Create interactions */
}
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
	<p id="doping" style={{ display: tooltip.data?.doping ? "block" : "none" }}>
		{tooltip.data?.doping}
	</p>
</div>;
```

Finally, hook up the event handlers to the dots:

```tsx
{
	/* Step 5. Draw data */
}
{
	dataset.map((data, idx) => (
		<circle
			key={idx}
			className="dot"
			data-xvalue={xAccessor(data)}
			data-yvalue={yAccessor(data)}
			data-doping={colorAccessor(data)}
			cx={xScale(xAccessor(data))}
			cy={yScale(yAccessor(data))}
			r="5"
			onMouseEnter={() => showTooltip(data)}
			onMouseLeave={() => hideTooltip()}
		/>
	));
}
```

</details>

<details>
	<summary>Solution: Svelte</summary>

Setup the interaction event handlers:

```svelte
<script lang="ts">
	/* ... */

	//* Step 7a. Handle interactions
	let isTooltipVisible = false;
	let tooltipPosition = {
		x: 0,
		y: 0
	};

	let tooltipData: TooltipData | undefined;

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
	}

	function hideTooltip() {
		isTooltipVisible = false;
	}
</script>
```

Then, display the tooltip data:

```svelte
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
```

Finally, hook up the event handlers to the dots:

```svelte
<!-- Step 5. Draw data -->
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
```

</details>

<details>
	<summary>Solution: Vue</summary>

Setup the interaction event handlers:

```vue
<script setup lang="ts">
import { reactive } from "vue";

/* ... */

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
}

function hideTooltip() {
	tooltipState.show = false;
}
</script>
```

Then, display the tooltip data:

```vue
<template>
	<!-- ... -->

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
```

Finally, hook up the event handlers to the dots:

```vue
<template>
	<!-- ... -->

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
</template>
```

</details>

## Adding the Voronoi diagram

Now adding the Voronoi diagram should be a lot easier! We can use the same code as before to generate the voronoi cells:

```ts
const delaunay = d3.Delaunay.from(
	dataset,
	(d) => xScale(xAccessor(d)),
	(d) => yScale(yAccessor(d))
);
const voronoi = delaunay.voronoi();
voronoi.xmax = dimensions.boundedWidth;
voronoi.ymax = dimensions.boundedHeight;
```

Then, we can render these cells by inserting them in Step 5, and connect the `showTooltip` and `hideToltip` functions from before. Try it out yourself!

<details>
	<summary>Solution: React</summary>

```tsx
{
	dataset.map((data, idx) => (
		<path
			key={idx}
			className="voronoi"
			d={voronoi.renderCell(idx)}
			onMouseEnter={() => showTooltip(data)}
			onMouseLeave={() => hideTooltip()}
		/>
	));
}
```

</details>

<details>
	<summary>Solution: Svelte</summary>

```svelte
{#each dataset as data, idx}
	<!-- ... -->
	<path
		class="voronoi"
		d={voronoi.renderCell(idx)}
		on:mouseenter={() => showTooltip(data)}
		on:mouseleave={() => hideTooltip()}
	/>
{/each}
```

</details>

<details>
	<summary>Solution: Vue</summary>

```vue
<template>
	<!-- ... -->
	<path
		v-for="(data, idx) in dataset"
		class="voronoi"
		:d="voronoi.renderCell(idx)"
		@mouseenter="showTooltip(data)"
		@mouseleave="hideTooltip"
	/>
</template>
```

</details>

## Displaying the tooltip dot

There's only one thing left now to reimplement from the previous version! Again, we'll be using our framework of choice to show/hide the animated tooltip dot, but the solutions can be different depending on how you implement animations using your framework.

**Hint**

- Since we already have a state variable to keep track of our tooltip, we can add more fields to manage our tooltip dot.

> **Note**
>
> React doesn't come with a built-in animation library - instead, we rely on 3rd-party libraries to handle animations for us. I've included two examples using different libraries below.

<details>
	<summary>Solution: React + <a href="https://www.react-spring.dev/" target="_blank">React-Spring</a></summary>

Add more data to our tooltip state:

```tsx
type TooltipState = {
	/* ... */
	dot?: [
		{
			cx: number;
			cy: number;
			doping: boolean;
		}
	];
};
```

```tsx
setTooltip({
	/* ... */
	dot: [
		{
			cx: xScale(xAccessor(d)),
			cy: yScale(yAccessor(d)),
			doping: !!d.Doping,
		},
	],
});
```

Then, use React Spring to handle the animations:

```tsx
// Import these from react-spring:
import { useTransition, animated, config } from "@react-spring/web";

/* ... */

// Then, configure the animations for the tooltip dot:
const transitions = useTransition(tooltip.show ? tooltip.dot : undefined, {
	from: { r: 0 },
	enter: { r: 7 },
	leave: { r: 0 },
	config: config.wobbly,
});
```

```tsx
{
	/* Step 6. Draw peripherals */
}
{
	transitions(({ r }, dot) =>
		dot ? (
			<animated.circle
				className="tooltip-dot"
				data-doping={dot.doping}
				cx={dot.cx}
				cy={dot.cy}
				r={r}
				style={{ pointerEvents: "none" }}
			/>
		) : null
	);
}
```

</details>

<details>
	<summary>Solution: React + <a href="https://reactcommunity.org/react-transition-group/" target="_blank">React-Transition-Group</a></summary>

Add more data to our tooltip state:

```tsx
type TooltipState = {
	/* ... */
	dot?: {
		cx: number;
		cy: number;
	};
};
```

```tsx
setTooltip({
	/* ... */
	dot: {
		cx: xScale(xAccessor(d)),
		cy: yScale(yAccessor(d)),
	},
});
```

Then, use React Transition Group to handle the animations:

```tsx
{
	/* Step 6. Draw peripherals */
}
<TransitionGroup component={null}>
	<CSSTransition
		key={tooltip.show ? `${tooltip.dot?.cx}-${tooltip.dot?.cy}` : "hide"}
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
</TransitionGroup>;
```

</details>

<details>
	<summary>Solution: Svelte</summary>

Add more data to our tooltip state:

```svelte
<script lang="ts">
	/* ... */

	let tooltipDot: { cx: number; cy: number } | null = null;

	function showTooltip(d: CyclistData) {
		/* ... */
		tooltipDot = {
			cx: xScale(xAccessor(d)),
			cy: yScale(yAccessor(d)),
		};
	}

	function hideTooltip() {
		/* ... */
		tooltipDot = null;
	}
</script>
```

Next, create a custom transition function for the dot:

```svelte
<script lang="ts">
	/* ... */

	function animateDot(node, params?) {
		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || sineIn,
			css: (t) => `r: ${t * 7}`
		};
	}
</script>
```

Finally, display the tooltip dot:

```svelte
<!-- ... -->

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
```

</details>

<details>
	<summary>Solution: Vue</summary>

Add more data to our tooltip state:

```vue
<script setup lang="ts">
type TooltipState = {
	/* ... */
	dot?: {
		cx: number;
		cy: number;
	};
};

/* ... */

function showTooltip(d: CyclistData) {
	/* ... */
	tooltipState.dot = {
		cx: xScale(xAccessor(d)),
		cy: yScale(yAccessor(d)),
	};
}
</script>
```

Then, use Vue Transitions to display the tooltip dot:

```vue
<template>
	<!-- ... -->

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
</template>
```

</details>
