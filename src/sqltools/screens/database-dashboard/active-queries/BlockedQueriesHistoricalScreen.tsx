import { Dialog, DialogContent, DialogTitle, IconButton, LinearProgress, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Tooltip, Typography } from "@material-ui/core";
import { Fullscreen, SubdirectoryArrowRight } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import { FBox } from "../../../../common/components/FBox";
import { Fetcher } from "../../../../common/components/Fetcher";
import { HistoricalDataResult, IBlockingTree, IBlockingTreeMetricOutput, IBlockingTreeMetricResult, ICustomError, IMetricHistoricalDataFilter, IMetricHistoricalDataSchema, NextPageToken } from "../../../models";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { NoDataExists } from "../../../components/NoDataExists";
import { StatementDialog } from "../../../components/StatementDialog";
import { SQLService } from "../../../services/SQLService";
import { getColumns } from "./allQueryColumns";

interface BlockedQueriesProps {
    databaseName: string;
}

export const BlockedQueriesHistoricalScreen: FunctionComponent<BlockedQueriesProps> = (props) => {

    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [blockedHistoricalData, setBlockedHistoricalData] = useState<IMetricHistoricalDataSchema[]>([]);
    const [blockedHistoricalQueries, setBlockedHistoricalQueries] = useState<IBlockingTree[]>([]);
    const [blockingTree, setBlockingTree] = useState<IBlockingTree[]>([]);
    const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
    const [toDate, setToDate] = useState<string>(dateTimeNow);
    const [loadingHistoricalData, setLoadingHistoricalData] = useState<boolean>(false);
    const [blockedHistoricalDataSnapshotRunId, setBlockedHistoricalDataSnapshotRunId] = useState('');
    const [receivedAllHistoricalData, setReceivedAllHistoricalData] = useState<boolean>(false);
    const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
    const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
    const [pageSize, setPageSize] = useState(35);

    useEffect(() => {
        if (fromDate && toDate) {
            setDateChangedFlag(true);
            setBlockedHistoricalDataSnapshotRunId('');
            setBlockedHistoricalData([]);
            setReceivedAllHistoricalData(false);
            setNextPageToken({});
        }
    }, [fromDate, toDate])

    useEffect(() => {
        if (dateChangedFlag) {
            setDateChangedFlag(false);
            fetchHistoricalBlockedQueryData();
        }
    }, [dateChangedFlag])

    const handleOnHistoricalApiResponse = (r: HistoricalDataResult | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        }
        else {
            setBlockedHistoricalData(blockedHistoricalData.concat(r.result))
            if (!r.metadata || r.result.length < pageSize) { 
                setReceivedAllHistoricalData(true);
                setNextPageToken(r.metadata);
            } else {
                setNextPageToken(r.metadata)
            }
        }
        setLoadingHistoricalData(false)
    }

    const fetchHistoricalBlockedQueryData = () => {
        setLoadingHistoricalData(true)
        const metricId = 'performance_blockedQueries'
        const payload: IMetricHistoricalDataFilter = {
            "fromDate": fromDate,
            "toDate": toDate,
            "pageSize": pageSize
        }
        if (nextPageToken) {
            payload.nextPartitionKey = nextPageToken.nextPartitionKey
            payload.nextRowKey = nextPageToken.nextRowKey
        }
        SQLService.getMetricHistoricalData(metricId, props.databaseName, payload)
        .then((r) => {
            handleOnHistoricalApiResponse(r)
        })
    }

    const loadMoreTimestamps = () => {
        if (!receivedAllHistoricalData && !loadingHistoricalData) {
            setLoadingHistoricalData(true)
            fetchHistoricalBlockedQueryData();
        }
    }

    const handleToDateChange = (newToDate: string) => {
        if (newToDate && newToDate !== toDate) {
            setToDate(newToDate)
        }
    }

    const handleFromDateChange = (newFromDate: string) => {
        if (newFromDate && newFromDate !== fromDate) {
            setFromDate(newFromDate)
        }
    }

    const handleRunIdChange = (runId: string) => {
        setBlockedHistoricalDataSnapshotRunId(runId)
        if (runId && blockedHistoricalData && blockedHistoricalData.length > 0) {
            for (var blockedQuery of blockedHistoricalData) {
                if (blockedQuery.runId == runId) {
                    const output: IBlockingTreeMetricOutput = JSON.parse(blockedQuery.metricOutput)
                    const result: IBlockingTreeMetricResult = output.result
                    const queries: IBlockingTree[] = result.queryList
                    setBlockedHistoricalQueries(queries)
                    setBlockingTree(queries)
                    break
                }
            }
        }
    }

    return (
        <div>
            <HistoricalDataFilters 
            handleSelectChange={e => handleRunIdChange(e) } 
            handleFromDateChange={(e) => handleFromDateChange(e)}
            handleToDateChange={(e) => handleToDateChange(e)}
            fetchNext={() => loadMoreTimestamps()}
            hasMoreResults={!receivedAllHistoricalData}
            selectSelectedRunId={blockedHistoricalDataSnapshotRunId}
            isSelectLoading={loadingHistoricalData}
            selectMenuItems={blockedHistoricalData}
            threshold={0.8} />
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                {!errorMessage && blockedHistoricalQueries && blockedHistoricalQueries.length > 0 &&
                    <Paper style={{ width: "100%"}}>
                        <hr/>
                        <Fetcher
                            fetchData={() => SQLService.getDbBlockingQueries(props.databaseName)}
                            onFetch={(r) => { handleOnHistoricalApiResponse(r) }}
                        >
                            <div>
                                {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                                {!errorMessage && blockingTree && blockingTree.length > 0 &&
                                    blockingTree.map((tree, i) => {
                                        return <BlockingNodeView node={tree} exp={true} key={i}/>
                                    })
                                }
                            </div>
                            {blockingTree.length === 0 && <NoDataExists text="No Blocking Queries found"/>}
                        </Fetcher>
                    </Paper> 
                }
            </div>
            {blockedHistoricalQueries.length === 0 && <NoDataExists text="No Historical Data found"/>}
            </div>
    )

}

const BlockingNodeView: React.FunctionComponent<{node: IBlockingTree, exp?: boolean}> = ({node, exp}) => {
    const [expanded, setExpanded] = useState(exp || false);
    const hasChildren = node.blockingTree.length > 0;
    const sortedChildren = node.blockingTree;
    return (
        <FBox flex={1} flexDirection={"column"} mt={1}>
            <StackView
                nodeData={node}
                numChildren={node.blockingTree.length}
                isExpanded={expanded}
                onChangeExpanded={is => {
                    if (hasChildren) {
                        setExpanded(is)
                    }
                }}
            />
            {expanded && hasChildren && (
                <FBox flex={1} ml={2} flexDirection={"column"}>
                    {sortedChildren.map((c, idx) => (
                        <FBox flex={1} flexDirection={"row"} alignItems={"flex-start"} key={idx}>
                            <SubdirectoryArrowRight color={'disabled'} fontSize={"large"} style={{marginTop: 10}} />
                            <BlockingNodeView
                                key={`${c.sessionId}${idx}`}
                                node={c}
                            />
                        </FBox>
                    ))}
                </FBox>
            )}
        </FBox>
    )
};


const useStylesForStackView = makeStyles({
    stack: {
        cursor: 'pointer',
        background: "white",
        '&:hover': {
            background: "#EEE",
        }
    }
});
interface StackViewProps {
    nodeData: IBlockingTree;
    numChildren: number;
    isExpanded: boolean;
    onChangeExpanded: (isExpanded: boolean) => void;
}
const StackView: React.FunctionComponent<StackViewProps> = ({nodeData, isExpanded, onChangeExpanded, numChildren}) => {
    const classes = useStylesForStackView();
    const [details, setDetails] = useState(false);
    const {sessionId, status, blockingThese, elapsedTime, waitType, command } = nodeData;
    const hasChildren = numChildren > 0;
    const handleClick = () => {
        if (numChildren <= 0) {
            return;
        }
        onChangeExpanded(!isExpanded);
    };
    return (
        <FBox flex={1} flexDirection={"column"}>
            <FBox
                flexDirection={"row"}
                flex={1}
                px={2}
                alignItems={"center"}
                style={{border: '1px solid #ccc'}}
                className={hasChildren ? classes.stack : undefined}
            >
                <FBox flex={1} flexDirection={"row"} alignItems={"center"}>
                    <FBox flexDirection={"row"} flex={1} onClick={handleClick}>
                        <Tooltip title={"Session Id"}>
                            <Typography color={"primary"}>{sessionId}</Typography>
                        </Tooltip>
                        <Tooltip title={"Status"}>
                            <Typography color={"textSecondary"} style={{marginLeft: 8}}>{status}</Typography>
                        </Tooltip>
                        <Tooltip title={"Command"}>
                            <Typography color={"textPrimary"} style={{marginLeft: 8}}>{command}</Typography>
                        </Tooltip>
                        <Tooltip title={"Wait Type"}>
                            <Typography color={"textPrimary"} style={{marginLeft: 8, display: "flex", flex: 1}}>{waitType}</Typography>
                        </Tooltip>
                        <Tooltip title={"ElapsedTime"}>
                            <Typography color={"textPrimary"} style={{marginLeft: 8}}>{elapsedTime}</Typography>
                        </Tooltip>
                        <Tooltip title={`BlockingTheseSIds: ${blockingThese}`}>
                            <Typography color={"primary"} style={{marginLeft: 8}}>{numChildren > 0 ? `+${numChildren}` : 0}</Typography>
                        </Tooltip>
                    </FBox>
                    <IconButton onClick={() => setDetails(true)} style={{marginLeft: 4}}>
                        <Fullscreen />
                    </IconButton>
                    {hasChildren && 
                        <IconButton style={{marginLeft: 4}} onClick={() => onChangeExpanded(!isExpanded)}>
                            {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                        </IconButton>}
                    
                </FBox>
                <LinearProgress value={90} />
            </FBox>
            {details && <Details entity={nodeData} onClose={() => setDetails(false)} />}
        </FBox>
    );
};

const Details: React.FunctionComponent<{entity: IBlockingTree , onClose: () => void}> = ({entity, onClose}) => {
    const renderRow = (k: string, v: string, isJson?: boolean) => (
        <TableRow>
            <TableCell><b>{k}</b></TableCell>
            <TableCell>
                {isJson ? <pre>{v}</pre> : <Typography color={"textPrimary"}>{v}</Typography>}
            </TableCell>
        </TableRow>
    );
    const renderRowWithQuery = (k: string, v: string) => (
        <TableRow>
            <TableCell><b>{k}</b></TableCell>
            <TableCell>
                <StatementDialog statement={v}/>
            </TableCell>
        </TableRow>
    );
    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>
                Session Details
            </DialogTitle>
            <DialogContent dividers>
                <TableContainer component={Paper}>
                    <Table>
                        <TableBody>
                            {Object.keys(entity).map(k => {
                                if (entity.hasOwnProperty(k)) {
                                    // @ts-ignore
                                    const v = entity[k] as any;
                                    if(k=="batchText" ||  k=="inputBuffer" || k=="queryText"){
                                        return renderRowWithQuery(k, v)
                                    }
                                    else if (typeof v === 'string' || typeof v === 'number') {
                                        return renderRow(k, v.toString());
                                    }
                                    // return renderRow(k, JSON.stringify(v, null, 2), true);
                                }
                                return null;
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    )
};