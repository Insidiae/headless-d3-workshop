export interface Dimensions {
	height: number;
	width: number;
	margin: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

export interface BoundedDimensions extends Dimensions {
	boundedWidth: number;
	boundedHeight: number;
}

export type CyclistData = {
	Doping: string;
	Name: string;
	Nationality: string;
	Place: number;
	Seconds: number;
	Time: string;
	URL: string;
	Year: number;
};
