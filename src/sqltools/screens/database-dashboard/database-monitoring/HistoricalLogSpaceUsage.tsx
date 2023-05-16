import React, { FunctionComponent, useState, useEffect } from "react";
import { Box, Typography } from "@mui/material"
import { HistoricalDataResult, ILogSpaceUsage, ILogSpaceUsageOutput, ILogSpaceUsageResult, IMetricHistoricalDataFilter, NextPageToken } from "../../../models";
import { AlignedData } from 'uplot';
import { SQLService } from '../../../services/SQLService';
import { UPlot } from "../../../../common/components/plot/Plot";
import { getLayoutWidth } from "../../../../common/utils";
import ProgressView from "../../../../common/components/ProgressView";

interface HistoricalLogSpaceUsageProps {
    databaseName: string;
}

interface IChartData extends ILogSpaceUsage {
    timestamp: Date
}

export const HistoricalLogSpaceUsage: FunctionComponent<HistoricalLogSpaceUsageProps> = (props) => {
    var today = new Date();
    const temp_today = new Date();
    var dayAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 1));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    dayAgoDate.setHours(dayAgoDate.getHours() + 5); dayAgoDate.setMinutes(dayAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeDayAgo = dayAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalDataResult>();
    const [allResultRows, setAllResultRows] = useState<IChartData[]>([]);  
    const [logSpaceUsageData, setLogSpaceUsageData] = useState<AlignedData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [historicalDataFetchComplete, setHistoricalDataFetchComplete] = useState<boolean>(false);  

    useEffect(() => {
        fetchAllHistoricalData(null)
    }, [])
    

    useEffect(() => {
        if (historicalData && historicalData.result) {
            setAllResultRows(allResultRows.concat(toChartDataResponse(historicalData)))
            if (historicalData.metadata && historicalData.metadata.nextPartitionKey) {
                fetchAllHistoricalData(historicalData.metadata)
            } else {
                setHistoricalDataFetchComplete(true)
            }
        } else {
            setLoading(false)
        }
    }, [historicalData])

    const fetchAllHistoricalData = (nextPageToken: NextPageToken | null) => {
        setLoading(true)
        const metricId = "performance_logSpaceUsage"
        const payload: IMetricHistoricalDataFilter = {
            "fromDate": dateTimeDayAgo,
            "toDate": dateTimeNow,
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

    useEffect(() => {
        if (historicalDataFetchComplete) {
            console.log("allResultRows ", allResultRows)
            if(allResultRows.length > 0) {
                let xValues: number[] = [];
                let spaceUsed: number[] = [];
                let totalSpace: number[] = [];
                 allResultRows.forEach(i => {
                    let datetime = new Date(i.timestamp)
                    datetime.setMinutes(datetime.getMinutes() + 330) // to convert to local timezone
                    xValues.push(datetime.getTime()/1000)
                    spaceUsed.push(i.spaceUsedInGB)
                    totalSpace.push(i.maxSpaceInGB)
                })
                setLogSpaceUsageData([xValues, spaceUsed, totalSpace])
            } else {
                setLogSpaceUsageData(null);
            }
            setLoading(false)
        }
    }, [historicalDataFetchComplete])

    const toChartDataResponse = (res: HistoricalDataResult | null | undefined):IChartData[]  => {
        if (!res) return []
        let resultArr: IChartData[] = []
        if (res.result.length > 0) {
            for (var record of res.result) {
                const output: ILogSpaceUsageOutput = JSON.parse(record.metricOutput)
                const result: ILogSpaceUsageResult = output.result
                const queryList: ILogSpaceUsage[] = result.queryList
                resultArr.push({
                    timestamp: record.timestamp,
                    name: queryList[0].name,
                    spaceUsedInGB: parseFloat(queryList[0].spaceUsedInGB.toFixed(2)),
                    maxSpaceInGB: parseFloat(queryList[0].maxSpaceInGB.toFixed(2))
                })
            }
        }
        return resultArr
    }

    return (
        <Box mt={2}>
            <div>
                {errorMessage &&
                    <div style={{ marginLeft: '5px', padding: '10px', color: 'red', fontFamily: 'monospace' }}>
                        <details open>
                            <summary>Error</summary>
                            <p>{errorMessage}</p>
                        </details>
                    </div>
                }
                {!loading && !errorMessage && logSpaceUsageData && logSpaceUsageData.length > 0 ? (<Box paddingTop={1} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                    <div >
                        {logSpaceUsageData && <UPlot
                            data={logSpaceUsageData}
                            serieses={[
                                {label: 'Used Log Space(in GB)', fill: true},
                                {label: 'Max Log Space(in GB)', fill: true}
                            ]}
                            width={getLayoutWidth(80)/2}
                        />}
                    </div>
                </Box>) : (logSpaceUsageData == null) ? (
                        <Box padding={2}>
                            <Typography variant={'h6'}>No records found</Typography>
                        </Box>
                    ) : (
                        <div>
                            <span>Fetching Data ....</span>
                            <ProgressView/>
                        </div>
                    )}
            </div>
        </Box>
    )
}