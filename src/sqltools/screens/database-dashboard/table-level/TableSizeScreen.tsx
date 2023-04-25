import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tooltip,
  IconButton,
  TableRow,
  TableCell,
  Table,
  TableBody,
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  ICustomError,
  TableSizeResponse,
  ITableSizeResponse,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@material-ui/icons/Replay";
import { useStyles } from "../../../components/StyleClass";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@material-ui/icons/Settings";
import { HistoricalTableSizeScreen } from "./HistoricalTableSizeScreen";
import { TableJobRecordingConfigDialog } from "./TableJobRecordingConfigDialog";
import {
  reloadMetricEvent,
  showQueryEvent,
  expandMetricEvent,
  toggleToHistoricViewEvent,
  configureDataRecordingViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import {Helpers} from "../../../helpers";

interface TableSizeScreenProps {
  databaseName: string;
  tableName: string;
}

export const TableSizeScreen: FunctionComponent<TableSizeScreenProps> = (
  props
) => {
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [TableSize, setTableSize] = useState<TableSizeResponse[]>([]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [tableName, setTableName] = useState<string>(props.tableName);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const [jobConfigureDialogOpen, setJobConfigureDialogOpen] =
    useState<boolean>(false);
  const email = useAdminEmail();

  const handleOnApiResponse = (r: ITableSizeResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      if (r) {
        const result = r.metricOutput?.result?.queryList;
        if (result) {
          setMetadata(r.metadata);
          let results = Helpers.changeSize(result);
          setTableSize(results);
        }
      }
    }
  };
  useEffect(() => {
    setTableName(props.tableName);
    handleReload();
  }, [props.tableName]);

  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.STORAGE,
    metricText: `${MenuText.TABLE_LEVEL}_SIZE`,
  };

  const handleReload = () => {
    if (props.tableName != "") {
      SQLService.getTableSize(props.databaseName, props.tableName)
        .then((r) => {
          handleOnApiResponse(r);
          setErrorMessage("");
          setExpanded(true);
          metadata && reloadMetricEvent(basicPropsForMixPanel);
        })
        .catch((e) => {
          setErrorMessage(e);
          setExpanded(true);
        });
    }
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

  const handleClickHistoricalViewToggle = () => {
    setHistoricalScreenFlag(!historicalScreenFlag);
    toggleToHistoricViewEvent(basicPropsForMixPanel);
  };

  const handleJobConfigureDialogOpen = () => {
    setJobConfigureDialogOpen(true);
    configureDataRecordingViewEvent(basicPropsForMixPanel);
  };
  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        IconButtonProps={{
          onClick: handleChange,
        }}
      >
        <div className={classes.summaryContent}>
          <MetricHeader title="Table Size" metadata={metadata} />
        </div>
        <div style={{ float: "right" }}>
          {/* {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />} */}
          {!showQuery && (
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
          {!showQuery && (
            <Tooltip title="Configure Data Recording">
              <IconButton onClick={handleJobConfigureDialogOpen}>
                <SettingsIcon fontSize="default" />
              </IconButton>
            </Tooltip>
          )}
          {!showQuery && !historicalScreenFlag && (
            <Tooltip title="Reload">
              <IconButton onClick={() => handleReload()}>
                <ReplayIcon fontSize="default" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Paper style={{ width: "100%" }}>
          {errorMessage && (
            <div
              style={{
                marginLeft: "5px",
                padding: "10px",
                color: "red",
                fontFamily: "monospace",
              }}
            >
              <details open>
                <summary>Error</summary>
                <p>{errorMessage}</p>
              </details>
            </div>
          )}

          <TableJobRecordingConfigDialog
            open={jobConfigureDialogOpen}
            handleClose={() => setJobConfigureDialogOpen(false)}
            databaseName={props.databaseName}
            metricId={"storage_table"}
            metricName={"Table Size Metric"}
            tableName={props.tableName}
            minimumRepeatInterval={metadata?.minimumRepeatInterval}
          />
          {historicalScreenFlag && (
            <HistoricalTableSizeScreen databaseName={props.databaseName} />
          )}
          <div style={{ float: "right", padding: "10px" }}>
            {showQuery && metadata && metadata.underlyingQueries && (
              <CopyToClipboard text={metadata.underlyingQueries[0]} />
            )}
            <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
              <IconButton aria-label="delete" onClick={() => handleShowQuery()}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
          </div>
          {!historicalScreenFlag && (
            <Fetcher
              fetchData={() =>
                SQLService.getTableSize(props.databaseName, tableName)
              }
              onFetch={(r) => handleOnApiResponse(r)}
            >
              {showQuery && metadata && metadata.underlyingQueries && (
                <ShowQueryScreen query={metadata.underlyingQueries[0]} />
              )}

              {!showQuery && (
                <Box
                  paddingTop={8}
                  paddingRight={8}
                  paddingBottom={4}
                  paddingLeft={4}
                >
                  <div style={{ height: 650, width: "100%" }}>
                    {!errorMessage && TableSize.length ? (
                      <Table>
                        <TableBody>
                          {Object.entries(TableSize[0]).map((x, y) => {
                            return (
                              <TableRow key={y}>
                                <TableCell>
                                  {x[0]
                                    .split(/(?=[A-Z])/)
                                    .join(" ")
                                    .toUpperCase()}
                                </TableCell>
                                <TableCell>{x[1]}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography>No records found</Typography>
                    )}
                  </div>
                </Box>
              )}
            </Fetcher>
          )}
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};
