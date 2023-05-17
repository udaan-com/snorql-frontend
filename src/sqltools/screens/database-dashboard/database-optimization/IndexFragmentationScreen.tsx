import {
  Accordion,
  AccordionSummary,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  Tooltip,
  Theme,
  AccordionDetails,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import React, { useEffect, useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { FunctionComponent } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MetricHeader } from "../../../components/MetricHeader";
import {
  ICustomError,
  IMetricMetadata,
  IndexFragmentationMetric,
  IndexFragmentationMetricRecommendation,
  IndexFragmentationmetricResponse,
  IndexPhysicalStats,
  INDEX_PHYSICAL_STATS_MODES,
} from "../../../models";
import ReplayIcon from "@mui/icons-material/Replay";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import Autocomplete from '@mui/material/Autocomplete';
import { Fetcher } from "../../../../common/components/Fetcher";
import { SQLService } from "../../../services/SQLService";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import CodeIcon from "@mui/icons-material/Code";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { NoDataExists } from "../../../components/NoDataExists";
import { ShowQueryScreen } from "../ShowQueryScreen";
import { indexFragmentationColumns } from "./allDatabaseOptimizationColumns";
import { Alert, AlertTitle } from '@mui/material';
import { expandMetricEvent, showQueryEvent } from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuText, MenuTitle } from "../DatabaseDashboardScreen";
import { Helpers } from "../../../helpers";

interface IndexFragmentationScreen {
  databaseName: string;
}

export const IndexFragmentationScreen: FunctionComponent<IndexFragmentationScreen> = (props) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      toolbar: theme.mixins.toolbar,
      content: {
        width: "100%",
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

  const indexPhysicalStatsModes: IndexPhysicalStats[] = [
    { modeId: INDEX_PHYSICAL_STATS_MODES.DEFAULT, modeName: "DEFAULT" },
    { modeId: INDEX_PHYSICAL_STATS_MODES.DETAILED, modeName: "DETAILED" },
    { modeId: INDEX_PHYSICAL_STATS_MODES.LIMITED, modeName: "LIMITED" },
    { modeId: INDEX_PHYSICAL_STATS_MODES.NULL, modeName: "NULL" },
    { modeId: INDEX_PHYSICAL_STATS_MODES.SAMPLED, modeName: "SAMPLED" },
  ];

  const classes = useStyles();
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [idxFragQueryExpanded, setIdxFragQueryExpanded] =
    React.useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [recommendation, setRecommendation] =
    useState<IndexFragmentationMetricRecommendation>();
  const [indexPhysicalStatMode, setIndexPhysicalStatMode] =
    useState<INDEX_PHYSICAL_STATS_MODES>(INDEX_PHYSICAL_STATS_MODES.LIMITED);
  const [indexStatModeObject, setIndexStatModeObject] =
    useState<IndexPhysicalStats>(indexPhysicalStatsModes[2]);
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [indexFragmentationStats, setIndexFragmentationStats] = useState<
    IndexFragmentationMetric[]
  >([]);
  const [rebuildIndexCount, setRebuildIndexCount] = useState<number>(0);
  const [reorganizeIndexCount, setReorganizeIndexCount] = useState<number>(0);
  const [spaceSavingsInKb, setSpaceSavings] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cols, setCols] = useState<any>([]);
  const [indexActionQuery, setIndexActionQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const email = useAdminEmail();

  useEffect(() => {
    generateActionQueries();
  }, [recommendation]);

  const handleChange = () => {
    setExpanded((prev) => !prev);
    metadata && expandMetricEvent(basicPropsForMixPanel)
  };

  const handleActionQueryChange = () => {
    setIdxFragQueryExpanded((prev) => !prev);
  };

  const handleIndexPhysicalStatModeChange = (
    indexStatMode: IndexPhysicalStats | null
  ) => {
    if (indexStatMode) {
      setIndexPhysicalStatMode(indexStatMode.modeId);
    }
  };

  const handleOnApiResponse = (
    r: IndexFragmentationmetricResponse | ICustomError
  ) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else {
      const result = r.metricOutput.result.queryList;
      setMetadata(r.metadata);
      setRecommendation(r.metricOutput.recommendation);
      setIndexFragmentationStats(result);
      const columns = indexFragmentationColumns();
      setCols(columns);
    }
    setLoading(false);
  };

  const generateActionQueries = async () => {
    if (recommendation) {
      let reorganizeQuery = "/* Reorganize Query */";
      recommendation.indexesToReorganise.forEach((index) => {
        reorganizeQuery =
          reorganizeQuery +
          `
        ALTER INDEX ${index.indexName} on ${index.objectName} REORGANIZE;`;
      });

      let totalPageCount = 0;
      let rebuildQuery = "/* Rebuild Query */";
      recommendation.indexesToRebuild.forEach((index) => {
        totalPageCount += index.pageCount;
        rebuildQuery =
          `${rebuildQuery}` +
          `
        ALTER INDEX ${index.indexName} on ${index.objectName} REBUILD PARTITION = ALL WITH (ONLINE = ON);`;
      });
      setIndexActionQuery(`${reorganizeQuery}

      
      ${rebuildQuery}`);
      setSpaceSavings(totalPageCount * 8 * 0.3);
      setRebuildIndexCount(recommendation.indexesToRebuild.length);
      setReorganizeIndexCount(recommendation.indexesToReorganise.length);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    SQLService.getIndexFragmentation(
      props.databaseName,
      indexPhysicalStatMode
    ).then((r) => {
      handleOnApiResponse(r);
    });
  };

  const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.DATABASE_OPTIMIZATION}_INDEX_FRAGMENTATION` }
  const handleOnShowQuery = () => {
    setShowQuery(!showQuery);
    metadata && showQueryEvent({
      ...basicPropsForMixPanel,
      query: metadata.underlyingQueries[0]
    })
  }

  const options: MUIDataTableOptions = {
    filterType: "multiselect",
    selectableRows: "none",
    print: false,
    download: true,
    setTableProps: () => {
      return { size: "small" };
    },
    rowsPerPage: 50,
    rowsPerPageOptions: [50, 250, 500, 2000],
  };

  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={handleChange}
      >
        <div className={classes.summaryContent}>
          <MetricHeader title="Index Fragmentation" metadata={metadata} />
        </div>
        {metadata && <div style={{ float: "right" }}>
          <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
            <IconButton onClick={() => handleOnShowQuery()} size="large">
              <CodeIcon />
            </IconButton>
          </Tooltip>
        </div>}
      </AccordionSummary>
      <AccordionDetails>
        <Paper style={{ width: "100%" }}>
          <div style={{ marginLeft: "5px", padding: "10px" }}>
            <FormControl style={{ minWidth: "320px" }}>
              <Autocomplete
                id="index-physical-state-mode"
                aria-required
                options={indexPhysicalStatsModes}
                getOptionLabel={(option: IndexPhysicalStats) => option.modeName}
                style={{ width: 300 }}
                value={indexStatModeObject}
                isOptionEqualToValue={(option, value) =>
                    option.modeName === value.modeName
                }
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    label="Index Physical State Mode"
                    variant="outlined"
                  />
                )}
                onChange={(event: any, newValue: IndexPhysicalStats | null) =>
                  handleIndexPhysicalStatModeChange(newValue)
                }
              />
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              style={{ marginLeft: 8, height: "56px", width: "auto" }}
            >
              {loading ? <CircularProgress color="secondary" /> : "Search"}
            </Button>
          </div>
          <div style={{ marginLeft: "5px", padding: "10px" }}>
            <Typography variant="caption" display="block" gutterBottom>
              Note:{" "}
              <ul>
                <li>
                  {" "}
                  Index Fragmentation Metric takes ~15 minutes to load the first
                  time (depending on the indexes). Sit back, relax!
                  <br />
                  Reload the page in case of timeout
                </li>
                <li>
                  Index Fragmentation Metric is refreshed every 24 hours.{" "}
                </li>
              </ul>
            </Typography>
          </div>

          <Fetcher
            fetchData={() =>
              SQLService.getIndexFragmentation(
                props.databaseName,
                indexPhysicalStatMode
              )
            }
            onFetch={(r) => {
              handleOnApiResponse(r);
            }}
          >
            {showQuery && metadata && metadata.underlyingQueries && <div style={{ float: "right", padding: "10px" }}>
              <CopyToClipboard text={metadata.underlyingQueries[0]} />
            </div>}
            {showQuery && metadata && metadata.underlyingQueries && <div
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                padding: "10px",
              }}
            >
              <ShowQueryScreen query={metadata.underlyingQueries[0]} />
            </div>}
            {!errorMessage && indexActionQuery && (
              <div
                style={{
                  marginLeft: "5px",
                  marginRight: "5px",
                  padding: "10px",
                }}
              >
                <Accordion expanded={idxFragQueryExpanded}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    onClick={handleActionQueryChange}
                  >
                    <div className={classes.summaryContent}>
                      <MetricHeader title="Solution Query" />
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      paddingRight={2}
                      paddingBottom={4}
                      paddingLeft={2}
                      style={{ overflowX: "scroll" }}
                    >
                      <Alert severity="warning">
                        <AlertTitle>Warning</AlertTitle>
                        <ul>
                          <li>
                            The solution query is auto-generated. Please be
                            fully aware of what you are doing.
                          </li>
                          <li>Execute only in off-peak hours.</li>
                          <li>
                            <strong>
                              This query is to be executed only in SSMS.
                            </strong>
                          </li>
                        </ul>
                        In case of any doubts please reach out on #sigdb channel
                        on Slack.
                      </Alert>
                      <div
                        style={{
                          marginTop: "5px",
                          height: "auto",
                          width: "100%",
                        }}
                      >
                        <Grid container>
                          <Grid item xs={1}>
                            <h3>Query</h3>
                          </Grid>
                          <Grid item>
                            <CopyToClipboard text={indexActionQuery} />
                          </Grid>
                        </Grid>
                        <ShowQueryScreen query={indexActionQuery} />
                      </div>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </div>
            )}
            <div>
              {!showQuery && errorMessage && (
                <ErrorMessageCard text={errorMessage} />
              )}
              {
                !errorMessage &&
                indexFragmentationStats &&
                indexFragmentationStats.length > 0 && (
                  <div
                    style={{
                      marginLeft: "5px",
                      marginRight: "5px",
                      padding: "10px",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Alert severity="success">
                          {/* <AlertTitle>Warning</AlertTitle> */}
                          You can rebuild <b>{rebuildIndexCount}</b> indexes and
                          reorganize <b>{reorganizeIndexCount}</b> indexes. This
                          will save you approximately{" "}
                          <b>
                            <>{Helpers.roundSize(Helpers.convertSize("KB", "GB", spaceSavingsInKb))}{" "}GB</>
                          </b>{" "}
                          of space and will improve query performance and reduce
                          CPU utilization.
                        </Alert>
                      </Grid>
                      <Grid item xs={12}>
                        <IndexFragmentationTable
                          rows={indexFragmentationStats}
                          columns={cols}
                          options={options}
                        />
                      </Grid>
                    </Grid>
                  </div>
                )}
            </div>
            {
              !errorMessage &&
              indexFragmentationStats.length === 0 && (
                <NoDataExists text="No Index Fragmentation Data Available" />
              )}
          </Fetcher>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

interface IndexFragmentationTableProps {
  rows: IndexFragmentationMetric[];
  columns: [];
  options: MUIDataTableOptions;
}

export const IndexFragmentationTable: FunctionComponent<
  IndexFragmentationTableProps
> = (props) => {
  const { rows, columns, options } = props;
  return (
    <MUIDataTable
      title="Indexes Fragmentation Statistics"
      data={rows}
      columns={columns}
      options={options}
    />
  );
};
