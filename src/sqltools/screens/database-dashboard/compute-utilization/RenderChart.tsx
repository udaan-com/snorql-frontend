import React, { FunctionComponent, useEffect, useState } from "react";
import { Typography, Box, FormControl, TextField, Button, InputLabel, Select, MenuItem } from "@material-ui/core"
import { SQLService } from "../../../services/SQLService";
import { IMetricHistoricalDataFilter, NextPageToken, HistoricalDataResult, 
    IComputeUtilizationResponse, IComputeUtilizationOutput, IComputeUtilizationResult } from "../../../models";
import { AggregationType } from "./ComputeUtilizationScreen";
import {getLayoutWidth} from "../../../../common/utils";
import { AlignedData } from 'uplot';
import { SqlUPlot } from './plugin/SqlUPlot';
import { QueryStoreScreen } from "./query-store/aggregate-query/QueryStoreScreen";
import InfoIcon from '@material-ui/icons/Info';
import ProgressView from '../../../../common/components/ProgressView';

export type IntervalDays = Interval.OneDay | Interval.SevenDays;
export enum Interval {
    OneDay,
    SevenDays
}
interface RenderChartProps {
    databaseName: string;
    aggregationType: AggregationType
}
export const getUTCDateToISO = (date: Date): string => {
    date.setHours(date.getHours() + 5); date.setMinutes(date.getMinutes() + 30);
    return date.toISOString().slice(0, 16)
}
export const RenderChart: FunctionComponent<RenderChartProps> = (props) => {
    const getDates = (interval: Interval) : {fromDate:string, toDate: string} => {
        let today =  new Date();
        let temp_today = new Date();
        let fromDate;
        if (interval === Interval.OneDay) {
            fromDate = new Date(temp_today.setDate(temp_today.getDate() - 1));
        } else if(interval === Interval.SevenDays) {
            fromDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
        } else {
            fromDate = new Date(temp_today.setDate(temp_today.getDate() - 2))
        }
        return {fromDate: getUTCDateToISO(fromDate), toDate: getUTCDateToISO(today) }
    }

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalDataResult>();
    const [allResultRows, setAllResultRows] = useState<IComputeUtilizationResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    const [historicalDataFetchComplete, setHistoricalDataFetchComplete] = useState<boolean>(false);    
    const [computeUtilizationAvgData, setComputeUtilizationAvgData] = useState<AlignedData | undefined>(undefined);
    const [computeUtilizationMaxData, setComputeUtilizationMaxData] = useState<AlignedData | undefined>(undefined);
    const [fromDate, setFromDate] = useState<string>(getDates(Interval.SevenDays).fromDate);
    const [toDate, setToDate] = useState<string>(getDates(Interval.SevenDays).toDate);

    useEffect(() => {
        fetchAllHistoricalData(null)
    }, [])
    
    useEffect(() => {
        console.log("computeUtilizationAvgData called");
    }, [computeUtilizationAvgData])
    

    useEffect(() => {
        if (historicalData && historicalData.result) {
            setAllResultRows(allResultRows.concat(toComputeUtilizationResponse(historicalData)))
            if (historicalData.metadata && historicalData.metadata.nextPartitionKey) {
                fetchAllHistoricalData(historicalData.metadata)
            } else {
                setHistoricalDataFetchComplete(true)
            }
        } else {
            setLoading(false)
        }
    }, [historicalData])

    const setChartData = (input: IComputeUtilizationResponse[]) => {
        let xValues: number[] = [];
        let avgCpuPercent: number[] = [];
        let avgDataIoPercent: number[] = [];
        let avgLogIoPercent: number[] = [];
        let avgMemoryPercent: number[] = [];
        let maxCpuPercent: number[] = [];
        let maxDataIoPercent: number[] = [];
        let maxLogIoPercent: number[] = [];
        let maxMemoryPercent: number[] = [];

        input.forEach((item) => {
            let datetime = new Date(item.timeId)
            datetime.setMinutes(datetime.getMinutes() + 330) // to convert to local timezone
            let xValue = datetime.getTime()/1000;

            xValues.push(xValue);
            avgCpuPercent.push(item.avgCpuPercent);
            avgDataIoPercent.push(item.avgDataIoPercent);
            avgLogIoPercent.push(item.avgLogIoPercent);
            avgMemoryPercent.push(item.avgMemoryPercent);
            maxCpuPercent.push(item.maxCpuPercent);
            maxDataIoPercent.push(item.maxDataIoPercent);
            maxLogIoPercent.push(item.maxLogIoPercent);
            maxMemoryPercent.push(item.maxMemoryPercent);
        });
        setComputeUtilizationAvgData([xValues, avgCpuPercent, avgDataIoPercent, avgLogIoPercent, avgMemoryPercent]);
        setComputeUtilizationMaxData([xValues, maxCpuPercent, maxDataIoPercent, maxLogIoPercent, maxMemoryPercent]);
        
    }

    useEffect(() => {
        if (historicalDataFetchComplete) {
            const uniqueQueryList = allResultRows.reduce((acc:IComputeUtilizationResponse[], current:IComputeUtilizationResponse) => {
                const x = acc.find(item => item.timeId === current.timeId);
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
            }, []);
            setChartData(uniqueQueryList)
            setLoading(false)
        }
    }, [historicalDataFetchComplete])

    const toComputeUtilizationResponse = (res: HistoricalDataResult | null | undefined):IComputeUtilizationResponse[]  => {
        if (!res) return []
        let resultArr: IComputeUtilizationResponse[] = []
        if (res.result.length > 0) {
            for (var record of res.result) {
                const output: IComputeUtilizationOutput = JSON.parse(record.metricOutput)
                const result: IComputeUtilizationResult = output.result
                const queryList: IComputeUtilizationResponse[] = result.queryList
                resultArr = [...resultArr, ...queryList]
            }
        }
        return resultArr
    }


    const fetchAllHistoricalData = (nextPageToken: NextPageToken | null) => {
        setLoading(true)
        const metricId = "performance_computeUtilization"
        const dates = getDates(Interval.SevenDays);
        const payload: IMetricHistoricalDataFilter = {
            "fromDate": dates.fromDate,
            "toDate": dates.toDate,
            "pageSize": 1000
        }
        if (nextPageToken && nextPageToken.nextPartitionKey) {
            payload.nextPartitionKey = nextPageToken.nextPartitionKey,
            payload.nextRowKey = nextPageToken.nextRowKey
        }
        SQLService.getMetricHistoricalData(metricId, props.databaseName, payload)
            .then((r) => {
                if ("code" in r && "message" in r && "detail" in r) {
                    setErrorMessage(`${r.message}: ${r.details}`);
                    setLoading(false)
                } else if ('error' in r) {
                    setErrorMessage(r.error)
                    setLoading(false)
                } else {
                    setHistoricalData(r)
                }
            })
    }
    return (
        <div>
            {errorMessage &&
                <div style={{ marginLeft: '5px', padding: '10px', color: 'red', fontFamily: 'monospace' }}>
                    <details open>
                        <summary>Error</summary>
                        <p>{errorMessage}</p>
                    </details>
                </div>
            }
            <Box paddingTop={1} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                <div>
                    { !props.databaseName.includes('readonly') && <>
                        <FormControl style={{ minWidth: '200px', marginLeft: '10px', marginRight: '10px' }}>
                            <TextField
                                id="from-date-render-chart"
                                type="datetime-local"
                                label="From Date Time"
                                variant="outlined"
                                value={fromDate}
                                required
                                onChange={(event: any) => event.target.value && event.target.value !== fromDate && setFromDate(event.target.value)}
                                InputProps={{ inputProps: { min: getDates(Interval.SevenDays).fromDate, max: getDates(Interval.SevenDays).toDate } }}
                            />
                        </FormControl>
                        <FormControl style={{ minWidth: '200px', marginLeft: '10px', marginRight: '10px' }}>
                            <TextField
                                id="to-date-render-chart"
                                type="datetime-local"
                                label="To Date Time"
                                variant="outlined"
                                value={toDate}
                                required
                                onChange={(event: any) => event.target.value && event.target.value !== toDate && setToDate(event.target.value)}
                                InputProps={{ inputProps: { min: getDates(Interval.SevenDays).fromDate, max: getDates(Interval.SevenDays).toDate } }}
                                />
                        </FormControl>
                        <Button 
                            id="set-zoom-render-chart"
                            variant="contained"
                            color="primary" 
                            style={{ marginLeft: 8, height: '56px', width: 'auto' }}
                        >
                            Set Zoom
                        </Button>
                    </>}
                    {!loading && !errorMessage && computeUtilizationMaxData && computeUtilizationMaxData[0].length > 0 ? (
                       <div style={{ width: '100%', marginTop:'10px' }}>
                        <Typography variant={'h6'}>{`${props.databaseName.includes('readonly') ? 'Replica Set' : 'Primary'}`}</Typography>
                            {props.aggregationType == 'Avg' && computeUtilizationAvgData!=undefined && <SqlUPlot
                                width={getLayoutWidth(80)/2}
                                data={computeUtilizationAvgData}
                                serieses={[
                                    {label: 'Avg CPU(%)'},
                                    {label: 'Avg Data IO(%)'},
                                    {label: 'Avg Log IO(%)'},
                                    {label: 'Avg Memory(%)'}
                                ]}
                                yType={'count'}
                                height={340}
                                setFromDt={setFromDate}
                                setToDt={setToDate}
                            />}
                            <Typography variant="caption" style={{display:'flex'}} gutterBottom>
                                <InfoIcon fontSize="small"/> Double click on the chart to reset default zoom.
                            </Typography>
                            {props.aggregationType == 'Max' && computeUtilizationMaxData!=undefined && <SqlUPlot
                                width={getLayoutWidth(80)/2}
                                data={computeUtilizationMaxData}
                                serieses={[
                                    {label: 'Max CPU(%)'},
                                    {label: 'Max Data IO(%)'},
                                    {label: 'Max Log IO(%)'},
                                    {label: 'Max Memory(%)'}
                                ]}
                                yType={'count'}
                                height={340}
                                setFromDt={setFromDate}
                                setToDt={setToDate}
                            />} 
                            {!props.databaseName.includes('readonly') && 
                                <QueryStoreScreen databaseName={props.databaseName} startTime={fromDate} endTime={toDate}/> 
                            }
                        </div>
                        
                    ) : computeUtilizationMaxData && computeUtilizationMaxData[0].length == 0 ? (
                            <Typography>No records found</Typography>
                    ) : (
                        <div>
                            <span>Fetching Data ....</span>
                            <ProgressView/>
                        </div>
                    )
                    }
                </div>
            </Box>
        </div>
    )
}