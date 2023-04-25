import React, { FunctionComponent, useState, useEffect } from "react";
import { Paper, Accordion, AccordionSummary, AccordionDetails,  Tooltip, IconButton, Box, FormControl, FormGroup, FormControlLabel, Switch } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { SQLService } from "../../../services/SQLService";
import { ICustomError, IMetricMetadata, IReadReplicationLag, IReadReplicationLagRecommendation, IReadReplicationLagResponse } from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import AddAlertIcon from "@material-ui/icons/AddAlert";
import { MetricHeader } from "../../../components/MetricHeader";
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import { showQueryEvent, expandMetricEvent, configureDataRecordingViewEvent } from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import { Alert, AlertTitle } from "@material-ui/lab";
import ProgressView from '../../../../common/components/ProgressView';
import { makeStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { HistoricalReadReplicaLag } from './HistoricalReadReplicaLagScreen';

interface ReadReplicationLagScreenProps {
  databaseName: string;
  readReplicaDbName?: string
}

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(1),
        width: theme.spacing(21),
        height: theme.spacing(13),
      },
    },
    box: {
      textAlign:'center',
      border:'none',
      padding: '15% 0',
      borderBottomStyle:'solid',
      borderBottomWidth:'10px'
    },
    boxGreenColor: {
      borderBottomColor:'green',
    },
    boxRedColor: {
      borderBottomColor:'red',
    },
    summaryContent: {
        justifyContent: "space-between",
        display: "flex",
        flexGrow: 1,
        marginBottom: "-10px"
    },
  }));

export const ReadReplicationLagScreen: FunctionComponent<ReadReplicationLagScreenProps> = (props) => {
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [readReplicationLag, setReadReplicationLag] = useState<IReadReplicationLag | null>(null);
    const [recommendation, setRecommendation] = useState<IReadReplicationLagRecommendation | null>(null);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [autoRefreshEnabled, setAutoRefresh] = useState<boolean>(false);
    const [jobConfigureDialogOpen, setJobConfigureDialogOpen] = useState<boolean>(false);
    const [historicalScreenFlag, setHistoricalScreenFlag] = useState<boolean>(false);
    const email = useAdminEmail();

    const fetchData = async () => {
        try {
            if(props.readReplicaDbName){
                const response: IReadReplicationLagResponse | ICustomError = await SQLService.getReadReplicationLag(props.databaseName, props.readReplicaDbName)
                if ("code" in response && "message" in response && "details" in response) {
                    setErrorMessage(`${response.message}: ${response.details}`);
                    setLoading(false);
                } else {
                    setReadReplicationLag(response.metricOutput.result.queryList[0])
                    setLoading(false);
                    setMetadata(response.metadata);
                    response.metricOutput.recommendation && setRecommendation(response.metricOutput.recommendation)
                }
            }
        } catch (e: ICustomError | any) {
            console.log("error ", e);
            if ("code" in e && "message" in e && "detail" in e) {
                console.log("error ", e);
                setErrorMessage(`${e.message}: ${e.details}`);
                setLoading(false)
            } else if ('error' in e) {
                setErrorMessage(e.error)
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        (async () => {
            fetchData()
          })();
          return () => {}; 
    }, [])

    useEffect(()=>{
        if (autoRefreshEnabled) {
            const intervalId = setInterval(() => {
                fetchData()
            }, 1000 * 10) 
            return () => clearInterval(intervalId)
        }
    }, [autoRefreshEnabled])

    const closeAlertDialog = () => setAlertDialogOpen(false);
    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.DATABASE_MONITORING}_READ_REPLICATION_LAG` };
    
    const handleChange = () => {
        setExpanded((prev) => !prev);
        metadata && expandMetricEvent(basicPropsForMixPanel);
    };
    const handleShowQuery = () => {
        setShowQuery(!showQuery);
        metadata &&
        showQueryEvent({
            ...basicPropsForMixPanel,
            query: metadata.underlyingQueries[0],
        });
    };
    const showAlertDialog = () => {
        setAlertDialogOpen(true);
    };
    const handleAutoRefreshViewToggle = () => {
        setAutoRefresh(!autoRefreshEnabled)
    }
    const getLagValue = (replicationLagInMillis: number): {value:number, type: string} => {
        if(replicationLagInMillis < 1000) return { value: replicationLagInMillis , type: 'milliseconds'}
            else if(replicationLagInMillis/1000 < 60) return { value: replicationLagInMillis/1000, type: 'seconds'}
            else {
                return { value: replicationLagInMillis/(60*1000), type: 'minutes' }
            }
    }
    const handleJobConfigureDialogOpen = () => {
        setJobConfigureDialogOpen(true);
        configureDataRecordingViewEvent(basicPropsForMixPanel);
    };
    return (
        <Accordion expanded={expanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} IconButtonProps={{ onClick: handleChange }}>
                <div className={classes.summaryContent}><MetricHeader title="Read Replica Lag" metadata={metadata} /></div>
                <div style={{ float: "right" }}>
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
                    {metadata && metadata.supportsAlert && (
                        <Tooltip title="Manage Alerts">
                            <IconButton onClick={() => showAlertDialog()}>
                            <AddAlertIcon fontSize="default" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {metadata && metadata.supportsHistorical && (
                    <Tooltip title="Configure Data Recording">
                        <IconButton onClick={handleJobConfigureDialogOpen}>
                        <SettingsIcon fontSize="default" />
                        </IconButton>
                    </Tooltip>
                    )}
                </div>
            </AccordionSummary>
            <AccordionDetails>
                {metadata?.supportsAlert && (
                    <SqlAlertDialog
                        open={alertDialogOpen}
                        handleClose={closeAlertDialog}
                        databaseName={props.databaseName}
                        supportedAlertTypes={metadata?.supportedAlerts}
                    />
                )}
                <Paper style={{ width: "100%" }}>
                    <div style={{ float: "right" }}>
                        {metadata && metadata.supportsHistorical &&
                            <FormControl component="fieldset">
                                <FormGroup aria-label="historicalEnabled" row>
                                    <FormControlLabel
                                    onChange={() => setHistoricalScreenFlag(!historicalScreenFlag)}
                                    control={<Switch color="primary" />}
                                    label="View Historical Data"
                                    labelPlacement="bottom"
                                    />
                                </FormGroup>
                            </FormControl> 
                        }
                        {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                        {!historicalScreenFlag && <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
                            <IconButton aria-label="delete" onClick={() => handleShowQuery()}> <CodeIcon /> </IconButton>
                        </Tooltip>}
                    </div>
                    {!loading && errorMessage && ( <div style={{ marginLeft: "5px", padding: "10px", color: "red", fontFamily: "monospace" }}>
                        <details open>
                            <summary>Error</summary>
                            <p>{errorMessage}</p>
                        </details>
                    </div> )}

                    {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}
                    {(!historicalScreenFlag && !loading && !showQuery && !errorMessage && readReplicationLag!=undefined && readReplicationLag!=null) ? (
                        <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                            <div className={classes.root}>
                                <Paper elevation={3}> 
                                    <Box 
                                        className={`${classes.box} ${recommendation && recommendation.isActionRequired ? classes.boxRedColor: classes.boxGreenColor}`}>
                                        <span style={{fontSize:'40px'}}>{getLagValue(readReplicationLag.replicationLagInMillis).value}</span>
                                        <span>{getLagValue(readReplicationLag.replicationLagInMillis).type}</span>
                                    </Box>
                                </Paper>
                            </div>
                        </Box>
                    ) : (
                        <div>
                            {!historicalScreenFlag && !showQuery && !errorMessage && <>
                                <span>Fetching Data ....</span>
                                <ProgressView/>
                            </>}
                        </div>
                    )}
                    {!historicalScreenFlag && recommendation && !loading && !showQuery && (
                        <Alert severity={recommendation.isActionRequired ? "error" : "success"}>
                            <AlertTitle>Recommendations</AlertTitle>
                            {recommendation.text}
                        </Alert>)
                    }
                    {historicalScreenFlag && <HistoricalReadReplicaLag databaseName={props.databaseName}/> }
            </Paper>
        </AccordionDetails>
        <SingleTriggerDialog
            open={jobConfigureDialogOpen}
            handleClose={() => setJobConfigureDialogOpen(false)}
            databaseName={props.databaseName}
            metricId={"performance_readReplicationLag"}
            metricName={"Read Replica Lag"}
            minimumRepeatInterval={metadata?.minimumRepeatInterval}
        />
        </Accordion>
    );
};
