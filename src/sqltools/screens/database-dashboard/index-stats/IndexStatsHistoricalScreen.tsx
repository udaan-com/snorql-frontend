import { Box, Table, TableBody, TableCell, TableRow, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { HistoricalDataResult, ICustomError, IIndexStatsOutput, IIndexStatsResponse, IIndexStatsResult, IMetricHistoricalDataFilter, IMetricHistoricalDataSchema, NextPageToken } from "../../../models";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { MetricHeader } from "../../../components/MetricHeader";
import { SQLService } from "../../../services/SQLService";

interface IndexStatsProps {
    databaseName: string;
}

export const IndexStatsHistoricalScreen: FunctionComponent<IndexStatsProps> = (props) => {

    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [indexStatsHistoricalData, setIndexStatsHistoricalData] = useState<IMetricHistoricalDataSchema[]>([]);
    const [indexStats, setIndexStats] = useState<IIndexStatsResponse[]>([]);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);
    const [indexStatsHistoricalDataSnapshotRunId, setIndexStatsHistoricalDataSnapshotRunId] = useState('');
    const [receivedAllHistoricalData, setReceivedAllHistoricalData] = useState<boolean>(false);
    const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
    const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
    const [pageSize, setPageSize] = useState(40);

    useEffect(() => {
        if (fromDate && toDate) {
            setDateChangedFlag(true);
            setIndexStatsHistoricalDataSnapshotRunId('');
            setIndexStatsHistoricalData([]);
            setReceivedAllHistoricalData(false);
            setNextPageToken({});
        }
    }, [fromDate, toDate])

    useEffect(() => {
        if (dateChangedFlag) {
            setDateChangedFlag(false);
            fetchHistoricalIndexStatsData();
        }
    }, [dateChangedFlag])

    const handleOnHistoricalApiResponse = (r: HistoricalDataResult | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            setIndexStatsHistoricalData(indexStatsHistoricalData.concat(r.result))
            if (!r.metadata || r.result.length < pageSize) { 
                setReceivedAllHistoricalData(true);
                setNextPageToken(r.metadata);
            } else {
                setNextPageToken(r.metadata)
            }
        }
        setLoadingHistoricalData(false)
    }

    const fetchHistoricalIndexStatsData = () => {
        setLoadingHistoricalData(true)
        const metricId = 'performance_indexStats'
        const payload: IMetricHistoricalDataFilter = {
            "fromDate": fromDate,
            "toDate": toDate,
            "pageSize": pageSize
        }
        if (nextPageToken) {
            payload.nextPartitionKey = nextPageToken.nextPartitionKey
            payload.nextRowKey = nextPageToken.nextRowKey
        }
        SQLService.getMetricHistoricalData(metricId, props.databaseName, payload)
        .then((r) => {
            handleOnHistoricalApiResponse(r)
        })
    }

    const loadMoreTimestamps = () => {
        if (!receivedAllHistoricalData && !loadingHistoricalData) {
            setLoadingHistoricalData(true)
            fetchHistoricalIndexStatsData();
        }
    }

    const handleToDateChange = (newToDate: string) => {
        if (newToDate && newToDate !== toDate) {
            setToDate(newToDate)
        }
    }

    const handleFromDateChange = (newFromDate: string) => {
        setFromDate(newFromDate)
        if (newFromDate && newFromDate !== fromDate) {
            setFromDate(newFromDate)
        }
    }

    const handleRunIdChange = (runId: string) => {
        setIndexStatsHistoricalDataSnapshotRunId(runId)
        if (runId && indexStatsHistoricalData && indexStatsHistoricalData.length > 0) {
            for (var indexStat of indexStatsHistoricalData) {
                if (indexStat.runId == runId) {
                    const output: IIndexStatsOutput = JSON.parse(indexStat.metricOutput)
                    const result: IIndexStatsResult = output.result
                    const queries: IIndexStatsResponse[] = result.queryList
                    setIndexStats(queries)
                    break
                }
            }
        }
    }

    return (
        <div style={{ marginLeft: '15px', padding: '10px' }}>
            <MetricHeader title="Index Stats" />
            <h4 style={{ padding: '5px' }} >Enter Inputs</h4>
            <HistoricalDataFilters 
            handleSelectChange={e => handleRunIdChange(e) } 
            handleFromDateChange={(e) => handleFromDateChange(e)}
            handleToDateChange={(e) => handleToDateChange(e)}
            fetchNext={() => loadMoreTimestamps()}
            hasMoreResults={!receivedAllHistoricalData}
            selectSelectedRunId={indexStatsHistoricalDataSnapshotRunId}
            isSelectLoading={loadingHistoricalData}
            selectMenuItems={indexStatsHistoricalData}
            threshold={0.8} />
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                {indexStats &&
                        <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                            <div style={{ height: 'auto', width: '100%' }}>
                                {!errorMessage && indexStats.length ? (
                                    <Table>
                                        <TableBody>
                                            {Object.entries(indexStats[0]).map((x, y) => {

                                                return <TableRow key={`${x}_${y}`}>
                                                    <TableCell>{x[0]}</TableCell>
                                                    <TableCell>{x[1]}</TableCell>
                                                </TableRow>
                                            }
                                            )
                                            }
                                        </TableBody>
                                    </Table>
                                ) :
                                    (<Typography>No Historical Data found</Typography>)
                                }
                            </div>
                        </Box>
                    }
            </div>
            {/* {indexStats.length === 0 && <NoDataExists text="No Historical Data found"/>} */}
            </div>
    )

}