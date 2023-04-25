import React, { FunctionComponent, useEffect, useState } from "react";
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
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  ICustomError,
  TableSchemaResponse,
  ITableSchemaResponse,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@material-ui/icons/Replay";
import { useStyles } from "../../../components/StyleClass";
import { getTableSchemaColumn } from "./TableSchemaColumn";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import { MetricHeader } from "../../../components/MetricHeader";
import SettingsIcon from "@material-ui/icons/Settings";
import {
  reloadMetricEvent,
  showQueryEvent,
  expandMetricEvent,
  toggleToHistoricViewEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";

interface TableSchemaScreenProps {
  databaseName: string;
  tableName: string;
}

export const TableSchemaScreen: FunctionComponent<TableSchemaScreenProps> = (
  props
) => {
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tableSchema, setTableSchema] = useState<TableSchemaResponse[]>([]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [tableName, setTableName] = useState<string>(props.tableName);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [historicalScreenFlag, setHistoricalScreenFlag] =
    useState<boolean>(false);
  const email = useAdminEmail();

  const handleOnApiResponse = (r: ITableSchemaResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      if (r) {
        const result = r.metricOutput?.result?.queryList;
        if (result) {
          setMetadata(r.metadata);
          setTableSchema(result);
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
    metricText: `${MenuText.TABLE_LEVEL}_SCHEMA`,
  };

  const handleReload = () => {
    if (props.tableName != "") {
      SQLService.getTableSchema(props.databaseName, props.tableName)
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
  const options: MUIDataTableOptions = {
    filter: false,
    selectableRows: "none",
    print: false,
    download: true,
    responsive: "vertical",
    resizableColumns: true,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10, 20],
    setTableProps: () => {
      return { size: "small" };
    },
  };

  const handleClickHistoricalViewToggle = () => {
    setHistoricalScreenFlag(!historicalScreenFlag);
    toggleToHistoricViewEvent(basicPropsForMixPanel);
  };

  return (
    <Accordion id="tableSchema" expanded={expanded} onChange={handleChange()}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className={classes.summaryContent}>
          <MetricHeader title="Table Schema" metadata={metadata} />
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
            {metadata && metadata.supportsHistorical && (
              <Tooltip title="Configure Data Recording">
                <IconButton>
                  <SettingsIcon fontSize="default" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {tableName.length > 0 && (
          <Paper style={{ width: "100%" }}>
            <div style={{ float: "right" }}>
              {showQuery && metadata && metadata.underlyingQueries && (
                <CopyToClipboard text={metadata.underlyingQueries[0]} />
              )}
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
            </div>
            {!historicalScreenFlag && (
              <div style={{ float: "right" }}>
                <Tooltip title="Reload">
                  <IconButton onClick={handleReload}>
                    <ReplayIcon fontSize="default" />
                  </IconButton>
                </Tooltip>
              </div>
            )}

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
                SQLService.getTableSchema(props.databaseName, tableName)
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
                  <div style={{ height: "auto", width: "100%" }}>
                    {!errorMessage && tableSchema.length ? (
                      <MUIDataTable
                        title=""
                        data={tableSchema}
                        columns={getTableSchemaColumn()}
                        options={options}
                      />
                    ) : (
                      <Typography>No records found</Typography>
                    )}
                  </div>
                </Box>
              )}
            </Fetcher>
          </Paper>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
