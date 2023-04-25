import React, { FunctionComponent, useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Tooltip, IconButton, FormControl, 
    Table, TableCell, TableBody, TableRow, TextField, FormGroup, Switch, FormControlLabel } from "@material-ui/core"
import { Fetcher } from "../../../../common/components/Fetcher";
import { ICustomError, IIndexStatsMetricResponse, IIndexStatsResponse, IMetricMetadata } from "../../../models";
import { SQLService } from "../../../services/SQLService";
import CodeIcon from '@material-ui/icons/Code';
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from '@material-ui/icons/Replay';
import { ITableIndex } from "./IndexStatsColumn";
import { outerLevelUseStyles } from "../../../components/StyleClass";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { MetricHeader } from "../../../components/MetricHeader";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import SettingsIcon from '@material-ui/icons/Settings';
import { IndexStatsJobRecordingDialog } from "./IndexStatsJobRecordingDialog";
import { IndexStatsHistoricalScreen } from "./IndexStatsHistoricalScreen";
import { reloadMetricEvent, showQueryEvent, toggleToHistoricViewEvent, configureDataRecordingViewEvent } from '../../../tracking/TrackEventMethods';
import { useAdminEmail } from '../../../../hooks';
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";


interface IndexStatsProps {
    databaseName: string;
}

export const IndexStatsScreen: FunctionComponent<IndexStatsProps> = (props) => {
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [tableName, setTableName] = useState<string>('');
    const [tableList, setTableList] = useState<string[]>([]);
    const [tableIndex, setTableIndex] = useState<[]>([]);
    const [indexName, setIndexName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [indexStats, setIndexStats] = useState<IIndexStatsResponse[]>([]);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [historicalScreenFlag, setHistoricalScreenFlag] = useState<boolean>(false);
    const [dataRecordingDialogOpen, setDataRecordingDialogOpen] = useState<boolean>(false);
    const email = useAdminEmail();

    const handleReload = () => {
        handleSearch()
        metadata && reloadMetricEvent(basicPropsForMixPanel)
    }

    useEffect(() => {
        SQLService.getTableList(props.databaseName)
            .then((r) => {
                setTableList(r.map((x: any) => x.tableName))
            }).catch((e) => {
                setErrorMessage(e)
            })
    }, [])


    const handleOnApiResponse = (r: IIndexStatsMetricResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        } else if ("error" in r) {
            alert(`[ERROR]: ${r['error']}`)
        } else {
            if ("metricOutput" in r) {
                const result = r.metricOutput.result.queryList;
                setMetadata(r.metadata);
                setIndexStats(formatToAddId(result));
                setErrorMessage('')
            }
            else {
                setErrorMessage("")
            }
        }
    }
    const handleSearch = () => {
        SQLService.getIndexStats(props.databaseName, tableName, indexName)
            .then(r => {
                handleOnApiResponse(r)
            })
    }
    const handleTableSelection = (selectedTable: string | null) => {
        if(selectedTable !== null) {
            setTableName(selectedTable);
            SQLService.getTableIndex(props.databaseName, selectedTable)
                .then((r) => {
                    setTableIndex(r)
                }).catch(
                    (e) => {
                        setErrorMessage(e.details);
                    }
                )
        }
    }
    const handleTableIndexSelection = (selectedTableIndex: ITableIndex | null) => {
        if(selectedTableIndex !== null) {
            setIndexName(selectedTableIndex.indexName);
        }
    }

    const formatToAddId = (response: any[]): IIndexStatsResponse[] => {
        response.map((eachItem, index) => {
            eachItem['id'] = index + 1
        })
        return response;
    }
    const handleIndexStats = (r: IIndexStatsMetricResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`)
        }
        else {
            if ("metricOutput" in r) {
                const result = r.metricOutput.result.queryList;
                setMetadata(r.metadata)
                setIndexStats(formatToAddId(result));
                setErrorMessage('')
            }
            else {
                setErrorMessage("")
            }
        }
    }

    const showJobConfigureDialog = () => {
        setDataRecordingDialogOpen(true);
    }
    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.STORAGE, metricText: MenuText.INDEX_STATS}

    const handleShowQuery = () => {
        setShowQuery(!showQuery)
        metadata && showQueryEvent({
            ...basicPropsForMixPanel,
            query: metadata.underlyingQueries[0]
        })
    }
    const handleClickHistoricalViewToggle = () => {
        setHistoricalScreenFlag(!historicalScreenFlag)
        toggleToHistoricViewEvent(basicPropsForMixPanel)
    }

    const handleJobConfigureDialogOpen = () => {
        showJobConfigureDialog()
        configureDataRecordingViewEvent(basicPropsForMixPanel)
    }

    const classes = outerLevelUseStyles();
    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={5}>
            <Paper>
                <div style={{ float: 'right' }}>
                    {/* {metadata && metadata.supportsHistorical && */}
                    <FormControl component="fieldset">
                        <FormGroup aria-label="historicalEnabled" row>
                            <FormControlLabel
                            onChange={handleClickHistoricalViewToggle}
                            control={<Switch color="primary" />}
                            label="View Historical Data"
                            labelPlacement="bottom"
                            />
                        </FormGroup>
                    </FormControl>
                    {/* {metadata && metadata.supportsHistorical && */}
                    <Tooltip title="Configure Data Recording">
                        <IconButton onClick={handleJobConfigureDialogOpen}>
                            <SettingsIcon fontSize="default" />
                        </IconButton>
                    </Tooltip>
                    {!historicalScreenFlag &&
                    <Tooltip title="Reload">
                        <IconButton onClick={handleReload}>
                            <ReplayIcon fontSize="default" />
                        </IconButton>
                    </Tooltip> }
                </div>

                {!showQuery && 
                    <IndexStatsJobRecordingDialog 
                    open={dataRecordingDialogOpen} 
                    handleClose={() => setDataRecordingDialogOpen(false)} 
                    databaseName={props.databaseName} 
                    metricId={"performance_indexStats"} 
                    metricName={"Index Stats Metric"}
                    tableList={tableList}
                    tableName={tableName}
                    indexName={indexName}
                    minimumRepeatInterval={metadata?.minimumRepeatInterval} />
                }

                {!historicalScreenFlag &&
                <>
                <div style={{ marginLeft: '15px', padding: '10px' }}>
                    <MetricHeader title="Index Stats" metadata={metadata} />
                    <h4 style={{ padding: '5px' }} >Enter Inputs</h4>

                    <FormControl style={{ minWidth: '320px', }}>
                        <Autocomplete
                            id="index-stats-table-name"
                            options={tableList}
                            getOptionLabel={(option: string) => option}
                            style={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="Table Name" variant="outlined" />}
                            onChange={(event: any, newValue:string | null) => handleTableSelection(newValue)}
                        />
                    </FormControl>

                    <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                        <Autocomplete
                            id="index-stats-index-name"
                            options={tableIndex}
                            getOptionLabel={(option: ITableIndex) => option.indexName}
                            style={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="Index Name" variant="outlined" />}
                            onChange={(event: any, newValue:ITableIndex | null) => handleTableIndexSelection(newValue)}
                        />
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginLeft: 8, height: '56px', width: 'auto' }}>
                        Search
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

                <Fetcher
                    fetchData={() => SQLService.getIndexStats(props.databaseName, tableName, indexName)}
                    onFetch={(r) => handleIndexStats(r)}
                >
                    <div style={{ float: 'right', padding: '10px' }}>
                    {showQuery && metadata && metadata.underlyingQueries && tableName.length > 0 && indexName.length > 0 && 
                        <CopyToClipboard text={metadata.underlyingQueries[0]} />
                    }
                        {tableName.length > 0 && indexName.length > 0 && 
                            <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                                <IconButton aria-label="delete" onClick={() => handleShowQuery}>
                                    <CodeIcon />
                                </IconButton>
                            </Tooltip>
                        }
                    </div>

                    {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}

                    {!showQuery &&
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
                                    (<Typography>No records found</Typography>)
                                }
                            </div>
                        </Box>
                    }
                </Fetcher>
                </> }
                {historicalScreenFlag &&
                    <IndexStatsHistoricalScreen databaseName={props.databaseName} />
                }
            </Paper>
        </Box>
    );
};

