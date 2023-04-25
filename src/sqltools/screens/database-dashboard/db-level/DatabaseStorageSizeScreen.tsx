import React, { FunctionComponent, useState } from "react";
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
} from "@material-ui/core";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  ICustomError,
  IDatabseStorageSizeResponse,
  DatabseStorageSizeResponse,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@material-ui/icons/Replay";
import AddAlertIcon from "@material-ui/icons/AddAlert";
import { useStyles } from "../../../components/StyleClass";
import Chart from "react-google-charts";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@material-ui/icons/Settings";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import {
  reloadMetricEvent,
  showQueryEvent,
  expandMetricEvent,
  configureDataRecordingViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import {Helpers} from "../../../helpers";

interface DatabaseStorageSizeScreenProps {
  databaseName: string;
}

export const DatabaseStorageSizeScreen: FunctionComponent<
  DatabaseStorageSizeScreenProps
> = (props) => {
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dbStorageSize, setDbStorageSize] = useState<
    DatabseStorageSizeResponse[]
  >([]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [jobConfigureDialogOpen, setJobConfigureDialogOpen] =
    useState<boolean>(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
  const email = useAdminEmail();

  const handleOnApiResponse = (
    r: IDatabseStorageSizeResponse | ICustomError
  ) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      const result = r.metricOutput.result.queryList;
      setMetadata(r.metadata);
      let results = Helpers.changeSize(result);
      setDbStorageSize(results);
    }
  };

  const closeAlertDialog = () => {
    setAlertDialogOpen(false);
  };

  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.STORAGE,
    metricText: `${MenuText.DATABASE_LEVEL}_STORAGE_SIZE`,
  };
  const handleReload = () => {
    SQLService.getDatabaseStorageSize(props.databaseName)
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
        expandIcon={<ExpandMoreIcon />}
        IconButtonProps={{
          onClick: handleChange,
        }}
      >
        <div className={classes.summaryContent}>
          <MetricHeader title="Database Storage Size" metadata={metadata} />
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
            {showQuery && metadata && metadata.underlyingQueries && (
              <CopyToClipboard text={metadata.underlyingQueries[0]} />
            )}
            {metadata && metadata.supportsAlert && (
              <Tooltip title="Manage Alerts">
                <IconButton onClick={() => showAlertDialog()}>
                  <AddAlertIcon fontSize="default" />
                </IconButton>
              </Tooltip>
            )}
            {metadata && metadata.supportsHistorical && (
              <Tooltip title="Configure Data Recording">
                <IconButton onClick={handleJobConfigureDialogOpen}>
                  <SettingsIcon fontSize="default" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
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

          <Fetcher
            fetchData={() =>
              SQLService.getDatabaseStorageSize(props.databaseName)
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
                <div style={{ height: 700, width: "100%" }}>
                  {dbStorageSize.length && (
                    <Chart
                      width={"1500px"}
                      height={"300px"}
                      chartType="PieChart"
                      loader={<div>Loading Chart</div>}
                      data={[
                        ["Name", "Size in GB"],
                        [
                          "Data " + dbStorageSize[0].data,
                          parseFloat(dbStorageSize[0].data),
                        ],
                        [
                          "Index " + dbStorageSize[0].indexSize,
                          parseFloat(dbStorageSize[0].indexSize),
                        ],
                        [
                          "Unused " + dbStorageSize[0].unused,
                          parseFloat(dbStorageSize[0].unused),
                        ],
                        [
                          "Total " + dbStorageSize[0].dbTotalSize.toString(),
                          dbStorageSize[0].dbTotalSize,
                        ],
                      ]}
                      options={{
                        title: "Database Storage Space Breakup ",

                        pieSliceText: "label",
                      }}
                      rootProps={{ "data-testid": "1" }}
                    />
                  )}

                  {!errorMessage && dbStorageSize.length ? (
                    <Table>
                      <TableBody>
                        {Object.entries(dbStorageSize[0]).map((x, y) => {
                          return (
                            <TableRow>
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
        </Paper>
      </AccordionDetails>
      <SingleTriggerDialog
        open={jobConfigureDialogOpen}
        handleClose={() => setJobConfigureDialogOpen(false)}
        databaseName={props.databaseName}
        metricId={"storage_db"}
        metricName={"Database Storage Size"}
        minimumRepeatInterval={metadata?.minimumRepeatInterval}
      />
    </Accordion>
  );
};
