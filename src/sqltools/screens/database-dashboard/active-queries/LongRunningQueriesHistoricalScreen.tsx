import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { ActiveQuery, HistoricalDataResult, IActiveQueryMetricOutput, IActiveQueryMetricResult, ICustomError, IMetricHistoricalDataFilter, IMetricHistoricalDataSchema, NextPageToken } from "../../../models";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { NoDataExists } from "../../../components/NoDataExists";
import { SQLService } from "../../../services/SQLService";
import { getColumns } from "./allQueryColumns";

interface LongRunningQueriesProps {
    databaseName: string;
    baseurl: string;
}

export const LongRunningQueriesHistoricalScreen: FunctionComponent<LongRunningQueriesProps> = (props) => {

    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [longRunningHistoricalData, setLongRunningHistoricalData] = useState<IMetricHistoricalDataSchema[]>([]);
    const [longRunningHistoricalQueries, setLongRunningHistoricalQueries] = useState<ActiveQuery[]>([]);
    const [cols, setCols] = useState<any>([]);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);
    const [longRunningHistoricalDataSnapshotRunId, setLongRunningHistoricalDataSnapshotRunId] = useState('');
    const [receivedAllHistoricalData, setReceivedAllHistoricalData] = useState<boolean>(false);
    const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
    const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
    const [pageSize, setPageSize] = useState(35);

    useEffect(() => {
        if (fromDate && toDate) {
            setDateChangedFlag(true);
            setLongRunningHistoricalDataSnapshotRunId('');
            setLongRunningHistoricalData([]);
            setReceivedAllHistoricalData(false);
            setNextPageToken({});
        }
    }, [fromDate, toDate])

    useEffect(() => {
        if (dateChangedFlag) {
            setDateChangedFlag(false);
            fetchHistoricalLongRunningQueryData();
        }
    }, [dateChangedFlag])

    const handleOnHistoricalApiResponse = (r: HistoricalDataResult | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            setLongRunningHistoricalData(longRunningHistoricalData.concat(r.result))
            if (!r.metadata || r.result.length < pageSize) { 
                setReceivedAllHistoricalData(true);
                setNextPageToken(r.metadata);
            } else {
                setNextPageToken(r.metadata)
            }
            const columns = getColumns(props.databaseName, props.baseurl);
            setCols(columns);
            setErrorMessage('')
        }
        setLoadingHistoricalData(false)
    }

    const fetchHistoricalLongRunningQueryData = () => {
        setLoadingHistoricalData(true)
        const metricId = 'performance_longRunningQueries'
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
            fetchHistoricalLongRunningQueryData();
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
        setLongRunningHistoricalDataSnapshotRunId(runId)
        if (runId && longRunningHistoricalData && longRunningHistoricalData.length > 0) {
            for (var longRunningQuery of longRunningHistoricalData) {
                if (longRunningQuery.runId == runId) {
                    const output: IActiveQueryMetricOutput = JSON.parse(longRunningQuery.metricOutput)
                    const result: IActiveQueryMetricResult = output.result
                    const queries: ActiveQuery[] = result.queryList
                    setLongRunningHistoricalQueries(queries)
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
            selectSelectedRunId={longRunningHistoricalDataSnapshotRunId}
            isSelectLoading={loadingHistoricalData}
            selectMenuItems={longRunningHistoricalData}
            threshold={0.8} />
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                {longRunningHistoricalQueries && longRunningHistoricalQueries.length > 0 &&
                    <LongRunningQueriesTable rows={longRunningHistoricalQueries} columns={cols} />
                }
            </div>
            {longRunningHistoricalQueries.length === 0 && <NoDataExists text="No Long Running Queries found"/>}
            </div>
    )

}

interface LongRunningQueriesTableProps {
    rows: ActiveQuery[];
    columns: [];
}

const options: MUIDataTableOptions = {
    filter: false,
    selectableRows: 'none',
    print: false,
    download: true,
    setTableProps: () => {
        return {size: 'small'}
    }
  };

export const LongRunningQueriesTable: FunctionComponent<LongRunningQueriesTableProps> = (props) => {
    const { rows, columns } = props
    return (
        <MUIDataTable 
            title="" 
            data={rows} 
            columns={columns} 
            options={options}
        />
    );
};