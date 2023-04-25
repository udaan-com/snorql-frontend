import React, { FunctionComponent, useState } from "react";
import { Paper, Accordion, AccordionSummary, AccordionDetails, Typography, Tooltip, IconButton, FormControl, Switch, FormControlLabel, FormGroup } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Fetcher } from '../../../../common/components/Fetcher';
import { SQLService } from "../../../services/SQLService";
import { ICustomError, IDatabaseTableSizeResponse, DatabaseTableSizeResponse, IMetricMetadata } from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from '@material-ui/icons/Code';
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from '@material-ui/icons/Replay';
import MUIDataTable from "mui-datatables";
import { getTableSizeColumns } from "./DatabaseTableSizeScreenModels";
import { useStyles } from "../../../components/StyleClass";
import { tableOptions } from "./DatabaseLevelScreen";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from '@material-ui/icons/Settings';
import { DatabaseTableSizeHistoricalScreen } from "./DatabaseTableSizeHistoricalScreen";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { reloadMetricEvent, showQueryEvent, expandMetricEvent, toggleToHistoricViewEvent, configureDataRecordingViewEvent } from '../../../tracking/TrackEventMethods';
import { useAdminEmail } from '../../../../hooks';
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";

interface DatabaseTableSizeScreenProps {
    databaseName: string;
}

export const DatabaseTableSizeScreen: FunctionComponent<DatabaseTableSizeScreenProps> = (props) => {
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dbTableSize, setDbTableSize] = useState<DatabaseTableSizeResponse[]>([]);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [historicalScreenFlag, setHistoricalScreenFlag] = useState<boolean>(false);
    const [jobConfigureDialogOpen, setJobConfigureDialogOpen] = useState<boolean>(false);
    const email = useAdminEmail();

    const handleOnApiResponse = (r: IDatabaseTableSizeResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            const result = r.metricOutput.result.queryList;
            setMetadata(r.metadata);
            setDbTableSize(formatToAddId(result))
        }
    }

    const formatToAddId = (response: any[]): DatabaseTableSizeResponse[] => {
        response.map((eachItem, index) => {
            eachItem['id'] = index + 1
        })
        return response;
    }
    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.STORAGE, metricText: `${MenuText.DATABASE_LEVEL}_TABLE_SIZE`}
    const handleReload = () => {
        SQLService.getDatabaseTableSize(props.databaseName)
            .then((r) => {
                handleOnApiResponse(r)
                setExpanded(true);
                metadata && reloadMetricEvent(basicPropsForMixPanel)
            })
    }
    const handleChange = () => {
        setExpanded((prev) => !prev);
        metadata && expandMetricEvent(basicPropsForMixPanel)
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
        setJobConfigureDialogOpen(true)
        configureDataRecordingViewEvent(basicPropsForMixPanel)
    }

    return (
        <Accordion expanded={expanded} >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}
                IconButtonProps={{
                    onClick: handleChange
                }} >
                <div className={classes.summaryContent}>
                    <MetricHeader title="Database Table Storage Size" metadata={metadata}/>
                    {metadata && metadata.supportsHistorical &&
                    <>
                    <div style={{ float: 'right' }}>
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
                        {/* <Switch  value="historicalScreenFlag" inputProps={{ 'title': 'Historical Data' }} /> */}
                        
                        <Tooltip title="Configure Data Recording">
                            <IconButton onClick={handleJobConfigureDialogOpen}>
                                <SettingsIcon fontSize="default" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    </> }
                </div>
            </AccordionSummary>
            <AccordionDetails >
                <Paper style={{ width: "100%" }}>
                {!historicalScreenFlag &&
                <>
                    <div style={{ float: 'right' }}>
                        <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                            <IconButton aria-label="delete" onClick={() => handleShowQuery()}>
                                <CodeIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reload">
                            <IconButton onClick={handleReload}>
                                <ReplayIcon fontSize="default" />
                            </IconButton>
                        </Tooltip>
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
                        fetchData={() => SQLService.getDatabaseTableSize(props.databaseName)}
                        onFetch={(r) => handleOnApiResponse(r)}
                    >
                        <div style={{ float: 'right', padding: '10px' }}>
                            {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                        </div>

                        {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}

                        {!showQuery &&
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
                    </Fetcher></>}
                    {historicalScreenFlag && <DatabaseTableSizeHistoricalScreen databaseName={props.databaseName} />}
                </Paper>
            </AccordionDetails>
            <SingleTriggerDialog 
            open={jobConfigureDialogOpen} 
            handleClose={() => setJobConfigureDialogOpen(false)} 
            databaseName={props.databaseName} 
            metricId={"storage_dbTables"} 
            metricName={"Database Table Size"}
            minimumRepeatInterval={metadata?.minimumRepeatInterval} />
        </Accordion>
    )
};

