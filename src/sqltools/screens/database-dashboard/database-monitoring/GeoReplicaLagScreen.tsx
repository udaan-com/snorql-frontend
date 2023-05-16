import React, { FunctionComponent, useState, useEffect } from "react";
import { Paper, Accordion, AccordionSummary, AccordionDetails, Tooltip, IconButton, Box, FormControl, FormGroup, FormControlLabel, Switch, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SQLService } from "../../../services/SQLService";
import { GeoReplicaProperties, ICustomError, IGeoReplicaLag, IGeoReplicaLagResponse, IMetricMetadata, IReadReplicationLag, IReadReplicationLagRecommendation, IReadReplicationLagResponse } from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@mui/icons-material/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import { MetricHeader } from "../../../components/MetricHeader";
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import { showQueryEvent, expandMetricEvent } from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import { Alert, AlertTitle } from '@mui/material';
import ProgressView from '../../../../common/components/ProgressView';
import makeStyles from '@mui/styles/makeStyles';

interface GeoReplicaLagScreenProps {
    databaseName: string;
    geoReplicaProperties?: GeoReplicaProperties
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
        textAlign: 'center',
        border: 'none',
        padding: '15% 0',
        borderBottomStyle: 'solid',
        borderBottomWidth: '10px'
    },
    boxGreenColor: {
        borderBottomColor: 'green',
    },
    boxRedColor: {
        borderBottomColor: 'red',
    },
    summaryContent: {
        justifyContent: "space-between",
        display: "flex",
        flexGrow: 1,
        marginBottom: "-10px"
    },
}));

export const GeoReplicaLagScreen: FunctionComponent<GeoReplicaLagScreenProps> = (props) => {
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [geoReplicaLag, setGeoReplicaLag] = useState<IGeoReplicaLag | null>(null);
    const [recommendation, setRecommendation] = useState<IReadReplicationLagRecommendation | null>(null);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [autoRefreshEnabled, setAutoRefresh] = useState<boolean>(false);
    const email = useAdminEmail();

    const fetchData = async () => {
        try {
            if (props.geoReplicaProperties) {
                const response: IGeoReplicaLagResponse | ICustomError = await SQLService.getGeoReplicaLag(
                    props.databaseName,
                    props.geoReplicaProperties.primaryDbName
                )
                if ("code" in response && "message" in response && "details" in response) {
                    setErrorMessage(`${response.message}: ${response.details}`);
                    setLoading(false);
                } else {
                    setGeoReplicaLag(response.metricOutput.result.queryList[0])
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
        return () => { };
    }, [])

    useEffect(() => {
        if (autoRefreshEnabled) {
            const intervalId = setInterval(() => {
                fetchData()
            }, 1000 * 10)
            return () => clearInterval(intervalId)
        }
    }, [autoRefreshEnabled])

    const closeAlertDialog = () => setAlertDialogOpen(false);
    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.DATABASE_MONITORING}_GEO_REPLICATION_LAG` };

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
    return (
        <Accordion expanded={expanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                onClick={handleChange}
            >
                <div className={classes.summaryContent}><MetricHeader title="Geo Replica Lag" metadata={metadata} /></div>
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
                            <IconButton onClick={() => showAlertDialog()} size="large">
                                <AddAlertIcon />
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
                        {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                        <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
                            <IconButton aria-label="delete" onClick={() => handleShowQuery()} size="large"> <CodeIcon /> </IconButton>
                        </Tooltip>
                    </div>
                    {!loading && errorMessage && (<div style={{ marginLeft: "5px", padding: "10px", color: "red", fontFamily: "monospace" }}>
                        <details open>
                            <summary>Error</summary>
                            <p>{errorMessage}</p>
                        </details>
                    </div>)}

                    {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}
                    {(!loading && !showQuery && !errorMessage && geoReplicaLag != undefined && geoReplicaLag != null) ? (
                        <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                            <div className={classes.root}>
                                <Paper elevation={3}>
                                    <Box
                                        className={`${classes.box} ${recommendation && recommendation.isActionRequired ? classes.boxRedColor : classes.boxGreenColor}`}>
                                        <span style={{ fontSize: '40px' }}>{geoReplicaLag.replicationLagSec}</span>
                                        <span>seconds</span>
                                    </Box>
                                </Paper>
                            </div>
                            <div style={{ padding: '10px' }}>
                                <Typography style={{ margin: '10px' }}><strong>Primary DB: </strong>{props.geoReplicaProperties?.primaryDbName}</Typography>
                                <Typography style={{ margin: '10px' }}><strong>Secondary/Geo Replicas:</strong>
                                    {props.geoReplicaProperties?.secondaryReplicas.map(i => {
                                        return <Typography>{i}</Typography>
                                    })}
                                </Typography>
                            </div>
                        </Box>
                    ) : (
                        <div>
                            {!showQuery && !errorMessage && <>
                                <span>Fetching Data ....</span>
                                <ProgressView />
                            </>}
                        </div>
                    )}
                    {recommendation && !loading && !showQuery && (
                        <Alert severity={recommendation.isActionRequired ? "error" : "success"}>
                            <AlertTitle>Recommendations</AlertTitle>
                            {recommendation.text}
                        </Alert>)
                    }
                </Paper>
            </AccordionDetails>
        </Accordion>
    );
};
