import React, { FunctionComponent, useEffect, useState } from "react";
import { Paper, Accordion, AccordionSummary, AccordionDetails, Typography, Tooltip, IconButton, Box, } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Fetcher } from '../../../../common/components/Fetcher';
import { SQLService } from "../../../services/SQLService";
import { ICustomError, IMetricMetadata, SessionLocksResponse, ISessionLocksResponse } from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from '@mui/icons-material/Code';
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from '@mui/icons-material/Replay';
import { useStyles } from "../../../components/StyleClass";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import { MetricHeader } from "../../../components/MetricHeader";
import { getSessionLocksColumns } from "./AllSessionColumns";

interface SessionLocksScreenProps {
    databaseName: string;
    sessionId: number;
}

export const SessionLocksScreen: FunctionComponent<SessionLocksScreenProps> = (props) => {
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sessionLocks, setSessionLocks] = useState<SessionLocksResponse[]>([]);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [expanded, setExpanded] = React.useState<boolean>(false);

    const handleOnApiResponse = (r: ISessionLocksResponse | ICustomError) => {
        // console.log("Received Data in SessionLocksScreen: ", r)
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            // console.log("Session Locks [handleOnApiResponse]")
            if (r) {
                const result = r.metricOutput?.result?.queryList;
                if (result) {
                    setMetadata(r.metadata);
                    setSessionLocks(result)
                }
            }
        }
    }
    useEffect(() => {
        if (props.sessionId !== undefined) {
            handleReload();
        }
    }, [props.sessionId])

    const handleReload = () => {
        if (props.sessionId !== undefined) {
            // console.log("Handling Reload")
            SQLService.getSessionLocks(props.databaseName, props.sessionId)
                .then((r) => {
                    // console.log("Got some data: ", r)
                    handleOnApiResponse(r);
                    setErrorMessage('');
                    setExpanded(true);
                }).catch((e) => {
                    // console.log(e)
                    setErrorMessage(e);
                    setExpanded(true);
                })
        }
    }

    const handleChange = () => (event: React.ChangeEvent<{}>) => {
        setExpanded(!expanded);
    };
    const options: MUIDataTableOptions = {
        filter: false,
        selectableRows: 'none',
        print: false,
        download: true,
        responsive: "vertical",
        resizableColumns: true,
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10, 20],
        setTableProps: () => {
            return {size: 'small'}
        }
      };

    return (
        <Accordion id="sessionLocks" expanded={expanded} onChange={handleChange()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.summaryContent}>
                    <MetricHeader title="Session Locks" metadata={metadata} />
                </div>
            </AccordionSummary>
            <AccordionDetails >
                {props.sessionId && <Paper style={{ width: "-webkit-fill-available" }}>
                    <div style={{ float: 'right' }}>
                        <Tooltip title="Reload">
                            <IconButton onClick={handleReload} size="large">
                                <ReplayIcon />
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
                        <div style={{ float: 'right', padding: '10px' }}>
                            {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                            <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                                <IconButton aria-label="delete" onClick={() => setShowQuery(!showQuery)} size="large">
                                    <CodeIcon />
                                </IconButton>
                            </Tooltip>
                        </div>

                        {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}

                        {!showQuery &&
                            <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                                <div style={{ height: 'auto', width: '100%' }}>
                                    {!errorMessage && sessionLocks.length ? (
                                        <MUIDataTable
                                            title=""
                                            data={sessionLocks}
                                            columns={getSessionLocksColumns()}
                                            options={options}
                                        />
                                    ) :
                                        (<Typography>No session locks found</Typography>)
                                    }
                                </div>
                            </Box>
                        }
                </Paper>}
            </AccordionDetails>
        </Accordion>
    );
};


