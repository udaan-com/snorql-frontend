import React, { FunctionComponent, useEffect, useState } from "react";
import {
    Typography,
    Box,
    FormControl,
    TextField,
    Button,
    CircularProgress
} from "@mui/material"
import { SQLService } from "../../../services/SQLService";
import { DatabaseGrowthResponse, DailyDatabaseGrowth, IMetricHistoricalDataFilter, NextPageToken, HistoricalDataResult, IDatabseStorageSizeOutput, IDatabseStorageSizeResult, DatabseStorageSizeResponse } from "../../../models";
import Chart from "react-google-charts";
import {Helpers} from "../../../helpers";

interface HistoricalDatabaseGrowthScreenProps {
    databaseName: string;
}

export const HistoricalDatabaseGrowthScreen: FunctionComponent<HistoricalDatabaseGrowthScreenProps> = (props) => {
    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dbGrowth, setDbGrowth] = useState<DatabaseGrowthResponse[]>([]);
    const [dailyGrowth, setDailyGrowth] = useState<DailyDatabaseGrowth[][]>([]);
    const [latestFetch, setLatestFetch] = useState<HistoricalDataResult>();
    const [fetchComplete, setFetchComplete] = useState<boolean>(false);
    const [allResultRows, setAllResultRows] = useState<DatabaseGrowthResponse[]>([]);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);

    useEffect(() => {
        if (latestFetch && latestFetch.result) {
            setAllResultRows(allResultRows.concat(toDatabaseGrowthResponse(latestFetch)))
            if (latestFetch.metadata && latestFetch.metadata.nextPartitionKey) {
                fetchAllHistoricalData(latestFetch.metadata)
            } else {
                setFetchComplete(true)
            }
        } else {
            setLoadingHistoricalData(false)
        }
    }, [latestFetch])

    useEffect(() => {
        if (fetchComplete) {
            handleOnApiResponse(allResultRows)
        }
    }, [fetchComplete])

    const handleOnApiResponse = (r: DatabaseGrowthResponse[]) => {
        const results_ = r;
        let results = results_.map(x=>{return {...x,storageInMegabytes : x["storageInMegabytes"]+" MB"}});
        // console.log("Total Results Count: ", results.length)

        // convert to GB
        let result = Helpers.changeSize(results);
        setDbGrowth(formatToAddId(result))

        const groups = result.reduce((groups:any, value:DatabaseGrowthResponse) => {
            const date = value.startTime;
            if (!groups[date]) {
            groups[date] = [];
            }
            groups[date].push(value);
            return groups;
        }, {});
        
        const diff = (qq:any) => qq.slice(1).map((v:number, i:number) => { return ( qq[i] - v ) });
        let perDayStorageValue = Object.keys(groups).map(x=> { return parseFloat(groups[x][0]['storageInMegabytes']).toFixed(1)});
        let difference:Array<number> = diff(perDayStorageValue);
        difference.push(0)
        const groupArrays =  Object.keys(groups).map((date,i):any[] => {
            return [
            new Date(date),
            parseFloat(perDayStorageValue[i])
        ];
        });
        // console.log("Final Count of dates: ", groupArrays.length)
        setDailyGrowth(groupArrays)
        setLoadingHistoricalData(false)
    }

    const fetchAllHistoricalData = (nextPageToken: NextPageToken | null) => {
        setLoadingHistoricalData(true)
        const metricId = "storage_db"
        const payload: IMetricHistoricalDataFilter = {
            "fromDate": fromDate,
            "toDate": toDate,
            "pageSize": 1000
        }
        if (nextPageToken && nextPageToken.nextPartitionKey) {
            payload.nextPartitionKey = nextPageToken.nextPartitionKey,
            payload.nextRowKey = nextPageToken.nextRowKey
        }
        SQLService.getMetricHistoricalData(metricId, props.databaseName, payload)
        .then((r) => {
            // console.log("Raw Response Received: ", r)
            if ("code" in r && "message" in r && "detail" in r) {
                setErrorMessage(`${r.message}: ${r.details}`);
                setLoadingHistoricalData(false)
            } else if ('error' in r) {
                setErrorMessage(r.error)
                setLoadingHistoricalData(false)
            } else {
                setLatestFetch(r)
            }
        })
    }

    const toDatabaseGrowthResponse = (res: HistoricalDataResult | null | undefined):DatabaseGrowthResponse[]  => {
        if (!res) {
            return []
        }
        let resultArr: DatabaseGrowthResponse[] = []
        if (res.result.length > 0) {
            for (var record of res.result) {
                const output: IDatabseStorageSizeOutput = JSON.parse(record.metricOutput)
                const result: IDatabseStorageSizeResult = output.result
                const queryList: DatabseStorageSizeResponse[] = result.queryList
                const storageRecord: DatabseStorageSizeResponse = queryList[0]
                const element: DatabaseGrowthResponse = {
                    startTime: record.timestamp.toString().slice(0,10),
                    endTime: "",
                    storageInMegabytes: kbToMb(storageRecord.reserved)
                }
                resultArr.push(element)
            }
        }
        return resultArr
    }

    const kbToMb = (sizeString: string): string => {
        return (parseInt(sizeString.split(" ")[0])/1024).toString()
    }

    const formatToAddId = (response: any[]): DatabaseGrowthResponse[] => {
        response.map((eachItem, index) => {
            eachItem['id'] = index + 1
        })
        return response;
    }

    const handleFromDateOnChange = (newFromDate: string) => {
        if (newFromDate && newFromDate !== fromDate) {
            setFromDate(newFromDate)
        }
    }

    const handleToDateOnChange = (newToDate: string) => {
        if (newToDate && newToDate !== toDate) {
            setToDate(newToDate)
        }
    }

    const handleDebugMetricFetch = () => {
        if (fromDate && toDate) {
            setDailyGrowth([])
            setAllResultRows([])
            setErrorMessage('')
            setFetchComplete(false)
            fetchAllHistoricalData(null)
        }
    }

    return (
        <div>
        <div>
            <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                <TextField
                type="datetime-local"
                label="From Date Time"
                variant="outlined"
                value={fromDate}
                required
                onChange={(event: any) => handleFromDateOnChange(event.target.value)}
                InputProps={{ inputProps: { max: toDate } }}
                />
            </FormControl>
            <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                <TextField
                type="datetime-local"
                label="To Date Time"
                variant="outlined"
                value={toDate}
                required
                onChange={(event: any) => handleToDateOnChange(event.target.value)}
                InputProps={{ inputProps: { min: fromDate ,max: dateTimeNow } }}
                />
            </FormControl>
            <Button 
                disabled={loadingHistoricalData}
                variant="contained"
                color="primary" 
                onClick={handleDebugMetricFetch} 
                style={{ marginLeft: 8, height: '56px', width: 'auto' }}>
                    {loadingHistoricalData ? <CircularProgress color="secondary" /> : 'Search'}
            </Button>
        </div>
        {errorMessage &&
            <div style={{ marginLeft: '5px', padding: '10px', color: 'red', fontFamily: 'monospace' }}>
                <details open>
                    <summary>Error</summary>
                    <p>{errorMessage}</p>
                </details>
            </div>
        }
        <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
            <div >
                {!loadingHistoricalData && !errorMessage && dbGrowth.length ? (
                    <Chart
                    width={'600px'}
                    height={'400px'}
                    chartType="Line"
                    loader={<div>Loading Chart</div>}
                    data={[
                        [
                            { type: 'date', label: 'Day' },
                            'Db growth (GB)',
                            
                        ],
                        ...dailyGrowth
                        ]}
                    options={{
                        chart: {
                            title:
                                'Daily Average Growth',
                            },
                        hAxis: {
                        title: 'Time',
                        },
                        vAxis: {
                        title: 'Growth in GB',
                        },
                    }}
                    rootProps={{ 'data-testid': '1' }}
                    />
                ) :
                    (<Typography>No records found</Typography>)
                }
            </div>
        </Box>
        </div>
    )
}