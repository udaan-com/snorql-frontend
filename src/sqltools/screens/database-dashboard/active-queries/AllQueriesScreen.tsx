import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Paper,
  Theme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  FormControlLabel,
  FormControl,
  FormGroup,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  IMetricHistoricalDataSchema,
  ActiveQuery,
  IActiveQueryMetricOutput,
  IActiveQueryMetricResponse,
  IActiveQueryMetricResult,
  ICustomError,
  IMetricHistoricalDataFilter,
  IMetricMetadata,
  HistoricalDataResult,
  NextPageToken,
  DatabaseType,
} from "../../../models";
import { getColumns } from "./allQueryColumns";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@mui/icons-material/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import { NoDataExists } from "../../../components/NoDataExists";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import Switch from "@mui/material/Switch";
import ReplayIcon from "@mui/icons-material/Replay";
import SettingsIcon from "@mui/icons-material/Settings";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import MUIDataTable, {
  MUIDataTableOptions,
  MUIDataTableColumn,
} from "mui-datatables";
import { MetricHeader } from "../../../components/MetricHeader";
import { HistoricalDataFilters } from "../../../components/HistoricalDataFilters";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import {
  showQueryEvent,
  reloadMetricEvent,
  expandMetricEvent,
  configureDataRecordingViewEvent,
  toggleToHistoricViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import { Alert } from '@mui/material';

interface AllQueriesProps {
  databaseName: string;
  databaseType: DatabaseType;
  baseurl: string;
}

export const AllQueriesScreen: FunctionComponent<AllQueriesProps> = (props) => {
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
      menuPaper: {
        maxHeight: 300,
      },
    })
  );

  const classes = useStyles();

  var today = new Date();
  const temp_today = new Date();
  var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
  today.setHours(today.getHours() + 5);
  today.setMinutes(today.getMinutes() + 30);
  weekAgoDate.setHours(weekAgoDate.getHours() + 5);
  weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
  const dateTimeNow = today.toISOString().slice(0, 16);
  const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allQueries, setAllQueries] = useState<ActiveQuery[]>([]);
  const [activeHistoricalQueries, setActiveHistoricalQueries] = useState<
    ActiveQuery[]
  >([]);
  const [cols, setCols] = useState<any>([]);
  const [resetCols, setResetCols] = useState<any>([]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [jobConfigureModalOpen, setJobConfigureModalOpen] = useState(false);
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>(dateTimeWeekAgo);
  const [toDate, setToDate] = useState<string>(dateTimeNow);
  const [allHistoricalData, setAllHistoricalData] = useState<
    IMetricHistoricalDataSchema[]
  >([]);
  const [
    activeHistoricalDataSnapshotRunId,
    setActiveHistoricalDataSnapshotRunId,
  ] = useState("");
  const [receivedAllHistoricalData, setReceivedAllHistoricalData] =
    useState<boolean>(false);
  const [loadingHistoricalData, setLoadingHistoricalData] =
    useState<boolean>(false);
  const [dateChangedFlag, setDateChangedFlag] = useState<boolean>(true);
  const [nextPageToken, setNextPageToken] = useState<NextPageToken>();
  const [autoRefreshEnabled, setAutoRefresh] = useState<boolean>(false);
  let showModal = { showJobConfigureModal: false };
  const email = useAdminEmail();
  const pageSize = 35;

  useEffect(() => {
    // console.log("Auto Refresh: ", autoRefreshEnabled);
    if (autoRefreshEnabled) {
      // console.log("Auto Refresh is enabled !!!")
      const intervalId = setInterval(() => {
        handleReload();
      }, 1000 * 10);
      return () => clearInterval(intervalId);
    }
  }, [autoRefreshEnabled]);

  useEffect(() => {
    if (fromDate && toDate) {
      setDateChangedFlag(true);
      setActiveHistoricalDataSnapshotRunId("");
      setAllHistoricalData([]);
      setReceivedAllHistoricalData(false);
      setNextPageToken({});
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (dateChangedFlag) {
      setDateChangedFlag(false);
      fetchHistoricalActiveQueryData();
    }
  }, [dateChangedFlag]);

  const handleOnApiResponse = (
    r: IActiveQueryMetricResponse | ICustomError
  ) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      const result = r.metricOutput.result.queryList;
      setMetadata(r.metadata);
      setAllQueries(result);
      const columns = getColumns(
        props.databaseName,
        props.baseurl,
        props.databaseType
      );
      if (resetCols.length > 0) {
        setCols(resetCols);
      } else {
        setCols(columns);
      }
    }
  };
  const handleOnHistoricalApiResponse = (
    r: HistoricalDataResult | ICustomError
  ) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      setAllHistoricalData(allHistoricalData.concat(r.result));
      if (!r.metadata || r.result.length < pageSize) {
        setReceivedAllHistoricalData(true);
        setNextPageToken(r.metadata);
      } else {
        setNextPageToken(r.metadata);
      }
      const columns = getColumns(
        props.databaseName,
        props.baseurl,
        props.databaseType
      );
      if (resetCols.length > 0) {
        setCols(resetCols);
      } else {
        setCols(columns);
      }
    }
    setLoadingHistoricalData(false);
  };
  const showJobConfigureDialog = () => {
    setJobConfigureModalOpen(true);
    metadata && configureDataRecordingViewEvent(basicPropsForMixPanel);
  };

  const showAlertDialog = () => {
    setAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setAlertDialogOpen(false);
  };

  const closeJobConfigureDialog = () => {
    setJobConfigureModalOpen(false);
    console.log("called cancel");
  };
  const handleReload = () => {
    SQLService.getDbActiveQueries(props.databaseName, props.databaseType).then(
      (r) => {
        handleOnApiResponse(r);
        setExpanded(true);
        metadata && reloadMetricEvent(basicPropsForMixPanel);
      }
    );
  };

  const handleChange = () => {
    setExpanded((prev) => !prev);
    metadata && expandMetricEvent(basicPropsForMixPanel);
  };
  const resetColumns = (column: string, action: string): any => {
    const prevColumns: MUIDataTableColumn[] = cols;
    prevColumns.map((col) => {
      if (col.name == column && action == "add" && col.options) {
        col.options.display = true;
      }
      if (col.name == column && action == "remove" && col.options) {
        col.options.display = false;
      }
    });
    return prevColumns;
  };
  const fetchHistoricalActiveQueryData = () => {
    setLoadingHistoricalData(true);
    const metricId = "performance_activeQueries";
    let payload: IMetricHistoricalDataFilter = {
      fromDate: fromDate,
      toDate: toDate,
      pageSize: pageSize,
    };
    if (nextPageToken) {
      payload.nextPartitionKey = nextPageToken.nextPartitionKey;
      payload.nextRowKey = nextPageToken.nextRowKey;
    }
    if (!loadingHistoricalData) {
      SQLService.getMetricHistoricalData(
        metricId,
        props.databaseName,
        payload
      ).then((r) => {
        handleOnHistoricalApiResponse(r);
      });
    }
  };
  const handleRunIdChange = (runId: string) => {
    setActiveHistoricalDataSnapshotRunId(runId);
    if (runId && allHistoricalData && allHistoricalData.length > 0) {
      for (var activeQueries of allHistoricalData) {
        if (activeQueries.runId == runId) {
          const output: IActiveQueryMetricOutput = JSON.parse(
            activeQueries.metricOutput
          );
          const result: IActiveQueryMetricResult = output.result; // JSON.parse(output.result)
          const queries: ActiveQuery[] = result.queryList;
          setActiveHistoricalQueries(queries);
          break;
        }
      }
    }
  };

  function loadMoreTimestamps() {
    if (!receivedAllHistoricalData && !loadingHistoricalData) {
      setLoadingHistoricalData(true);
      fetchHistoricalActiveQueryData();
    }
  }

  const handleToDateChange = (newToDate: string) => {
    if (newToDate && newToDate !== toDate) {
      setToDate(newToDate);
    }
  };

  const handleFromDateChange = (newFromDate: string) => {
    if (newFromDate && newFromDate !== fromDate) {
      setFromDate(newFromDate);
    }
  };
  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.PERFORMANCE,
    metricText: `${MenuText.ACTIVE_QUERIES}_ALL_QUERIES`,
  };
  const handleShowQuery = () => {
    setShowQuery(!showQuery);
    metadata &&
      showQueryEvent({
        ...basicPropsForMixPanel,
        query: metadata.underlyingQueries[0],
      });
  };
  const handleClickHistoricalViewToggle = () => {
    setHistoricalScreenFlag(!historicalScreenFlag);
    toggleToHistoricViewEvent(basicPropsForMixPanel);
  };

  const handleAutoRefreshViewToggle = () => {
    setAutoRefresh(!autoRefreshEnabled);
  };

  const handleJobConfigureDialogOpen = () => {
    showJobConfigureDialog();
    configureDataRecordingViewEvent(basicPropsForMixPanel);
  };

  const options: MUIDataTableOptions = {
    filterType: "multiselect",
    selectableRows: "none",
    print: false,
    download: true,
    setTableProps: () => {
      return { size: "small" };
    },
    onViewColumnsChange: (column, action) => {
      const newColumns = resetColumns(column, action);
      setResetCols(newColumns);
    },
  };
  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={handleChange}
      >
        <div className={classes.summaryContent}>
          <MetricHeader title="All Queries" metadata={metadata} />
          <div style={{ float: "right" }}>
            <FormControl component="fieldset">
              <FormGroup aria-label="auto-refresh" row>
                <FormControlLabel
                  onChange={handleAutoRefreshViewToggle}
                  control={<Switch color="secondary" />}
                  label="Auto Refresh"
                  labelPlacement="bottom"
                />
              </FormGroup>
            </FormControl>
            {metadata && metadata.supportsHistorical && (
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
            )}
            {metadata &&
              metadata.supportsAlert &&
              props.databaseType == DatabaseType.SQLSERVER && (
                <Tooltip title="Add Alert">
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
            {!historicalScreenFlag && (
              <Tooltip title="Reload">
                <IconButton onClick={() => handleReload()} size="large">
                  <ReplayIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      </AccordionSummary>

      {props.databaseType == DatabaseType.SQLSERVER && (
        <Alert severity="info">
          Please check out COMPUTE UTILIZATION for history of executed
          queries(from QUERY STORE) on this db
        </Alert>
      )}
      <AccordionDetails>
        <Paper style={{ width: "100%" }}>
          <SingleTriggerDialog
            open={jobConfigureModalOpen}
            handleClose={closeJobConfigureDialog}
            databaseName={props.databaseName}
            metricId={"performance_activeQueries"}
            metricName={"Active Queries Metric"}
            minimumRepeatInterval={metadata?.minimumRepeatInterval}
          />
          {metadata?.supportsAlert && (
            <SqlAlertDialog
              open={alertDialogOpen}
              handleClose={() => closeAlertDialog()}
              databaseName={props.databaseName}
              supportedAlertTypes={metadata?.supportedAlerts}
            />
          )}
          {!historicalScreenFlag && (
            <Fetcher
              fetchData={() =>
                SQLService.getDbActiveQueries(
                  props.databaseName,
                  props.databaseType
                )
              }
              onFetch={(r) => {
                handleOnApiResponse(r);
              }}
            >
              <div style={{ float: "right", padding: "10px" }}>
                {showQuery && metadata && metadata.underlyingQueries && (
                  <CopyToClipboard text={metadata.underlyingQueries[0]} />
                )}
                <Tooltip
                  title={showQuery ? "Hide the source" : "Show the source"}
                >
                  <IconButton onClick={handleShowQuery} size="large">
                    <CodeIcon />
                  </IconButton>
                </Tooltip>
              </div>
              {showQuery && metadata && metadata.underlyingQueries && (
                <ShowQueryScreen query={metadata.underlyingQueries[0]} />
              )}
              <div>
                {!showQuery && errorMessage && (
                  <ErrorMessageCard text={errorMessage} />
                )}
                {!showQuery &&
                  !errorMessage &&
                  allQueries &&
                  allQueries.length > 0 && (
                    <AllQueriesTable
                      rows={allQueries}
                      columns={cols}
                      options={options}
                    />
                  )}
              </div>
              {!showQuery && allQueries.length === 0 && (
                <NoDataExists text="No Active Queries found" />
              )}
            </Fetcher>
          )}
          {historicalScreenFlag && (
            <>
              <HistoricalDataFilters
                handleSelectChange={(e) => handleRunIdChange(e)}
                handleFromDateChange={(e) => handleFromDateChange(e)}
                handleToDateChange={(e) => handleToDateChange(e)}
                fetchNext={() => loadMoreTimestamps()}
                hasMoreResults={!receivedAllHistoricalData}
                selectSelectedRunId={activeHistoricalDataSnapshotRunId}
                isSelectLoading={loadingHistoricalData}
                selectMenuItems={allHistoricalData}
                threshold={0.7}
              />
              <div style={{ marginLeft: "15px", padding: "10px" }}>
                {errorMessage && <ErrorMessageCard text={errorMessage} />}
                {!errorMessage &&
                  activeHistoricalQueries &&
                  activeHistoricalQueries.length > 0 && (
                    <AllQueriesTable
                      rows={activeHistoricalQueries}
                      columns={cols}
                      options={options}
                    />
                  )}
              </div>
              {activeHistoricalQueries.length === 0 && (
                <NoDataExists text="No Historical Data found" />
              )}
            </>
          )}
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

interface AllQueriesTableProps {
  rows: ActiveQuery[];
  columns: [];
  options: MUIDataTableOptions;
}

export const AllQueriesTable: FunctionComponent<AllQueriesTableProps> = (
  props
) => {
  const { rows, columns, options } = props;
  return (
    <MUIDataTable title="" data={rows} columns={columns} options={options} />
  );
};
