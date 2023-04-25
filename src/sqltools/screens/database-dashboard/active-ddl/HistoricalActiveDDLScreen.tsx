import { Box } from "@material-ui/core";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import React, { useEffect } from "react";
import { FunctionComponent, useState } from "react";
import { HistoricalDataResult, IActiveDDLOutput, IActiveDDLResponse, IActiveDDLResult, ICustomError, IMetricHistoricalDataFilter, IMetricHistoricalDataSchema, NextPageToken } from "../../../models";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { NoDataExists } from "../../../components/NoDataExists";
import { SQLService } from "../../../services/SQLService";
import { getColumns } from "./ActiveDDLColumn";

interface ActiveDDLProps {
    databaseName: string;
}

export const HistoricalActiveDDLScreen: FunctionComponent<ActiveDDLProps> = (props) => {
    const today = new Date();
    const temp_today = new Date();
    const weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeDDLHistoricalData, setActiveDDLHistoricalData] = useState<IMetricHistoricalDataSchema[]>([]);
    const [activeDDL, setActiveDDL] = useState<IActiveDDLResponse[]>([]);
    const [cols, setCols] = useState<any>([]);
    const [activeDDLRunId, setActiveDDLRunId] = useState('');
    const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
    const [receivedAllHistoricalData, setReceivedAllHistoricalData] = useState<boolean>(false)
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
    const [pageSize, setPageSize] = useState(40);


    const options: MUIDataTableOptions = {
        filterType: "multiselect",
        selectableRows: 'none',
        print: false,
        download: true
    };

    useEffect(() => {
        if (fromDate && toDate) {
            setDateChangedFlag(true);
            setActiveDDLRunId('');
            setActiveDDLHistoricalData([]);
            setReceivedAllHistoricalData(false);
            setNextPageToken({});
        }
    }, [fromDate, toDate])

    useEffect(() => {
        if (dateChangedFlag) {
            setDateChangedFlag(false);
            fetchHistoricalActiveDDLQueryData();
        }
    }, [dateChangedFlag])

    const handleOnHistoricalApiResponse = (r: HistoricalDataResult | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            setActiveDDLHistoricalData(activeDDLHistoricalData.concat(r.result))
            if (!r.metadata || r.result.length < pageSize) { 
                setReceivedAllHistoricalData(true);
                setNextPageToken(r.metadata);
            } else {
                setNextPageToken(r.metadata)
            }
            const columns = getColumns();
            setCols(columns);
        }
        setLoadingHistoricalData(false)
    }

    const fetchHistoricalActiveDDLQueryData = () => {
        setLoadingHistoricalData(true)
        const metricId = 'performance_activeDDL'
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
    const handleRunIdChange = (runId: string) => {
        setActiveDDLRunId(runId)
        if (runId && activeDDLHistoricalData && activeDDLHistoricalData.length > 0) {
            for (var activeDDLQueries of activeDDLHistoricalData) {
                if (activeDDLQueries.runId == runId) {
                    const output: IActiveDDLOutput = JSON.parse(activeDDLQueries.metricOutput)
                    const result: IActiveDDLResult = output.result
                    const queries: IActiveDDLResponse[] = result.queryList
                    setActiveDDL(queries)
                    break
                }
            }
        }
    }

    function loadMoreTimestamps() {
        if (!receivedAllHistoricalData && !loadingHistoricalData) {
            setLoadingHistoricalData(true)
            fetchHistoricalActiveDDLQueryData();
        }
    }

    const handleToDateChange = (newToDate: string) => {
        if (newToDate && newToDate !== toDate) {
            setToDate(newToDate);
        }
    }

    const handleFromDateChange = (newFromDate: string) => {
        if (newFromDate && newFromDate !== fromDate) {
            setFromDate(newFromDate)
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
            selectSelectedRunId={activeDDLRunId}
            isSelectLoading={loadingHistoricalData}
            selectMenuItems={activeDDLHistoricalData}
            threshold={0.8} />
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                {!errorMessage && activeDDLHistoricalData && activeDDLHistoricalData.length > 0 &&
                    <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                    <div style={{ height: 650, width: '100%' }}>
                        <MUIDataTable
                        title={""}
                            data={activeDDL}
                            columns={cols}
                            options={options}
                        />
                    </div>
                </Box>
                }
            </div>
            {activeDDLHistoricalData.length === 0 && <NoDataExists text="No Historical Data found"/>}
            </div>
    )
}