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
  Switch,
  FormGroup,
  FormControl,
  FormControlLabel,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  ICustomError,
  PVSResponse,
  IPVSResponse,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@material-ui/icons/Replay";
import { useStyles } from "../../../components/StyleClass";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@material-ui/icons/Settings";
import {
  reloadMetricEvent,
  showQueryEvent,
  expandMetricEvent,
  toggleToHistoricViewEvent,
  configureDataRecordingViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";

interface PVSScreenProps {
  databaseName: string;
}

export const PVSScreen: FunctionComponent<PVSScreenProps> = (props) => {
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pvs, setPVS] = useState<PVSResponse[]>([]);
  const [underlyingQuery, setUnderlyingQuery] = useState<string>("");
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const email = useAdminEmail();

  const handleOnApiResponse = (r: IPVSResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      const result = r.metricOutput.result.queryList;
      setMetadata(r.metadata);
      setPVS(result);
    }
  };
  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.STORAGE,
    metricText: `${MenuText.DATABASE_LEVEL}_PVC`,
  };

  const handleReload = () => {
    SQLService.getPVS(props.databaseName)
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
  const handleChange = () => (event: React.ChangeEvent<{}>) => {
    setExpanded(!expanded);
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
    showJobConfigureDialog();
    configureDataRecordingViewEvent(basicPropsForMixPanel);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className={classes.summaryContent}>
          <MetricHeader
            title="Persistent version store size with open tran"
            metadata={metadata}
          />
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Paper style={{ width: "100%" }}>
          <div style={{ float: "right" }}>
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
            {/* <Switch  value="historicalScreenFlag" inputProps={{ 'title': 'Historical Data' }} /> */}
            {showQuery && metadata && metadata.underlyingQueries && (
              <CopyToClipboard text={metadata.underlyingQueries[0]} />
            )}
            <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
              <IconButton aria-label="delete" onClick={() => handleShowQuery()}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
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
            fetchData={() => SQLService.getPVS(props.databaseName)}
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
                  {!errorMessage && pvs.length ? (
                    <Table>
                      <TableBody>
                        {Object.entries(pvs[0]).map((x, y) => {
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
    </Accordion>
  );
};
function showJobConfigureDialog(): void {
  throw new Error("Function not implemented.");
}
