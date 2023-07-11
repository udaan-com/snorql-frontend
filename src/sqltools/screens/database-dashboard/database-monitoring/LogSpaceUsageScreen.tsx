import React, { FunctionComponent, useState } from "react";
import { Paper, Accordion, AccordionSummary, AccordionDetails, Typography, Tooltip, IconButton, TableRow, TableCell, Table, TableBody, Box, FormControl, FormGroup, FormControlLabel, Switch } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import { ICustomError, ILogSpaceUsage, ILogSpaceUsageRecommendation, ILogSpaceUsageResponse, ILogSpaceUsageResult, IMetricMetadata } from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@mui/icons-material/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@mui/icons-material/Replay";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import { useStyles } from "../../../components/StyleClass";
import Chart from "react-google-charts";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@mui/icons-material/Settings";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import { reloadMetricEvent, showQueryEvent, expandMetricEvent, configureDataRecordingViewEvent } from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import { Alert, AlertTitle } from '@mui/material';
import { HistoricalLogSpaceUsage } from "./HistoricalLogSpaceUsage";

interface LogSpaceUsageScreenProps {
    databaseName: string;
}

export const LogSpaceUsageScreen: FunctionComponent<LogSpaceUsageScreenProps> = (props) => {
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [logSpaceUsage, setLogSpaceUsage] = useState<ILogSpaceUsage | null>(null);
    const [recommendation, setRecommendation] = useState<ILogSpaceUsageRecommendation | null>(null);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [jobConfigureDialogOpen, setJobConfigureDialogOpen] = useState<boolean>(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
    const [historicalScreenFlag, setHistoricalScreenFlag] = useState<boolean>(false);
    const email = useAdminEmail();

    const handleOnApiResponse = (r: ILogSpaceUsageResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        } else {
            setMetadata(r.metadata);
            setLogSpaceUsage(r.metricOutput.result.queryList[0])
            r.metricOutput.recommendation && setRecommendation(r.metricOutput.recommendation)
        }
    };
    const closeAlertDialog = () => setAlertDialogOpen(false);
    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.DATABASE_MONITORING}_LOG_SPACE` };
    const handleReload = () => {
        SQLService.getLogSpaceUsage(props.databaseName).then((r) => {
            handleOnApiResponse(r);
            setErrorMessage("");
            setExpanded(true);
            metadata && reloadMetricEvent(basicPropsForMixPanel);
        }).catch((e) => {
            setErrorMessage(e);
            setExpanded(true);
        });
    };
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

    const handleJobConfigureDialogOpen = () => {
        setJobConfigureDialogOpen(true);
        configureDataRecordingViewEvent(basicPropsForMixPanel);
    };
    return (
        <Accordion expanded={expanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon onClick={handleChange} />}
            >
                <div className={classes.summaryContent}><MetricHeader title="Log Space Usage" metadata={metadata} /></div>
                <div style={{ float: "right" }}>
                    {metadata && metadata.supportsAlert && (
                        <Tooltip title="Manage Alerts">
                            <IconButton onClick={() => showAlertDialog()} size="large">
                                <AddAlertIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {metadata && metadata.supportsHistorical && (
                        <Tooltip title="Configure Data Recording">
                            <IconButton onClick={handleJobConfigureDialogOpen} size="large">
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Reload">
                        <IconButton onClick={handleReload} size="large">
                            <ReplayIcon />
                        </IconButton>
                    </Tooltip>
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
                        {showQuery && metadata && metadata.underlyingQueries && !historicalScreenFlag && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                        {!historicalScreenFlag && <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
                            <IconButton aria-label="delete" onClick={() => handleShowQuery()} size="large"> <CodeIcon /> </IconButton>
                        </Tooltip>}
                    </div>
                    {errorMessage && (<div style={{ marginLeft: "5px", padding: "10px", color: "red", fontFamily: "monospace" }}>
                        <details open>
                            <summary>Error</summary>
                            <p>{errorMessage}</p>
                        </details>
                    </div>)}

                    {!historicalScreenFlag && <Fetcher fetchData={() => SQLService.getLogSpaceUsage(props.databaseName)} onFetch={(r) => handleOnApiResponse(r)}>
                        {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}
                        {!showQuery && (
                            <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                                <div style={{ height: 700, width: "100%" }}>
                                    {logSpaceUsage && (
                                        <Chart
                                            chartType="PieChart"
                                            data={[
                                                ["Name", "Space in GB"],
                                                [`Total Log Space ${logSpaceUsage.maxSpaceInGB} GB`, logSpaceUsage.maxSpaceInGB],
                                                [`Used Log Space ${logSpaceUsage.spaceUsedInGB} GB`, logSpaceUsage.spaceUsedInGB],
                                                [`Free Log Space ${logSpaceUsage.maxSpaceInGB - logSpaceUsage.spaceUsedInGB} GB`, logSpaceUsage.maxSpaceInGB - logSpaceUsage.spaceUsedInGB],
                                            ]}
                                            options={{
                                                title: "Log Space Usage Breakup",
                                            }}
                                            width={"100%"}
                                            height={"400px"}
                                        />
                                    )}
                                    {recommendation && (
                                        <Alert severity={recommendation.isActionRequired ? "error" : "success"}>
                                            <AlertTitle>Recommendations</AlertTitle>
                                            {recommendation.text}
                                        </Alert>)
                                    }
                                </div>
                            </Box>
                        )}
                    </Fetcher>}
                    {historicalScreenFlag && <HistoricalLogSpaceUsage databaseName={props.databaseName} />}
                </Paper>
            </AccordionDetails>
            <SingleTriggerDialog
                open={jobConfigureDialogOpen}
                handleClose={() => setJobConfigureDialogOpen(false)}
                databaseName={props.databaseName}
                metricId={"performance_logSpaceUsage"}
                metricName={"Database Log Space Usage Size"}
                minimumRepeatInterval={metadata?.minimumRepeatInterval}
            />
        </Accordion>
    );
};
