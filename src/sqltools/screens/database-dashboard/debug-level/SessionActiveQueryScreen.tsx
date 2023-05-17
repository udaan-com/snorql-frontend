import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
    Paper, Accordion, AccordionSummary, AccordionDetails, Typography, Tooltip, IconButton,
    TableRow, TableCell, Table, TableBody, Box, Grid, Button
} from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Fetcher } from '../../../../common/components/Fetcher';
import { SQLService } from "../../../services/SQLService";
import { ICustomError, IMetricMetadata, ISessionActiveQueryMetricResponse, SessionActiveQuery } from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from '@mui/icons-material/Code';
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from '@mui/icons-material/Replay';
import { useStyles } from "../../../components/StyleClass";
import { MetricHeader } from "../../../components/MetricHeader";
import "html-query-plan/css/qp.css";
import { showPlan } from "html-query-plan/dist/index";

interface SessionActiveQueryScreenProps {
    databaseName: string;
    sessionId: number;
}

export const SessionActiveQueryScreen: FunctionComponent<SessionActiveQueryScreenProps> = (props) => {

    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [TableSize, setTableSize] = useState<SessionActiveQuery[]>([]);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<number>(props.sessionId);
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [activeQueryString, setActiveQueryString] = useState<string>('');
    const [xmlQueryPlan, setXMLQueryPlan] = useState<string>('');

    const xmlContainerRef = useRef(null);

    const handleOnApiResponse = (r: ISessionActiveQueryMetricResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            // console.log(r)
            if (r) {
                const result = r.metricOutput?.result?.queryList;
                if (result && result.length > 0) {
                    let results = formatToAddId(result)
                    setXMLQueryPlan(results[0].xmlPlan)
                    setActiveQueryString(results[0].queryText)
                    setTableSize(results)
                }
                if (result) {
                    setMetadata(r.metadata);
                }
            }
        }
    }
    useEffect(() => {
        setSessionId(props.sessionId)
        handleReload()
        resetScreen()
    }, [props.sessionId])

    const formatToAddId = (response: any[]): SessionActiveQuery[] => {
        response.map((eachItem, index) => {
            eachItem['id'] = index + 1
        })
        return response;
    }

    const resetScreen = () => {
        setErrorMessage('')
        setTableSize([])
        setShowQuery(false)
        setActiveQueryString('')
        setXMLQueryPlan('')
    }

    const handleReload = () => {
        if (props.sessionId) {
            SQLService.getSessionActiveQuery(props.databaseName, props.sessionId)
                .then((r) => {
                    handleOnApiResponse(r);
                    setErrorMessage('');
                    setExpanded(true);
                }).catch((e) => {
                    setErrorMessage(e);
                    setExpanded(true);
                })
        }
    }

    const renderXmlPlan = () => {
        setTimeout(() => {
            if (xmlContainerRef.current) {
                showPlan(xmlContainerRef.current!!, xmlQueryPlan);
            }
        }, 1000);
    };

    const handleChange = () => {
        setExpanded((prev) => !prev);
    }

    return (
        <Accordion expanded={expanded} >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                onClick={handleChange}
            >
                <div className={classes.summaryContent}>
                    <MetricHeader title="Session Active Query" metadata={metadata} />
                </div>
                <div style={{ float: 'right' }}>
                    {!showQuery &&
                        <Tooltip title="Reload">
                            <IconButton onClick={() => handleReload()} size="large">
                                <ReplayIcon />
                            </IconButton>
                        </Tooltip>
                    }
                </div>
            </AccordionSummary>
            <AccordionDetails >
                {TableSize.length ?
                    (<Grid container>
                        <Grid item xs={12}>
                            <Paper style={{ marginBottom: "10px", width: "-webkit-fill-available" }}>
                                {errorMessage &&
                                    <div style={{ marginLeft: '5px', padding: '10px', color: 'red', fontFamily: 'monospace' }}>
                                        <details open>
                                            <summary>Error</summary>
                                            <p>{errorMessage}</p>
                                        </details>
                                    </div>
                                }

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        {/* <Fetcher
                                fetchData={() => SQLService.getSessionActiveQuery(props.databaseName, props.sessionId)}
                                onFetch={(r) => handleOnApiResponse(r)}
                            > */}
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
                                                    {!errorMessage && TableSize.length ? (
                                                        <Table>
                                                            <TableBody>
                                                                {Object.entries(TableSize[0]).map((x, y) => {
                                                                    if (x[0] != 'xmlPlan' && x[0] != 'queryText')
                                                                        return (
                                                                            <TableRow key={y}>
                                                                                <TableCell>{x[0].split(/(?=[A-Z])/).join(' ').toUpperCase()}</TableCell>
                                                                                <TableCell>{x[1]}</TableCell>
                                                                            </TableRow>
                                                                        );
                                                                }
                                                                )
                                                                }
                                                            </TableBody>
                                                        </Table>
                                                    ) :
                                                        (<Typography>No active queries found</Typography>)
                                                    }
                                                </div>
                                            </Box>
                                        }
                                        {/* </Fetcher> */}
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button className={classes.simpleButton}>Active Query String</Button>
                                        <ShowQueryScreen query={activeQueryString} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                        {xmlQueryPlan && <Grid item xs={12}>
                            <Paper style={{ marginTop: "10px", width: "-webkit-fill-available", overflowY: 'scroll' }}>
                                <Button className={classes.simpleButton}>Actual Query Execution Plan</Button>
                                <div ref={xmlContainerRef} />
                                <>{renderXmlPlan()}</>
                            </Paper>
                        </Grid>}
                    </Grid>) : (
                        <Paper style={{ marginBottom: "10px", width: "-webkit-fill-available" }}>
                            <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                                <div style={{ height: 'auto', width: '100%' }}>
                                    <Typography>No active queries found</Typography>
                                </div>
                            </Box>
                        </Paper>
                    )}
            </AccordionDetails>
        </Accordion>
    );
};


