import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { DatabaseTopIndexResponse, HistoricalDataResult, ICustomError, IDatabaseTopIndexOutput, IDatabaseTopIndexResult, IMetricHistoricalDataFilter, IMetricHistoricalDataSchema, NextPageToken } from "../../../models";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { NoDataExists } from "../../../components/NoDataExists";
import { SQLService } from "../../../services/SQLService";
import { tableOptions } from "./DatabaseLevelScreen";
import { getTopIndexColumns } from "./DatabaseTopIndexModels";

interface DatabaseTopIndexProps {
    databaseName: string;
}

export const DatabaseHistoricalTopIndex: FunctionComponent<DatabaseTopIndexProps> = (props) => {

    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dbTopIndexHistoricalData, setDBTopIndexHistoricalData] = useState<IMetricHistoricalDataSchema[]>([]);
    const [dbTopIndexHistoricalQueries, setDBTopIndexHistoricalQueries] = useState<DatabaseTopIndexResponse[]>([]);
    const [cols, setCols] = useState<any>([]);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);
    const [dbTopIndexHistoricalDataSnapshotRunId, setDBTopIndexHistoricalDataSnapshotRunId] = useState('');
    const [receivedAllHistoricalData, setReceivedAllHistoricalData] = useState<boolean>(false);
    const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
    const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
    const [pageSize, setPageSize] = useState(40);

    useEffect(() => {
        if (fromDate && toDate) {
            setDateChangedFlag(true);
            setDBTopIndexHistoricalDataSnapshotRunId('');
            setDBTopIndexHistoricalData([]);
            setReceivedAllHistoricalData(false);
            setNextPageToken({});
        }
    }, [fromDate, toDate])

    useEffect(() => {
        if (dateChangedFlag) {
            setDateChangedFlag(false);
            fetchHistoricalBlockedQueryData();
        }
    }, [dateChangedFlag])

    const handleOnHistoricalApiResponse = (r: HistoricalDataResult | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            setDBTopIndexHistoricalData(dbTopIndexHistoricalData.concat(r.result))
            if (!r.metadata || r.result.length < pageSize) { 
                setReceivedAllHistoricalData(true);
                setNextPageToken(r.metadata);
            } else {
                setNextPageToken(r.metadata)
            }
            const columns = getTopIndexColumns();
            setCols(columns);
        }
        setLoadingHistoricalData(false)
    }

    const fetchHistoricalBlockedQueryData = () => {
        setLoadingHistoricalData(true)
        const metricId = 'storage_dbIndex'
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
            fetchHistoricalBlockedQueryData();
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
        setDBTopIndexHistoricalDataSnapshotRunId(runId)
        if (runId && dbTopIndexHistoricalData && dbTopIndexHistoricalData.length > 0) {
            for (var dbTopIndexQuery of dbTopIndexHistoricalData) {
                if (dbTopIndexQuery.runId == runId) {
                    const output: IDatabaseTopIndexOutput = JSON.parse(dbTopIndexQuery.metricOutput)
                    const result: IDatabaseTopIndexResult = output.result
                    const queries: DatabaseTopIndexResponse[] = result.queryList
                    setDBTopIndexHistoricalQueries(queries)
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
            selectSelectedRunId={dbTopIndexHistoricalDataSnapshotRunId}
            isSelectLoading={loadingHistoricalData}
            selectMenuItems={dbTopIndexHistoricalData}
            threshold={0.8} />
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                {!errorMessage && dbTopIndexHistoricalQueries && dbTopIndexHistoricalQueries.length > 0 &&
                    <MUIDataTable
                    title={""}
                    data={dbTopIndexHistoricalQueries}
                    columns={getTopIndexColumns()}
                    options={tableOptions}
                />
                }
            </div>
            {dbTopIndexHistoricalQueries.length === 0 && <NoDataExists text="No Historical Data found"/>}
            </div>
    )

}