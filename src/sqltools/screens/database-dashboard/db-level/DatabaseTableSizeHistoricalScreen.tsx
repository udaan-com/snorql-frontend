import { Typography } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { DatabaseTableSizeResponse, HistoricalDataResult, ICustomError, IDatabaseTableSizeOutput, IDatabaseTableSizeResult, IIndexStatsOutput, IIndexStatsResponse, 
    IMetricHistoricalDataFilter, IMetricHistoricalDataSchema, NextPageToken } from "../../../models";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { SQLService } from "../../../services/SQLService";
import { tableOptions } from "./DatabaseLevelScreen";
import { getTableSizeColumns } from "./DatabaseTableSizeScreenModels";

interface DBTableSizeProps {
    databaseName: string;
}

export const DatabaseTableSizeHistoricalScreen: FunctionComponent<DBTableSizeProps> = (props) => {

    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dbTableSizeHistoricalData, setDBTableSizeHistoricalData] = useState<IMetricHistoricalDataSchema[]>([]);
    const [dbTableSize, setDBTableSize] = useState<DatabaseTableSizeResponse[]>([]);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);
    const [dbTableSizeHistoricalRunId, setDBTableSizeHistoricalRunId] = useState('');
    const [receivedAllHistoricalData, setReceivedAllHistoricalData] = useState<boolean>(false);
    const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
    const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
    const [pageSize, setPageSize] = useState(40);

    useEffect(() => {
        if (fromDate && toDate) {
            setDateChangedFlag(true);
            setDBTableSizeHistoricalRunId('');
            setDBTableSizeHistoricalData([]);
            setReceivedAllHistoricalData(false);
            setNextPageToken({});
        }
    }, [fromDate, toDate])

    useEffect(() => {
        if (dateChangedFlag) {
            setDateChangedFlag(false);
            fetchHistoricalDBTableSizeData();
        }
    }, [dateChangedFlag])

    const handleOnHistoricalApiResponse = (r: HistoricalDataResult | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            setDBTableSizeHistoricalData(dbTableSizeHistoricalData.concat(r.result))
            if (!r.metadata || r.result.length < pageSize) { 
                setReceivedAllHistoricalData(true);
                setNextPageToken(r.metadata);
            } else {
                setNextPageToken(r.metadata)
            }
        }
        setLoadingHistoricalData(false)
    }

    const fetchHistoricalDBTableSizeData = () => {
        setLoadingHistoricalData(true)
        const metricId = 'storage_dbTables'
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
            fetchHistoricalDBTableSizeData();
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

    const formatToAddId = (response: any[]): DatabaseTableSizeResponse[] => {
        response.map((eachItem, index) => {
            eachItem['id'] = index + 1
        })
        return response;
    }

    const handleRunIdChange = (runId: string) => {
        setDBTableSizeHistoricalRunId(runId)
        if (runId && dbTableSizeHistoricalData && dbTableSizeHistoricalData.length > 0) {
            for (var dbTable of dbTableSizeHistoricalData) {
                if (dbTable.runId == runId) {
                    const output: IDatabaseTableSizeOutput = JSON.parse(dbTable.metricOutput)
                    const result: IDatabaseTableSizeResult = output.result
                    const queries: DatabaseTableSizeResponse[] = result.queryList
                    setDBTableSize(formatToAddId(queries))
                    break
                }
            }
        }
    }

    return (
        <div style={{ marginLeft: '15px', padding: '10px' }}>
            <HistoricalDataFilters 
            handleSelectChange={e => handleRunIdChange(e) } 
            handleFromDateChange={(e) => handleFromDateChange(e)}
            handleToDateChange={(e) => handleToDateChange(e)}
            fetchNext={() => loadMoreTimestamps()}
            hasMoreResults={!receivedAllHistoricalData}
            selectSelectedRunId={dbTableSizeHistoricalRunId}
            isSelectLoading={loadingHistoricalData}
            selectMenuItems={dbTableSizeHistoricalData}
            threshold={0.8} />
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                {dbTableSize &&
                    <>
                    {!errorMessage && dbTableSize.length ? (
                        <MUIDataTable
                        title={""}
                        data={dbTableSize}
                        columns={getTableSizeColumns()}
                        options={tableOptions}
                        />
                    ) :
                        (<Typography>No records found</Typography>)
                    }
                    </>
                }
            </div>
            {/* {indexStats.length === 0 && <NoDataExists text="No Historical Data found"/>} */}
            </div>
    )

}