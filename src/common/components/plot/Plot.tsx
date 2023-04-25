import React, { useEffect, useRef } from "react";
import uPlot, { AlignedData, Options, Series } from "uplot";
import "uplot/dist/uPlot.min.css";
import { tooltipsPlugin } from "./PlotToolTipPlugin";
import { highLighterPlugin } from "./Highlighter";
import { convertNumberToUnit, MetricUnit } from "../../utils";

export const DEFAULT_HEIGHT = 300;
export const DEFAULT_WIDTH = window.innerWidth;

export const COLORS: string[] = [
    "#3498db",
    "#e77d22",
    "#e74c3d",
    "#2ecc70",
    "#9b58b5",
    "#34495e",
    "#f1cf0f",
    "#95a5a5",
    "#189f86",
    "#2a80b8",
    "#8f44ad",
    "#2d3e50",
    "#f39c12",
    "#25ae61",
    "#d25401",
    "#1cbc9b",
    "#c1382b",
    "#7e8c8d",
];

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

export const getSeriesConfig = (index: number, config: SeriesConfig): Series => {
    const color = config.color || COLORS[index % COLORS.length];
    const { r, g, b } = hexToRgb(color);
    return {
        show: true,
        spanGaps: false,
        label: config.label,
        value: (self, rawValue) => rawValue ? rawValue.toFixed(2) : '',
        stroke: color,
        width: 2,
        fill: config.fill ? `rgba(${r}, ${g}, ${b}, 0.3)` : undefined,
    }
};

export interface SeriesConfig {
    label: string;
    fill?: boolean;
    color?: string;
}

export interface UPlotProps {
    data: AlignedData;
    serieses: SeriesConfig[];
    height?: number;
    width?: number;
    yLabel?: string;
    yType?: MetricUnit;
    hideLegend?: boolean;
    startAtZero?: boolean;
    highlightX1?: number;
    highlightX2?: number;
}


export const UPlot: React.FC<UPlotProps> = props => {
    const container = useRef<HTMLDivElement | null>(null);
    const {
        height = DEFAULT_HEIGHT,
        width = DEFAULT_WIDTH,
        data,
        serieses,
        yLabel,
        yType = 'count',
    } = props;

    const config: Options = {
        height,
        width,
        plugins: [tooltipsPlugin({ yType }), highLighterPlugin({props})],
        scales: {
            y: {
                range: (self, min, max) => {
                    const minVal = props.startAtZero ? 0 : min < 0 ? min * 1.25 : min * 0.75;
                    const maxVal = max < 0 ? max * 0.75 : max * 1.25;
                    return [minVal, maxVal]
                } 
            }
        },
        series: [
            {},
            ...serieses.map(
                (s, i) => getSeriesConfig(i, s)
            )
        ],
        axes: [
            { label: "Time" },
            {
                label: yLabel,
                size: 60,
                values: (self, splits) => {
                    return splits.map(s => convertNumberToUnit(s, yType))
                },
            },
        ],
    };

    if (props.hideLegend) {
        config.legend = { show: false };
    }
    const plotRef = useRef<uPlot>();
    useEffect(() => {
        if (container.current) {
            if (plotRef.current) {
                plotRef.current.setData(data);
            } else {
                plotRef.current = new uPlot(config, data, container.current);
            }
        }
    }, [config, data]);
    return (
        <div ref={container} />
    )
};
