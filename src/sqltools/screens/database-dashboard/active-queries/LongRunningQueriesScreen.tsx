import React, { FunctionComponent, useEffect, useState } from "react";
import {
    Paper,
    Theme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Tooltip,
    IconButton,
    TextField,
    Button,
    FormControl,
    FormGroup,
    FormControlLabel,
    Switch,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Fetcher } from '../../../../common/components/Fetcher';
import { SQLService } from "../../../services/SQLService";
import { ActiveQuery, ICustomError, ILongRunningQueryMetricResponse, IMetricMetadata } from "../../../models";
import { getColumns } from "./allQueryColumns";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from '@mui/icons-material/Code';
import { ShowQueryScreen } from "../ShowQueryScreen";
import { NoDataExists } from "../../../components/NoDataExists";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import ReplayIcon from '@mui/icons-material/Replay';
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from '@mui/icons-material/Settings';
import { LongRunningQueriesHistoricalScreen } from "./LongRunningQueriesHistoricalScreen";
import { LongRunningTriggersConfigDialog } from "./LongRunningTriggersConfigDialog";
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import AddAlertIcon from '@mui/icons-material/AddAlert';
import { reloadMetricEvent, showQueryEvent, expandMetricEvent, toggleToHistoricViewEvent, configureDataRecordingViewEvent } from '../../../tracking/TrackEventMethods';
import { useAdminEmail } from '../../../../hooks';
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import { Alert } from '@mui/material';

interface LongRunningQueriesProps {
    databaseName: string;
    baseurl: string;
}

export const LongRunningQueriesScreen: FunctionComponent<LongRunningQueriesProps> = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,
            content: {
                maxWidth: 1500,
                flexGrow: 1,
                padding: theme.spacing(3),
            },
            heading: {
                fontSize: theme.typography.pxToRem(15),
                fontWeight: "bold",
                flexBasis: '33.33%',
                flexShrink: 0,
                textTransform: "uppercase"
            },
            summaryContent: {
                justifyContent: "space-between",
                display: "flex",
                flexGrow: 1,
                marginBottom: "-10px"
            }
        }));

    const classes = useStyles();


    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [longRunningQueries, setLongRunningQueries] = useState<ActiveQuery[]>([]);
    const [cols, setCols] = useState<any>([]);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = React.useState<string>("5");
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [historicalScreenFlag, setHistoricalScreenFlag] = useState<boolean>(false);
    const [jobConfigureModalOpen, setJobConfigureModalOpen] = useState<boolean>(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
    const [autoRefreshEnabled, setAutoRefresh] = useState<boolean>(false);
    const email = useAdminEmail();

    useEffect(()=>{
        // console.log("Auto Refresh: ", autoRefreshEnabled);
        if (autoRefreshEnabled) {
            // console.log("Auto Refresh is enabled !!!")
            const intervalId = setInterval(() => {
                handleReload()
            }, 1000 * 10) 
            return () => clearInterval(intervalId)
        }
    }, [autoRefreshEnabled])

    const handleOnApiResponse = (r: ILongRunningQueryMetricResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        } else if("error" in r) {
            alert(`[ERROR]: ${r['error']}`)
        } else {
            const result = r.metricOutput.result.queryList;
            setMetadata(r.metadata);
            setLongRunningQueries(result);
            const columns = getColumns(props.databaseName, props.baseurl);
            setCols(columns);
        }
    }
    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.ACTIVE_QUERIES}_LONG_RUNNING`}
    const handleReload = () => {
        SQLService.getDbLongRunningQueries(props.databaseName, parseInt(elapsedTime))
        .then(r => {
            handleOnApiResponse(r)
            setElapsedTime("5")
            setExpanded(true);
            metadata && reloadMetricEvent(basicPropsForMixPanel)
        })
    }
    const handleSearch = () => {
        SQLService.getDbLongRunningQueries(props.databaseName, parseInt(elapsedTime))
        .then(r => {
            handleOnApiResponse(r)
            setExpanded(true);
        })
    }
    const handleAutoRefreshViewToggle = () => {
        setAutoRefresh(!autoRefreshEnabled)
    }
    const showJobConfigureDialog = () => {
        setJobConfigureModalOpen(true);
    }
    const handleChange = () => {
        setExpanded((prev) => !prev);
        metadata && expandMetricEvent(basicPropsForMixPanel)
    }
    const closeJobConfigureDialog = () => {
        setJobConfigureModalOpen(false)
    }

    const showAlertDialog = () => {
        setAlertDialogOpen(true)
    }

    const closeAlertDialog = () => {
        setAlertDialogOpen(false)
    }

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


    const x = (
        <Accordion expanded={expanded} >

<AccordionSummary
  expandIcon={<ExpandMoreIcon />}
  onClick={handleChange}
>
                <div className={classes.summaryContent}>
                    <MetricHeader title="Long Running Queries" metadata={metadata} />
                    <div style={{ float: 'right' }}>
                        <FormControl component="fieldset">
                            <FormGroup aria-label="auto-refresh" row>
                                <FormControlLabel
                                onChange={handleAutoRefreshViewToggle} // toggle historical
                                control={<Switch color="secondary" />}
                                label="Auto Refresh"
                                labelPlacement="bottom"
                                />
                            </FormGroup>
                        </FormControl>
                        {metadata && metadata.supportsHistorical &&
                        <FormControl component="fieldset">
                            <FormGroup aria-label="historicalEnabled" row>
                                <FormControlLabel
                                onChange={handleClickHistoricalViewToggle}
                                value={historicalScreenFlag}
                                control={<Switch color="primary" />}
                                label="View Historical Data"
                                labelPlacement="bottom"
                                />
                            </FormGroup>
                        </FormControl> }
                         <Switch  value="historicalScreenFlag" inputProps={{ 'title': 'Historical Data' }} />
                        {metadata && metadata.supportsAlert &&
                        <Tooltip title="Add Alert">
                            <IconButton onClick={() => showAlertDialog()} size="large">
                                <AddAlertIcon />
                            </IconButton>
                        </Tooltip> }
                        {metadata && metadata.supportsHistorical &&
                        <Tooltip title="Configure Data Recording">
                            <IconButton onClick={handleJobConfigureDialogOpen} size="large">
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip> }
                        {!historicalScreenFlag &&
                        <Tooltip title="Reload">
                            <IconButton onClick={() => handleReload()} size="large">
                                <ReplayIcon />
                            </IconButton>
                        </Tooltip>
                        }
                    </div>
                </div>
            </AccordionSummary>
            <Alert severity="info">Please check out COMPUTE UTILIZATION for history of executed queries(from QUERY STORE) on this db</Alert>
            <AccordionDetails >
                <LongRunningTriggersConfigDialog
                    open={jobConfigureModalOpen}
                    handleClose={closeJobConfigureDialog}
                    databaseName={props.databaseName}
                    metricId={"performance_longRunningQueries"}
                    metricName={"Long Running Queries Metric"}
                    minimumRepeatInterval={metadata?.minimumRepeatInterval} />
                {metadata?.supportsAlert &&
                    <SqlAlertDialog
                    open={alertDialogOpen}
                    handleClose={() => closeAlertDialog()}
                    databaseName={props.databaseName}
                    supportedAlertTypes={metadata?.supportedAlerts} />}
                {!historicalScreenFlag &&
                <Paper style={{ width: "100%"}}>
                    <div style={{marginLeft:'5px', padding: '10px'}}>
                        <Typography style={{ padding: '5px'}} variant={"subtitle1"}>Query longer than(in seconds)</Typography>
                        <TextField
                                label="Enter value"
                                onChange={e => { setElapsedTime(e.target.value) }}
                                variant="outlined"
                                style={{width:'250px'}}
                                value={elapsedTime}
                                type="number"
                        />
                        <Button variant="contained" color="primary" onClick={handleSearch} style={{marginLeft: 8, height: '56px', width: 'auto'}}>
                            Search
                        </Button>
                    </div>

                    <Fetcher
                        fetchData={() => SQLService.getDbLongRunningQueries(props.databaseName, parseInt(elapsedTime))}
                        onFetch={(r) => { handleOnApiResponse(r) }} >
                        <div style={{ float: 'right', padding: '10px' }}>
                            {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                            <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                                <IconButton aria-label="delete" onClick={() => handleShowQuery} size="large">
                                    <CodeIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                        {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}
                        <div>
                            {!showQuery && errorMessage && <ErrorMessageCard text={errorMessage}/>}
                            {!showQuery && !errorMessage && longRunningQueries && longRunningQueries.length > 0 &&
                                <LongRunningQueriesTable rows={longRunningQueries} columns={cols} />
                            }
                        </div>
                        {!showQuery && !errorMessage && longRunningQueries.length === 0 && <NoDataExists text="No LongRunning Queries found"/>}
                    </Fetcher>


                </Paper> }
                {historicalScreenFlag &&
                <Paper style={{maxWidth: 1400, width: "-webkit-fill-available"}}>
                    <div style={{marginLeft:'5px', padding: '10px'}}>
                        <LongRunningQueriesHistoricalScreen databaseName={props.databaseName} baseurl={props.baseurl}></LongRunningQueriesHistoricalScreen>
                    </div>
                </Paper>
                }
            </AccordionDetails>
        </Accordion>
    )
    return x
};



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

