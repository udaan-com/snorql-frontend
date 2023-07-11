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
  LinearProgress,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableBody,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  ICustomError,
  IBlockingTree,
  IBlockingTreeMetricResponse,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@mui/icons-material/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import { NoDataExists } from "../../../components/NoDataExists";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import ReplayIcon from "@mui/icons-material/Replay";
import { FBox } from "../../../../common/components/FBox";
import { Fullscreen, SubdirectoryArrowRight } from "@mui/icons-material";
import { StatementDialog } from "../../../components/StatementDialog";
import lengend from "./blockingQueryLegend.png";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@mui/icons-material/Settings";
import { BlockedQueriesHistoricalScreen } from "./BlockedQueriesHistoricalScreen";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import { reloadMetricEvent, showQueryEvent, expandMetricEvent, toggleToHistoricViewEvent, configureDataRecordingViewEvent } from '../../../tracking/TrackEventMethods';
import { useAdminEmail } from '../../../../hooks';
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";

interface BlockingQueriesProps {
  databaseName: string;
}

export const BlockingQueriesScreen: FunctionComponent<BlockingQueriesProps> = (
  props
) => {
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
        flexBasis: "33.33%",
        flexShrink: 0,
        textTransform: "uppercase",
      },
      summaryContent: {
        justifyContent: "space-between",
        display: "flex",
        flexGrow: 1,
        marginBottom: "-10px",
      },
    })
  );

  const classes = useStyles();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [blockingTree, setBlockingTree] = useState<IBlockingTree[]>([]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const [jobConfigureDialogOpen, setJobConfigureDialogOpen] =
    useState<boolean>(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefresh] = useState<boolean>(false);
  const email = useAdminEmail();

  useEffect(() => {
    // console.log("Auto Refresh: ", autoRefreshEnabled);
    if (autoRefreshEnabled) {
      // console.log("Auto Refresh is enabled !!!")
      const intervalId = setInterval(() => {
        handleReload()
      }, 1000 * 10)
      return () => clearInterval(intervalId)
    }
  }, [autoRefreshEnabled])

  const handleOnApiResponse = (r: IBlockingTreeMetricResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    }
    else {
      const result = r.metricOutput.result.queryList;
      setMetadata(r.metadata);
      setBlockingTree(result)
    }
  }
  const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.ACTIVE_QUERIES}_BLOCKING` }

  const handleReload = () => {
    SQLService.getDbBlockingQueries(props.databaseName)
      .then((r) => {
        handleOnApiResponse(r)
        setExpanded(true);
        metadata && reloadMetricEvent(basicPropsForMixPanel)
      })
  }

  const showAlertDialog = () => {
    setAlertDialogOpen(true);
  };

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

  const closeAlertDialog = () => {
    setAlertDialogOpen(false);
  };

  const handleAutoRefreshViewToggle = () => {
    setAutoRefresh(!autoRefreshEnabled)
  };

  return (
    <Accordion expanded={expanded} >
      <AccordionSummary
       expandIcon={<ExpandMoreIcon onClick={handleChange} />} 
      >

        <div className={classes.summaryContent}>
          <MetricHeader title="Blocking Queries" metadata={metadata} />
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
                    control={<Switch color="primary" />}
                    label="View Historical Data"
                    labelPlacement="bottom"
                  />
                </FormGroup>
              </FormControl>}
            {/* <Switch  value="historicalScreenFlag" inputProps={{ 'title': 'Historical Data' }} /> */}
            {metadata && metadata.supportsAlert && (
              <Tooltip title="Add Alert">
                <IconButton onClick={() => showAlertDialog()} size="large">
                  <AddAlertIcon />
                </IconButton>
              </Tooltip>
            )}
            {metadata && metadata.supportsHistorical &&
              <Tooltip title="Configure Data Recording">
                <IconButton onClick={handleJobConfigureDialogOpen} size="large">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>}
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
      <AccordionDetails >
        <SingleTriggerDialog
          open={jobConfigureDialogOpen}
          handleClose={() => setJobConfigureDialogOpen(false)}
          databaseName={props.databaseName}
          metricId={"performance_blockedQueries"}
          metricName={"Blocking Queries Metric"}
          minimumRepeatInterval={metadata?.minimumRepeatInterval} />
        {metadata?.supportsAlert && (
          <SqlAlertDialog
            open={alertDialogOpen}
            handleClose={() => closeAlertDialog()}
            databaseName={props.databaseName}
            supportedAlertTypes={metadata?.supportedAlerts}
          />
        )}
        {!historicalScreenFlag &&
          <Paper style={{ width: "100%" }}>
            <div className="row">
              <details style={{ padding: '20px' }}>
                <summary>Example:</summary>
                <div className="logo">
                  <img src={lengend} width="100%" height="auto" />
                </div>
              </details>
            </div>
            <hr />
            <Fetcher
              fetchData={() => SQLService.getDbBlockingQueries(props.databaseName)}
              onFetch={(r) => { handleOnApiResponse(r) }}
            >
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
                {!showQuery && errorMessage && <ErrorMessageCard text={errorMessage} />}
                {!showQuery && !errorMessage && blockingTree && blockingTree.length > 0 &&
                  blockingTree.map((tree, i) => {
                    return <BlockingNodeView node={tree} exp={true} key={i} />
                  })
                }
              </div>
              {!showQuery && blockingTree.length === 0 && <NoDataExists text="No Blocking Queries found" />}
            </Fetcher>
          </Paper>}
        {historicalScreenFlag &&
          <Paper style={{ maxWidth: 1400, width: "-webkit-fill-available" }}>
            <div style={{ marginLeft: '5px', padding: '10px' }}>
              <BlockedQueriesHistoricalScreen databaseName={props.databaseName}></BlockedQueriesHistoricalScreen>
            </div>
          </Paper>
        }
      </AccordionDetails>
    </Accordion>
  );
};

const BlockingNodeView: React.FunctionComponent<{
  node: IBlockingTree;
  exp?: boolean;
}> = ({ node, exp }) => {
  const [expanded, setExpanded] = useState(exp || false);
  const hasChildren = node.blockingTree.length > 0;
  const sortedChildren = node.blockingTree;
  return (
    <FBox flex={1} flexDirection={"column"} mt={1}>
      <StackView
        nodeData={node}
        numChildren={node.blockingTree.length}
        isExpanded={expanded}
        onChangeExpanded={(is) => {
          if (hasChildren) {
            setExpanded(is);
          }
        }}
      />
      {expanded && hasChildren && (
        <FBox flex={1} ml={2} flexDirection={"column"}>
          {sortedChildren.map((c, idx) => (
            <FBox
              flex={1}
              flexDirection={"row"}
              alignItems={"flex-start"}
              key={idx}
            >
              <SubdirectoryArrowRight
                color={"disabled"}
                fontSize={"large"}
                style={{ marginTop: 10 }}
              />
              <BlockingNodeView key={`${c.sessionId}${idx}`} node={c} />
            </FBox>
          ))}
        </FBox>
      )}
    </FBox>
  );
};

const useStylesForStackView = makeStyles({
  stack: {
    cursor: "pointer",
    background: "white",
    "&:hover": {
      background: "#EEE",
    },
  },
});
interface StackViewProps {
  nodeData: IBlockingTree;
  numChildren: number;
  isExpanded: boolean;
  onChangeExpanded: (isExpanded: boolean) => void;
}
const StackView: React.FunctionComponent<StackViewProps> = ({
  nodeData,
  isExpanded,
  onChangeExpanded,
  numChildren,
}) => {
  const classes = useStylesForStackView();
  const [details, setDetails] = useState(false);
  const { sessionId, status, blockingThese, elapsedTime, waitType, command } =
    nodeData;
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
        style={{ border: "1px solid #ccc" }}
        className={hasChildren ? classes.stack : undefined}
      >
        <FBox flex={1} flexDirection={"row"} alignItems={"center"}>
          <FBox flexDirection={"row"} flex={1} onClick={handleClick}>
            <Tooltip title={"Session Id"}>
              <Typography color={"primary"}>{sessionId}</Typography>
            </Tooltip>
            <Tooltip title={"Status"}>
              <Typography color={"textSecondary"} style={{ marginLeft: 8 }}>
                {status}
              </Typography>
            </Tooltip>
            <Tooltip title={"Command"}>
              <Typography color={"textPrimary"} style={{ marginLeft: 8 }}>
                {command}
              </Typography>
            </Tooltip>
            <Tooltip title={"Wait Type"}>
              <Typography
                color={"textPrimary"}
                style={{ marginLeft: 8, display: "flex", flex: 1 }}
              >
                {waitType}
              </Typography>
            </Tooltip>
            <Tooltip title={"ElapsedTime"}>
              <Typography color={"textPrimary"} style={{ marginLeft: 8 }}>
                {elapsedTime}
              </Typography>
            </Tooltip>
            <Tooltip title={`BlockingTheseSIds: ${blockingThese}`}>
              <Typography color={"primary"} style={{ marginLeft: 8 }}>
                {numChildren > 0 ? `+${numChildren}` : 0}
              </Typography>
            </Tooltip>
          </FBox>
          <IconButton onClick={() => setDetails(true)} style={{ marginLeft: 4 }} size="large">
            <Fullscreen />
          </IconButton>
          {hasChildren && (
            <IconButton
              style={{ marginLeft: 4 }}
              onClick={() => onChangeExpanded(!isExpanded)}
              size="large">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </FBox>
        <LinearProgress value={90} />
      </FBox>
      {details && (
        <Details entity={nodeData} onClose={() => setDetails(false)} />
      )}
    </FBox>
  );
};

const Details: React.FunctionComponent<{
  entity: IBlockingTree;
  onClose: () => void;
}> = ({ entity, onClose }) => {
  const renderRow = (k: string, v: string, isJson?: boolean) => (
    <TableRow>
      <TableCell>
        <b>{k}</b>
      </TableCell>
      <TableCell>
        {isJson ? (
          <pre>{v}</pre>
        ) : (
          <Typography color={"textPrimary"}>{v}</Typography>
        )}
      </TableCell>
    </TableRow>
  );
  const renderRowWithQuery = (k: string, v: string) => (
    <TableRow>
      <TableCell>
        <b>{k}</b>
      </TableCell>
      <TableCell>
        <StatementDialog statement={v} />
      </TableCell>
    </TableRow>
  );
  return (
    <Dialog onClose={onClose} open={true}>
      <DialogTitle>Session Details</DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {Object.keys(entity).map((k) => {
                if (entity.hasOwnProperty(k)) {
                  // @ts-ignore
                  const v = entity[k] as any;
                  if (
                    k == "batchText" ||
                    k == "inputBuffer" ||
                    k == "queryText"
                  ) {
                    return renderRowWithQuery(k, v);
                  } else if (typeof v === "string" || typeof v === "number") {
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
  );
};
