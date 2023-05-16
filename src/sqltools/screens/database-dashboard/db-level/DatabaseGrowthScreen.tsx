import React, { FunctionComponent, useState } from "react";
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tooltip,
  IconButton,
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  ICustomError,
  IDatabaseGrowthResponse,
  DatabaseGrowthResponse,
  DailyDatabaseGrowth,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@mui/icons-material/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@mui/icons-material/Replay";
import { useStyles } from "../../../components/StyleClass";
import Chart from "react-google-charts";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  reloadMetricEvent,
  showQueryEvent,
  expandMetricEvent,
  toggleToHistoricViewEvent,
  configureDataRecordingViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import { HistoricalDatabaseGrowthScreen } from "./HistoricalDatabaseGrowthScreen";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { Helpers } from "../../../helpers";

interface DatabaseGrowthScreenProps {
  databaseName: string;
}

export const DatabaseGrowthScreen: FunctionComponent<
  DatabaseGrowthScreenProps
> = (props) => {
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dbGrowth, setDbGrowth] = useState<DatabaseGrowthResponse[]>([]);
  const [dailyGrowth, setDailyGrowth] = useState<DailyDatabaseGrowth[][]>([]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const email = useAdminEmail();
  const [jobConfigureDialogOpen, setJobConfigureDialogOpen] =
    useState<boolean>(false);

  const handleOnApiResponse = (r: IDatabaseGrowthResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      const results_ = r.metricOutput.result.queryList;
      let results = results_.map((x) => {
        return { ...x, storageInMegabytes: x["storageInMegabytes"] + " MB" };
      });

      // convert to GB
      let result = Helpers.changeSize(results);
      setMetadata(r.metadata);
      setDbGrowth(formatToAddId(result));

      const groups = result.reduce(
        (groups: any, value: DatabaseGrowthResponse) => {
          const date = value.startTime.split(" ")[0];
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(value);
          return groups;
        },
        {}
      );

      const diff = (qq: any) =>
        qq.slice(1).map((v: number, i: number) => {
          return qq[i] - v;
        });
      let perDayStorageValue = Object.keys(groups).map((x) => {
        return parseFloat(groups[x][0]["storageInMegabytes"]).toFixed(1);
      });
      let difference: Array<number> = diff(perDayStorageValue);
      difference.push(0);
      const groupArrays = Object.keys(groups).map((date, i): any[] => {
        return [new Date(date), parseFloat(perDayStorageValue[i])];
      });
      setDailyGrowth(groupArrays);
    }
  };

  const formatToAddId = (response: any[]): DatabaseGrowthResponse[] => {
    response.map((eachItem, index) => {
      eachItem["id"] = index + 1;
    });
    return response;
  };
  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.STORAGE,
    metricText: `${MenuText.DATABASE_LEVEL}_GROWTH`,
  };
  const handleReload = () => {
    SQLService.getDatabaseGrowth(props.databaseName).then((r) => {
      handleOnApiResponse(r);
      setExpanded(true);
      metadata && reloadMetricEvent(basicPropsForMixPanel);
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
  const handleClickHistoricalViewToggle = () => {
    setHistoricalScreenFlag(!historicalScreenFlag);
    toggleToHistoricViewEvent(basicPropsForMixPanel);
  };
  const handleJobConfigureDialogOpen = () => {
    setJobConfigureDialogOpen(true);
    configureDataRecordingViewEvent(basicPropsForMixPanel);
  };

  return <>
    <Accordion expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={handleChange}
      >
        <div className={classes.summaryContent}>
          <MetricHeader title="Database Growth Rate" metadata={metadata} />
          {metadata && metadata.supportsHistorical && (
            <div style={{ float: "right" }}>
              <FormControl component="fieldset">
                <FormGroup aria-label="historicalEnabled" row>
                  <FormControlLabel
                    onChange={handleClickHistoricalViewToggle}
                    control={<Switch color="primary" />}
                    label="View Older Data"
                    labelPlacement="bottom"
                  />
                </FormGroup>
              </FormControl>
              <Tooltip title="Configure Data Recording">
                <IconButton onClick={handleJobConfigureDialogOpen} size="large">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              {/* <Switch  value="historicalScreenFlag" inputProps={{ 'title': 'Historical Data' }} /> */}
            </div>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Paper style={{ width: "100%" }}>
          {!historicalScreenFlag && (
            <div style={{ float: "right" }}>
              <Tooltip title="Reload">
                <IconButton onClick={handleReload} size="large">
                  <ReplayIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}
          <div style={{ float: "right" }}>
            <Tooltip
              title={showQuery ? "Hide the source" : "Show the source"}
            >
              <IconButton onClick={() => handleShowQuery()} size="large">
                <CodeIcon />
              </IconButton>
            </Tooltip>
          </div>

          <div style={{ float: "right" }}></div>

          {errorMessage && !historicalScreenFlag && (
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
            fetchData={() => SQLService.getDatabaseGrowth(props.databaseName)}
            onFetch={(r) => handleOnApiResponse(r)}
          >
            <>
              {showQuery && metadata && metadata.underlyingQueries && (
                <ShowQueryScreen query={metadata.underlyingQueries[0]} />
              )}

              {!showQuery && !historicalScreenFlag && (
                <Box
                  paddingTop={8}
                  paddingRight={8}
                  paddingBottom={4}
                  paddingLeft={4}
                >
                  <div>
                    {!errorMessage && dbGrowth.length ? (
                      <Chart
                        width={"600px"}
                        height={"400px"}
                        chartType="Line"
                        loader={<div>Loading Chart</div>}
                        data={[
                          [{ type: "date", label: "Day" }, "Db growth (GB)"],
                          ...dailyGrowth,
                        ]}
                        options={{
                          chart: {
                            title: "Daily Average Growth",
                          },
                          hAxis: {
                            title: "Time",
                          },
                          vAxis: {
                            title: "Growth in GB",
                          },
                        }}
                        rootProps={{ "data-testid": "1" }}
                      />
                    ) : (
                      <Typography>No records found</Typography>
                    )}
                  </div>
                </Box>
              )}
              {!showQuery && historicalScreenFlag && (
                <HistoricalDatabaseGrowthScreen
                  databaseName={props.databaseName}
                ></HistoricalDatabaseGrowthScreen>
              )}
            </>
          </Fetcher>
        </Paper>
      </AccordionDetails>
    </Accordion>
    <SingleTriggerDialog
      open={jobConfigureDialogOpen}
      handleClose={() => setJobConfigureDialogOpen(false)}
      databaseName={props.databaseName}
      metricId={"storage_db"}
      metricName={"Database Storage Size"}
      minimumRepeatInterval={metadata?.minimumRepeatInterval}
    />
  </>;
};
