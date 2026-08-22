import type { WatermarkSettings } from "../types";

export type { WatermarkSettings };

export const WATERMARKER_DEFAULTS: WatermarkSettings = {
	type: "text",
	text: "© My Brand",
	fontSizePct: 8,
	bold: true,
	color: "#ffffff",
	logoScalePct: 20,
	positionMode: "preset",
	preset: "bottom-right",
	customX: 50,
	customY: 50,
	marginPct: 4,
	opacityPct: 60,
	rotationDeg: 0,
	format: "keep",
	quality: 0.9,
};

export const POSITION_PRESETS = [
	{
		label: "Top Left",
		value: "top-left",
	},
	{
		label: "Top Center",
		value: "top-center",
	},
	{
		label: "Top Right",
		value: "top-right",
	},
	{
		label: "Center Left",
		value: "center-left",
	},
	{
		label: "Center",
		value: "center",
	},
	{
		label: "Center Right",
		value: "center-right",
	},
	{
		label: "Bottom Left",
		value: "bottom-left",
	},
	{
		label: "Bottom Center",
		value: "bottom-center",
	},
	{
		label: "Bottom Right",
		value: "bottom-right",
	},
];
