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
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import {
  ICustomError,
  TableUnusedIndexResponse,
  ITableUnusedIndexResponse,
  IMetricMetadata,
} from "../../../models";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@material-ui/icons/Code";
import { ShowQueryScreen } from "../ShowQueryScreen";
import ReplayIcon from "@material-ui/icons/Replay";
import { DataGrid } from "@material-ui/data-grid";
import { getTableUnusedIndexColumns } from "./TableUnusedIndexModel";
import { useStyles } from "../../../components/StyleClass";
import { MetricHeader } from "../../../components/MetricHeader";
import {
  reloadMetricEvent,
  showQueryEvent,
  expandMetricEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";

interface TableUnusedIndexProps {
  databaseName: string;
  tableName: string;
}

export const TableUnusedIndexScreen: FunctionComponent<
  TableUnusedIndexProps
> = (props) => {
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tableUnunsedIndex, setTableUnusedIndex] = useState<
    TableUnusedIndexResponse[]
  >([]);
  const [dropIndexes, setDropIndexes] = useState<string[]>();
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [tableName, setTableName] = useState<string>(props.tableName);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const email = useAdminEmail();

  const handleOnApiResponse = (r: ITableUnusedIndexResponse | ICustomError) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      const result = r.metricOutput?.result?.queryList;
      if (result) {
        setMetadata(r.metadata);
        setTableUnusedIndex(formatToAddId(result));
        setDropIndexes(r.metricOutput?.recommendation.indexesToDrop);
      }
    }
  };

  const formatToAddId = (response: any[]): TableUnusedIndexResponse[] => {
    response.map((eachItem, index) => {
      eachItem["id"] = index + 1;
    });
    return response;
  };
  useEffect(() => {
    setTableName(props.tableName);
    handleReload();
  }, [props.tableName]);

  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.STORAGE,
    metricText: `${MenuText.TABLE_LEVEL}_UNUSED_INDEX`,
  };

  const handleReload = () => {
    if (props.tableName != "") {
      SQLService.getTableUnusedIndex(props.databaseName, props.tableName).then(
        (r) => {
          handleOnApiResponse(r);
          setExpanded(true);
          metadata && reloadMetricEvent(basicPropsForMixPanel);
        }
      );
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
  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className={classes.summaryContent}>
          <MetricHeader title="Index Stats" metadata={metadata} />
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Paper style={{ width: "100%" }}>
          <div style={{ float: "right" }}>
            <Tooltip title="Reload">
              <IconButton onClick={handleReload}>
                <ReplayIcon fontSize="default" />
              </IconButton>
            </Tooltip>
          </div>
          <div style={{ float: "right" }}>
            {showQuery && metadata && metadata.underlyingQueries && (
              <CopyToClipboard text={metadata.underlyingQueries[0]} />
            )}
            <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
              <IconButton aria-label="delete" onClick={() => handleShowQuery()}>
                <CodeIcon />
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
          {dropIndexes && dropIndexes.length > 0 && (
            <div
              style={{
                marginLeft: "25px",
                padding: "10px",
                color: "green",
                fontFamily: "monospace",
              }}
            >
              <details open>
                <summary>Recommendation</summary>
                <p>Drop the following indexes</p>
                <ul>
                  {dropIndexes.map((item) => (
                    <li>{item}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          <Fetcher
            fetchData={() =>
              SQLService.getTableUnusedIndex(props.databaseName, tableName)
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
                  {!errorMessage && tableUnunsedIndex.length ? (
                    <DataGrid
                      autoPageSize={true}
                      rows={tableUnunsedIndex}
                      columns={getTableUnusedIndexColumns()}
                    />
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
