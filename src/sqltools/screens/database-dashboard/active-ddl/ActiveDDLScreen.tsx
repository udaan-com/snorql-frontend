import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Tooltip,
  IconButton,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { Fetcher } from "../../../../common/components/Fetcher";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";

import {
  IActiveDDLMetricResponse,
  IActiveDDLResponse,
  ICustomError,
  IMetricMetadata,
} from "../../../models";
import { SQLService } from "../../../services/SQLService";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import ReplayIcon from "@material-ui/icons/Replay";
import { getColumns } from "./ActiveDDLColumn";
import { outerLevelUseStyles } from "../../../components/StyleClass";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@material-ui/icons/Settings";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { HistoricalActiveDDLScreen } from "./HistoricalActiveDDLScreen";
import {
  showQueryEvent,
  toggleToHistoricViewEvent,
  configureDataRecordingViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";

interface ActiveDDLProps {
  databaseName: string;
}

export const ActiveDDLScreen: FunctionComponent<ActiveDDLProps> = (props) => {
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDDL, setActiveDDL] = useState<IActiveDDLResponse[]>([]);
  const [cols, setCols] = useState<any>([]);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const [jobConfigureDialogOpen, setJobConfigureDialogOpen] =
    useState<boolean>(false);
  const email = useAdminEmail();

  const handleReload = () => {
    handleSearch();
  };

  const columns = getColumns();

  const options: MUIDataTableOptions = {
    filterType: "multiselect",
    selectableRows: "none",
    print: false,
    download: true,
  };

  const handleOnApiResponse = (r: IActiveDDLMetricResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else if ("error" in r) {
      alert(`[ERROR]: ${r["error"]}`);
    } else {
      if ("metricOutput" in r) {
        const result = r.metricOutput.result.queryList;
        let isNotNull = result.every((x) => Object.values(x).some((v) => v));
        if (isNotNull) {
          setActiveDDL(formatToAddId(result));
        }
        setMetadata(r.metadata);
        setCols(columns);
        setErrorMessage("");
      } else {
        setErrorMessage("");
      }
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleSearch();
    }, 1000 * 10);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = () => {
    SQLService.getActiveDDL(props.databaseName).then((r) => {
      handleOnApiResponse(r);
    });
  };
  const formatToAddId = (response: any[]): IActiveDDLResponse[] => {
    response.map((eachItem, index) => {
      eachItem["id"] = index + 1;
    });
    return response;
  };
  const handleActiveDDL = (r: IActiveDDLMetricResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      if ("metricOutput" in r) {
        const result = r.metricOutput.result.queryList;
        let isNotNull = result.every((x) => Object.values(x).some((v) => v));
        if (isNotNull) {
          setActiveDDL(formatToAddId(result));
        }
        setMetadata(r.metadata);
        setErrorMessage("");
      } else {
        setErrorMessage("");
      }
    }
  };
  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.PERFORMANCE,
    metricText: MenuText.ACTIVE_DDL,
  };
  const handleOnShowQuery = () => {
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

  const classes = outerLevelUseStyles();
  return (
    <Box
      className={[classes.content, classes.toolbar].join(" ")}
      mt={10}
      alignItems={"center"}
      justifyContent={"center"}
      paddingTop={5}
    >
      <Paper style={{ width: "100%" }}>
        <div style={{ float: "right" }}>
          <div style={{ float: "right" }}>
            {showQuery && metadata && metadata.underlyingQueries && (
              <CopyToClipboard text={metadata.underlyingQueries[0]} />
            )}
            <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
              <IconButton
                aria-label="delete"
                onClick={() => handleOnShowQuery()}
              >
                <CodeIcon />
              </IconButton>
            </Tooltip>
          </div>
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
          {metadata && metadata.supportsHistorical && (
            <Tooltip title="Configure Data Recording">
              <IconButton onClick={handleJobConfigureDialogOpen}>
                <SettingsIcon fontSize="default" />
              </IconButton>
            </Tooltip>
          )}
          {!historicalScreenFlag && (
            <Tooltip title="Reload">
              <IconButton onClick={handleReload}>
                <ReplayIcon fontSize="default" />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <div style={{ marginLeft: "15px", padding: "10px" }}>
          <MetricHeader title="Active DDL Metric" metadata={metadata} />
        </div>
        {errorMessage && (
          <div
            style={{
              marginLeft: "6px",
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

        <SingleTriggerDialog
          open={jobConfigureDialogOpen}
          handleClose={() => setJobConfigureDialogOpen(false)}
          databaseName={props.databaseName}
          metricId={"performance_activeDDL"}
          metricName={"Active DDL Queries Metric"}
          minimumRepeatInterval={metadata?.minimumRepeatInterval}
        />

        {!historicalScreenFlag && (
          <Fetcher
            fetchData={() => SQLService.getActiveDDL(props.databaseName)}
            onFetch={(r) => handleActiveDDL(r)}
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
                  <MUIDataTable
                    title={""}
                    data={activeDDL}
                    columns={cols}
                    options={options}
                  />
                </div>
              </Box>
            )}
          </Fetcher>
        )}

        {historicalScreenFlag && (
          <HistoricalActiveDDLScreen databaseName={props.databaseName} />
        )}
      </Paper>
    </Box>
  );
};
