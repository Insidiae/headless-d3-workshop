import * as React from "react";

type TooltipState<DataType> = {
	show: boolean;
	coords: {
		x: number;
		y: number;
	};
	data?: DataType;
};

type TooltipAction<DataType> =
	| {
			type: "SHOW";
			payload: Omit<TooltipState<DataType>, "show">;
	  }
	| { type: "HIDE" };

const createTooltipReducer =
	<DataType>() =>
	(
		state: TooltipState<DataType>,
		action: TooltipAction<DataType>
	): TooltipState<DataType> => {
		switch (action.type) {
			case "HIDE":
				return { ...state, show: false };
			case "SHOW":
				return { ...state, show: true, ...action.payload };
		}
	};

function useTooltip<DataType>() {
	const tooltipReducer = createTooltipReducer<DataType>();
	const [tooltip, dispatch] = React.useReducer(tooltipReducer, {
		show: false,
		coords: {
			x: 0,
			y: 0,
		},
	});

	return [tooltip, dispatch] as const;
}

export default useTooltip;
