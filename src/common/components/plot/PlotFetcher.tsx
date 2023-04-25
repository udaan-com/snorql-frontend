import React from 'react';
import {Fetcher, FetcherProps} from "../Fetcher";
import {UPlot, UPlotProps} from "./Plot";
import {Box, Paper, Typography} from "@material-ui/core";
import {getLayoutWidth} from "../../utils";

interface PlotFetcherProps<R> extends FetcherProps<R>, UPlotProps {
    title: string;
}

export function PlotFetcher<R> (props: PlotFetcherProps<R>) {
    const hasData = props.data.length > 0 && props.data[0].length > 0;
    return (
        <Paper>
            <Box px={2} pt={2}>
                <Typography variant={'h5'}>{props.title}</Typography>
            </Box>
            <Box>
                <Fetcher
                    fetchData={props.fetchData}
                    onFetch={props.onFetch}
                    onFetchError={props.onFetchError}
                >
                    {hasData && (
                        <UPlot
                            data={props.data}
                            serieses={props.serieses}
                            height={500}
                            width={getLayoutWidth(48)}
                            yLabel={props.yLabel}
                            yType={props.yType}
                        />
                    )}
                </Fetcher>
            </Box>
        </Paper>
    );
}
