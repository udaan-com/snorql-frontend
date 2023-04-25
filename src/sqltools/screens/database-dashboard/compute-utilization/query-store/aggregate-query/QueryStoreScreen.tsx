import React, { FunctionComponent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Paper, Typography, Tooltip, IconButton, Button, FormControl, TextField } from "@material-ui/core"
import { SQLService } from "../../../../../services/SQLService";
import { ICustomError, IMetricMetadata, IQueryStoreResponse, IQueryStore } from "../../../../../models";
import { CopyToClipboard } from "../../../../../components/CopyToClipboard";
import CodeIcon from '@material-ui/icons/Code';
import { ShowQueryScreen } from "../../../ShowQueryScreen";
import { showQueryEvent } from '../../../../../tracking/TrackEventMethods';
import {useAdminEmail} from "../../../../../../hooks";
import { MenuText, MenuTitle } from "../../../DatabaseDashboardScreen";
import MUIDataTable, {MUIDataTableOptions} from "mui-datatables";
import { getColumns } from "./QueryStoreColumn";
import ProgressView from '../../../../../../common/components/ProgressView';
import { Alert, AlertTitle, Autocomplete } from '@material-ui/lab';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import { useFirstRender } from './useFirstRenderHook';

interface QueryStoreScreenProps {
    databaseName: string;
    startTime: string;
    endTime: string;
}
const formatTwoDigitNumber = (num: number): string => num < 10 ? `0${num}` : num.toString();

export const getFormattedDateISO = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const meridian = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${date.toDateString()} ${formatTwoDigitNumber(hours)}:${formatTwoDigitNumber(date.getMinutes())}:${formatTwoDigitNumber(date.getSeconds())} ${meridian}`;
}

export const getFormattedDateUTC = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(date.getHours() - 5);
    date.setMinutes(date.getMinutes() - 30);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

interface ISortKeyToNumberMapping {
    key: string,
    number: string
}

const sortKeyToNumberMapping: ISortKeyToNumberMapping[] = [
    {
        key: "Query ID",
        number: "1"
    },
    {
        key: "Object ID",
        number: "2"
    },
    {
        key: "Object Name",
        number: "3"
    },
    {
        key: "Count Executions",
        number: "4"
    },
    {
        key: "No of plans",
        number: "5"
    },
    {
        key: "Total Duration",
        number: "6"
    },
    {
        key: "Total CPU Time",
        number: "7"
    },
    {
        key: "Total Logical IO Reads",
        number: "9"
    },
    {
        key: "Total Logical IO Writes",
        number: "9"
    },
    {
        key: "Total Physical IO Reads",
        number: "10"
    },
    {
        key: "Total CLR Time",
        number: "11"
    },
    {
        key: "Total DOP",
        number: "12"
    },
    {
        key: "Total Query Max Used Memory",
        number: "13"
    },
    {
        key: "Total Row count",
        number: "14"
    },
    {
        key: "Total Log Bytes Used",
        number: "15"
    },
    {
        key: "Total Tempdb Space Used",
        number: "16"
    },
    {
        key: "Avg Duration",
        number: "17"
    },
    {
        key: "Avg CPU Time",
        number: "18"
    },
    {
        key: "Avg Logical IO Reads",
        number: "19"
    },
    {
        key: "Avg Logical IO Writes",
        number: "20"
    },
    {
        key: "Avg Physical IO Reads",
        number: "21"
    },
    {
        key: "Avg CLR Time",
        number: "22"
    },
    {
        key: "Avg DOP",
        number: "23"
    },
    {
        key: "Avg Query Max Used Memory",
        number: "24"
    },
    {
        key: "Avg Row count",
        number: "25"
    },
    {
        key: "Avg Log Bytes Used",
        number: "26"
    },
    {
        key: "Avg Tempdb Space Used",
        number: "27"
    },
    {
        key: "Avg Query Wait Time",
        number: "28"
    },
]

export const QueryStoreScreen: FunctionComponent<QueryStoreScreenProps> = (props) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [queryStoreData, setQueryStoreData] = useState<IQueryStore[] | null>(null);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [queryStoreDataLoading, setQueryStoreDataLoading] = React.useState<boolean>(false);
    const [sortKey, setSortKey] = React.useState<ISortKeyToNumberMapping>(sortKeyToNumberMapping[16]);
    const email = useAdminEmail();
    const isFirstRender = useFirstRender()

    const options: MUIDataTableOptions = {
        filterType: "dropdown",
        selectableRows: 'none',
        print: false,
        download: true,
        setTableProps: () => {
            return {size: 'small'}
        },
    };

    const fetchDataWithDefaultSort = () => {
        if(sortKey == undefined) {
            setSortKey(sortKeyToNumberMapping[16])
        } else {
            handleOnApiResponse()
        }
    }
    useEffect(() => {
        const sortOrder="DESC"
        if(!isFirstRender) {
            handleOnApiResponse(sortOrder)
        }
    }, [sortKey]);

    const handleOnApiResponse = (sortOrder: string="DESC") => {
        setQueryStoreDataLoading(true)
        SQLService.getQueryStore(props.databaseName, getFormattedDateUTC(props.startTime), getFormattedDateUTC(props.endTime), sortKey.number, sortOrder)
        .then((r: IQueryStoreResponse | ICustomError) => {
            if ("code" in r && "message" in r && "details" in r) {
                setErrorMessage(`${r.message}: ${r.details}`);
                setQueryStoreDataLoading(false);
            } else {
                const result = r.metricOutput.result.queryList;
                setMetadata(r.metadata);
                setQueryStoreData(result);
                setQueryStoreDataLoading(false);
                setSortKey(sortKey)
            }
        });
    }

    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.QUERY_STORE}`}
    const handleShowQuery = () => {
        setShowQuery(!showQuery)
        metadata && showQueryEvent({
            ...basicPropsForMixPanel,
            query: metadata.underlyingQueries[0]
        })
    }
    const handleSortKeyChange = (selectedSortOption: ISortKeyToNumberMapping | null) => {
        if(selectedSortOption !== null) {
            setSortKey(selectedSortOption)
        }
    }
    return (
        <Paper style={{maxWidth: 1400, width: "-webkit-fill-available"}}>
            <Alert severity="info" style={{marginTop:'5px'}}>
                <AlertTitle>Instructions for Debugging peak in resource metrics</AlertTitle>
                <ul>
                    <li>Please select the desired date range(preferably a smaller interval less than 1 hour) & click on <strong>GET QUERIES</strong></li>
                    <li>This would fetch all queries executed in that range from <strong>QUERY STORE</strong>(only available for <strong>PRIMARY</strong> not <strong>REPLICA</strong>).</li>
                    {/* <li><strong>This query is to be executed only in SSMS.</strong></li> */}
                </ul>
                Selected time range: <strong>{`${getFormattedDateISO(props.startTime)}`}</strong> to <strong>{`${getFormattedDateISO(props.endTime)}`}</strong>
                <Button
                    variant="contained"
                    color="primary"
                    style={{margin:'5px'}}
                    endIcon={<ArrowForwardIosIcon/>}
                    onClick={fetchDataWithDefaultSort}
                    disabled={queryStoreDataLoading}
                >
                    GET QUERIES
                </Button>
            </Alert>
            {errorMessage &&
                <div style={{ marginLeft: '5px', padding: '10px', color: 'red', fontFamily: 'monospace' }}>
                    <details open>
                        <summary>Error</summary>
                        <p>{errorMessage}</p>
                    </details>
                </div>
            }
            <div style={{ marginLeft: "5px", marginTop: "5px" }}>
                {queryStoreDataLoading && <pre style={{backgroundColor:'#d8c3c3',padding: '10px'}}>
                    <code>
                        NOTE:Fetching queries executed during the time range <strong>{`${getFormattedDateISO(props.startTime)}`}</strong> to <strong>{`${getFormattedDateISO(props.endTime)}`}</strong> sorted by <strong>{sortKey.key.toUpperCase()}</strong> in <strong>DESC</strong> order.
                        <br/>This may take some time.Sit back & relax...
                    </code>
                </pre>}
                {!queryStoreDataLoading && queryStoreData && queryStoreData.length>0 && <pre style={{backgroundColor:'#d8c3c3',padding: '10px'}}>
                    <code>
                        NOTE:Showing queries executed during the time range <strong>{`${getFormattedDateISO(props.startTime)}`}</strong> to <strong>{`${getFormattedDateISO(props.endTime)}`}</strong> sorted by <strong>{sortKey.key.toUpperCase()}</strong> in <strong>DESC</strong> order.
                    </code>
                </pre>}
                {!queryStoreDataLoading && <>
                    <FormControl style={{margin:'5px', minWidth: 260}}>
                        <Autocomplete
                            options={sortKeyToNumberMapping}
                            value={sortKey}
                            disableClearable
                            getOptionLabel={(option: ISortKeyToNumberMapping) => option.key}
                            renderInput={(params) => (
                                <TextField {...params} label="Sort By" margin="normal" />
                            )}
                            onChange={(event: any, newValue: ISortKeyToNumberMapping | null) => handleSortKeyChange(newValue) }
                        />
                    </FormControl>
                </>}
                <div style={{ float: 'right', padding: '10px' }}>
                    {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                    {metadata && metadata.underlyingQueries && <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                        <IconButton aria-label="delete" onClick={handleShowQuery}>
                            <CodeIcon />
                        </IconButton>
                    </Tooltip>}
                </div>
           </div>
            {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}
            
            {!showQuery && !errorMessage && !queryStoreDataLoading && queryStoreData && queryStoreData.length>0 &&
                <div>
                    <MUIDataTable
                        title={""}
                        data={queryStoreData}
                        columns={getColumns(props.startTime, props.endTime, props.databaseName)}
                        options={options}
                    />
                </div>
            }
            {!showQuery && !errorMessage && !queryStoreDataLoading && queryStoreData && queryStoreData.length==0 && <Typography>No records found</Typography>}
            {!showQuery && !errorMessage && queryStoreDataLoading && <ProgressView/>} 
        </Paper>

    )
};
