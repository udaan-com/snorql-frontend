import React, { FunctionComponent, useState, useEffect } from "react";
import { Box, Typography } from "@mui/material"
import { HistoricalDataResult, IReadReplicationLag,IMetricHistoricalDataFilter, NextPageToken, IReadReplicationLagOutput, IReadReplicationLagResult } from "../../../models";
import { AlignedData } from 'uplot';
import { SQLService } from '../../../services/SQLService';
import { UPlot } from "../../../../common/components/plot/Plot";
import { getLayoutWidth } from "../../../../common/utils";
import ProgressView from "../../../../common/components/ProgressView";

interface HistoricalReadReplicaLagProps {
    databaseName: string;
}

interface IChartData extends IReadReplicationLag {
    timestamp: Date
}

export const HistoricalReadReplicaLag: FunctionComponent<HistoricalReadReplicaLagProps> = (props) => {
    var today = new Date();
    const temp_today = new Date();
    const weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalDataResult>();
    const [allResultRows, setAllResultRows] = useState<IChartData[]>([]);  
    const [readReplicationData, setReadReplicationData] = useState<AlignedData | null>(null);
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
        const metricId = "performance_readReplicationLag"
        const payload: IMetricHistoricalDataFilter = {
            "fromDate": dateTimeWeekAgo,
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
                let lagInMillis: number[] = [];
                 allResultRows.forEach(i => {
                    let datetime = new Date(i.timestamp)
                    datetime.setMinutes(datetime.getMinutes() + 330) // to convert to local timezone
                    xValues.push(datetime.getTime()/1000)
                    lagInMillis.push(i.replicationLagInMillis)
                })
                setReadReplicationData([xValues, lagInMillis])
            } else {
                setReadReplicationData(null);
            }
            setLoading(false)
        }
    }, [historicalDataFetchComplete])

    const toChartDataResponse = (res: HistoricalDataResult | null | undefined):IChartData[]  => {
        if (!res) return []
        let resultArr: IChartData[] = []
        if (res.result.length > 0) {
            for (var record of res.result) {
                const output: IReadReplicationLagOutput = JSON.parse(record.metricOutput)
                const result: IReadReplicationLagResult = output.result
                const queryList: IReadReplicationLag[] = result.queryList
                resultArr.push({
                    timestamp: record.timestamp,
                    replicationLagInMillis: queryList[0].replicationLagInMillis,
                    lastReceivedTimeInMillis: queryList[0].lastReceivedTimeInMillis,
                    lastRedoneTimeInMillis: queryList[0].lastRedoneTimeInMillis
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
                {!loading && !errorMessage && readReplicationData && readReplicationData.length > 0 ? (<Box paddingTop={1} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                    <div >
                        {readReplicationData && <UPlot
                            data={readReplicationData}
                            serieses={[
                                {label: 'Replication Lag(in millis)', fill: true}
                            ]}
                            width={getLayoutWidth(80)/2}
                        />}
                    </div>
                </Box>) : (readReplicationData == null) ? (
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