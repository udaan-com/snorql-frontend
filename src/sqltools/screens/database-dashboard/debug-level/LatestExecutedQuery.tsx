import React, { FunctionComponent, useEffect, useState } from "react";
import { Paper, Accordion, AccordionSummary, AccordionDetails, Typography, Tooltip, IconButton, Box } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Fetcher } from '../../../../common/components/Fetcher';
import { SQLService } from "../../../services/SQLService";
import { ICustomError, IMetricMetadata, ISessionLatestExecutedQueryResponse } from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from '@material-ui/icons/Code';
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from '@material-ui/icons/Replay';
import { useStyles } from "../../../components/StyleClass";
import { MetricHeader } from "../../../components/MetricHeader";

interface LatestExecutedQueryProps {
    databaseName: string;
    sessionId: number;
}

export const LatestExecutedQueryScreen: FunctionComponent<LatestExecutedQueryProps> = (props) => {
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [expanded, setExpanded] = useState<boolean>(false);
    const [latestActiveQueryString, setLatestActiveQueryString] = useState<string>('');

    const handleOnApiResponse = (r: ISessionLatestExecutedQueryResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            if (r) {
                const result = r.metricOutput?.result?.queryList;
                if (result) {
                    setMetadata(r.metadata);
                    const queryInfo = result[0]
                    if (queryInfo) setLatestActiveQueryString(result[0].queryString)
                }
            }
        }
    }
    useEffect(() => {
        if (props.sessionId) {
            handleReload();
        }
    }, [props.sessionId])

    const handleReload = () => {
        if (props.sessionId !== undefined) {
            SQLService.getSessionLatestExecutedQuery(props.databaseName, props.sessionId)
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

    const handleChange = () => (event: React.ChangeEvent<{}>) => {
        setExpanded(!expanded);
    };

    return (
        <Accordion id="latestExecutedQuery" expanded={expanded} onChange={handleChange()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.summaryContent}>
                    <MetricHeader title="Latest Executed Query" metadata={metadata} />
                </div>
            </AccordionSummary>
            <AccordionDetails >
                {props.sessionId && <Paper style={{ width: "-webkit-fill-available" }}>
                    <div style={{ float: 'right' }}>
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
                        <div style={{ float: 'right', padding: '10px' }}>
                            {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                            <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                                <IconButton aria-label="delete" onClick={() => setShowQuery(!showQuery)}>
                                    <CodeIcon />
                                </IconButton>
                            </Tooltip>
                        </div>

                        {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}

                        {!showQuery &&
                            <Box paddingTop={8} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                                <div style={{ height: 'auto', width: '100%' }}>
                                    {!errorMessage && latestActiveQueryString ? (
                                        <ShowQueryScreen query={latestActiveQueryString} />
                                    ) :
                                        (<Typography>No query found</Typography>)
                                    }
                                </div>
                            </Box>
                        }
                </Paper>}
            </AccordionDetails>
        </Accordion>
    )
};


