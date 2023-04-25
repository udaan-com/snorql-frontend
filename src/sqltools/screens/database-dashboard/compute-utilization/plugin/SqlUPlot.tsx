import React, { useEffect, useRef } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, getSeriesConfig, UPlotProps } from "../../../../../common/components/plot/Plot";
import { tooltipsPlugin } from "../../../../../common/components/plot/PlotToolTipPlugin";
import { customZoomPlugin } from "./CustomZoomPlugin"
import { convertNumberToUnit } from "../../../../../common/utils";
import { getUTCDateToISO } from '../RenderChart';

interface SqlUPlotProps extends UPlotProps {
    setFromDt?: (fromDt: string) => void,
    setToDt?: (toDt: string) => void
}

const getFormattedDateString = (timestamp: number): string => {
    const date = new Date(timestamp*1000);
    return getUTCDateToISO(date);
}

export const SqlUPlot: React.FC<SqlUPlotProps> = props => {
    const container = useRef<HTMLDivElement | null>(null);
    const {
        height = DEFAULT_HEIGHT,
        width = DEFAULT_WIDTH,
        data,
        serieses,
        yLabel,
        yType = 'count',
        setFromDt,
        setToDt
    } = props;

    const config: Options = {
        height,
        width,
        plugins: [tooltipsPlugin({ yType }), customZoomPlugin()],
        scales: {
            y: {
                range: (self, min, max) => {
                    const minVal = props.startAtZero ? 0 : min < 0 ? min * 1.25 : min * 0.75;
                    const maxVal = max < 0 ? max * 0.75 : max * 1.25;
                    return [minVal, maxVal]
                } 
            },
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
        hooks: {
            setSelect: [
                u => {
                    console.log("setSelect");
                    let min = u.posToVal(u.select.left, 'x');
                    let max = u.posToVal(u.select.left + u.select.width, 'x');
                    
                    const minDate = getFormattedDateString(min);
                    const maxDate = getFormattedDateString(max);
                    
                    setFromDt!=null && setFromDt(minDate);
                    setToDt!=null && setToDt(maxDate);
                    u.setData(data, false)
                    u.setScale("x", {
                            min: min,
                            max: max
                        });
                }
            ],
        }
    };

    if (props.hideLegend) {
        config.legend = { show: false };
    }
    const plotRef = useRef<uPlot>();
    useEffect(() => {
        if (container.current) {
            if (plotRef.current) {
                plotRef.current.setData(data, false);
            } else {
                plotRef.current = new uPlot(config, data, container.current);
            }
        }
    }, [config, data]);
    return (
        <div ref={container} />
    )
};
