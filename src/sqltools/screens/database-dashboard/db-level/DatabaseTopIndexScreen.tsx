import React, { FunctionComponent, useState } from "react";
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tooltip,
  IconButton,
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
  IDatabaseTopIndexResponse,
  DatabaseTopIndexResponse,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@material-ui/icons/Replay";
import MUIDataTable from "mui-datatables";
import { getTopIndexColumns } from "./DatabaseTopIndexModels";
import { useStyles } from "../../../components/StyleClass";
import { tableOptions } from "./DatabaseLevelScreen";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@material-ui/icons/Settings";
import { DatabaseHistoricalTopIndex } from "./DatabaseHistoricalTopIndex";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import {
  reloadMetricEvent,
  showQueryEvent,
  expandMetricEvent,
  configureDataRecordingViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import {Helpers} from "../../../helpers";

interface DatabaseTopIndexProps {
  databaseName: string;
}

export const DatabaseTopIndexScreen: FunctionComponent<
  DatabaseTopIndexProps
> = (props) => {
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dbTopIndex, setDbTopIndex] = useState<DatabaseTopIndexResponse[]>([]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const [jobConfigureModalOpen, setJobConfigureModalOpen] = useState(false);
  const email = useAdminEmail();

  const handleOnApiResponse = (r: IDatabaseTopIndexResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      const result = r.metricOutput.result.queryList;
      setMetadata(r.metadata);
      let results = Helpers.changeSize(result);
      setDbTopIndex(formatToAddId(results));
    }
  };

  const formatToAddId = (response: any[]): DatabaseTopIndexResponse[] => {
    response.map((eachItem, index) => {
      eachItem["id"] = index + 1;
    });
    return response;
  };
  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.STORAGE,
    metricText: `${MenuText.DATABASE_LEVEL}_TOP_INDEX`,
  };
  const handleReload = () => {
    SQLService.getDatabaseTopIndex(props.databaseName).then((r) => {
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

  const handleJobConfigureDialogOpen = () => {
    setJobConfigureModalOpen(true);
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
          <MetricHeader title="Database Top Indexes" metadata={metadata} />
          {metadata && metadata.supportsHistorical && (
            <div style={{ float: "right" }}>
              <FormControl component="fieldset">
                <FormGroup aria-label="historicalEnabled" row>
                  <FormControlLabel
                    onChange={() =>
                      setHistoricalScreenFlag(!historicalScreenFlag)
                    }
                    control={<Switch color="primary" />}
                    label="View Historical Data"
                    labelPlacement="bottom"
                  />
                </FormGroup>
              </FormControl>
              <Tooltip title="Configure Data Recording">
                <IconButton onClick={handleJobConfigureDialogOpen}>
                  <SettingsIcon fontSize="default" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <SingleTriggerDialog
          open={jobConfigureModalOpen}
          handleClose={() => setJobConfigureModalOpen(false)}
          databaseName={props.databaseName}
          metricId={"storage_dbIndex"}
          metricName={"Database Top Index"}
          minimumRepeatInterval={metadata?.minimumRepeatInterval}
        />
        {!historicalScreenFlag && (
          <Paper style={{ width: "100%" }}>
            <div style={{ float: "right" }}>
              <Tooltip
                title={showQuery ? "Hide the source" : "Show the source"}
              >
                <IconButton
                  aria-label="delete"
                  onClick={() => handleShowQuery()}
                >
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
                SQLService.getDatabaseTopIndex(props.databaseName)
              }
              onFetch={(r) => handleOnApiResponse(r)}
            >
              <div style={{ float: "right", padding: "10px" }}>
                {showQuery && metadata && metadata.underlyingQueries && (
                  <CopyToClipboard text={metadata.underlyingQueries[0]} />
                )}
              </div>

              {showQuery && metadata && metadata.underlyingQueries && (
                <ShowQueryScreen query={metadata.underlyingQueries[0]} />
              )}

              {!showQuery && (
                <>
                  {!errorMessage && dbTopIndex.length ? (
                    <MUIDataTable
                      title={""}
                      data={dbTopIndex}
                      columns={getTopIndexColumns()}
                      options={tableOptions}
                    />
                  ) : (
                    <Typography>No records found</Typography>
                  )}
                </>
              )}
            </Fetcher>
          </Paper>
        )}
        {historicalScreenFlag && (
          <Paper style={{ maxWidth: 1400, width: "-webkit-fill-available" }}>
            <div style={{ marginLeft: "5px", padding: "10px" }}>
              <DatabaseHistoricalTopIndex
                databaseName={props.databaseName}
              ></DatabaseHistoricalTopIndex>
            </div>
          </Paper>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
