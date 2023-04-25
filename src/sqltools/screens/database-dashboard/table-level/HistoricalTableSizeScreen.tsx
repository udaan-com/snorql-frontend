import { Box, Table, TableBody, TableCell, TableRow, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { HistoricalDataResult, ICustomError, IMetricHistoricalDataFilter, IMetricHistoricalDataSchema, ITableSizeOutput, ITableSizeResult, NextPageToken, TableSizeResponse } from "../../../models";
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { NoDataExists } from "../../../components/NoDataExists";
import { SQLService } from "../../../services/SQLService";

interface LongRunningQueriesProps {
    databaseName: string;
}

export const HistoricalTableSizeScreen: FunctionComponent<LongRunningQueriesProps> = (props) => {

    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [tableSize, setTableSize] = useState<TableSizeResponse[]>([]);
    const [tableSizeHistoricalData, setTableSizeHistoricalData] = useState<IMetricHistoricalDataSchema[]>([]);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);
    const [tableSizeRunId, setTableSizeRunId] = useState('');
    const [receivedAllHistoricalData, setReceivedAllHistoricalData] = useState<boolean>(false);
    const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
    const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
    const [pageSize, setPageSize] = useState(40);

    useEffect(() => {
        if (fromDate && toDate) {
            setDateChangedFlag(true);
            setTableSizeRunId('');
            setTableSizeHistoricalData([]);
            setReceivedAllHistoricalData(false);
            setNextPageToken({});
        }
    }, [fromDate, toDate])

    useEffect(() => {
        if (dateChangedFlag) {
            setDateChangedFlag(false);
            fetchHistoricalTableSizeData();
        }
    }, [dateChangedFlag])

    const handleOnHistoricalApiResponse = (r: HistoricalDataResult | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            setTableSizeHistoricalData(r.result)
            if (!r.metadata || r.result.length < pageSize) { 
                setReceivedAllHistoricalData(true);
                setNextPageToken(r.metadata);
            } else {
                setNextPageToken(r.metadata)
            }
        }
        setLoadingHistoricalData(false)
    }

    const fetchHistoricalTableSizeData = () => {
        setLoadingHistoricalData(true)
        const metricId = 'storage_table'
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
            fetchHistoricalTableSizeData();
        }
    }

    const handleToDateChange = (newToDate: string) => {
        if (newToDate && newToDate !== toDate) {
            setToDate(newToDate)
        }
    }

    const handleFromDateChange = (newFromDate: string) => {
        if (newFromDate && newFromDate !== fromDate) {
            setFromDate(newFromDate)
        }
    }

    const handleRunIdChange = (runId: string) => {
        setTableSizeRunId(runId)
        if (runId && tableSizeHistoricalData && tableSizeHistoricalData.length > 0) {
            for (var tableSizeData of tableSizeHistoricalData) {
                if (tableSizeData.runId == runId) {
                    const output: ITableSizeOutput = JSON.parse(tableSizeData.metricOutput)
                    const result: ITableSizeResult = output.result
                    const queries: TableSizeResponse[] = result.queryList
                    setTableSize(queries)
                    break
                }
            }
        }
    }

    return (
        <div>
            <HistoricalDataFilters 
            handleSelectChange={e => handleRunIdChange(e) } 
            handleFromDateChange={(e) => handleFromDateChange(e)}
            handleToDateChange={(e) => handleToDateChange(e)}
            fetchNext={() => loadMoreTimestamps()}
            hasMoreResults={!receivedAllHistoricalData}
            selectSelectedRunId={tableSizeRunId}
            isSelectLoading={loadingHistoricalData}
            selectMenuItems={tableSizeHistoricalData}
            threshold={0.8} />
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                {tableSizeRunId && tableSize && tableSize.length > 0 &&
                    <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                        <div style={{ height: 650, width: '100%' }}>
                            {!errorMessage && tableSize.length ? (
                                <Table>
                                    <TableBody>
                                        {Object.entries(tableSize[0]).map((x, y) => {

                                            return <TableRow key={y}> 
                                                <TableCell>{x[0].split(/(?=[A-Z])/).join(' ').toUpperCase()}</TableCell>
                                                <TableCell>{x[1]}</TableCell>
                                            </TableRow>
                                        }
                                        )
                                        }
                                    </TableBody>
                                </Table>
                            ) :
                                (<Typography>No records found</Typography>)
                            }
                        </div>
                    </Box>
                }
            </div>
            {tableSize.length === 0 && <NoDataExists text="No Historical Data found"/>}
            </div>
    )

}