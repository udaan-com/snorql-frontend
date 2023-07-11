import { FunctionComponent } from "react";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  IconButton,
  Paper,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {
  IMetricMetadata,
  IndexRedundancyMetric,
  IndexRedundancyTableMetadata,
} from "../../../models";
import { SQLService } from "../../../services/SQLService";
import { MetricHeader } from "../../../components/MetricHeader";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Fetcher } from "../../../../common/components/Fetcher";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import { Alert, AlertTitle } from '@mui/material';
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import { ShowQueryScreen } from "../ShowQueryScreen";
import CodeIcon from "@mui/icons-material/Code";
import {
  showQueryEvent,
  viewSolutionQueryEvent,
} from "../../../tracking/TrackEventMethods";
import { useAdminEmail } from "../../../../hooks";
import { MenuTitle, MenuText } from "../DatabaseDashboardScreen";
import { IndexRedundancyIndexesTable } from "./IndexRedundancyIndexesTable";
import { indexRedundancyColumns } from "./allDatabaseOptimizationColumns";
import _ from "lodash";
import { Helpers } from "../../../helpers";

interface IndexRedundancyProps {
  databaseName: string;
}

export const IndexRedundancyAnalysis: FunctionComponent<
  IndexRedundancyProps
> = (props) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      toolbar: theme.mixins.toolbar,
      addRecorderButton: {
        textTransform: "none",
      },
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
    })
  );

  const classes = useStyles();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<IMetricMetadata>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cols] = useState<any>(indexRedundancyColumns());
  const [indexData, setIndexData] = useState<IndexRedundancyMetric[]>([]);
  const [selectedRows, setSelectedRows] = useState<
    Map<string, IndexRedundancyMetric[]>
  >(new Map<string, IndexRedundancyMetric[]>());
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const [solutionQuery, setSolutionQuery] = useState<string>("");
  const [solQueryExpanded, setSolQueryExpanded] = useState<boolean>(true);
  const [selectedIndexesCount, setSelectedIndexesCount] = useState<number>(0);
  const [selectedIndexesSize, setSelectedIndexesSize] = useState<number>(0);
  const [tableNames, setTableNames] = useState<IndexRedundancyTableMetadata[]>([]);
  const [tableIndexes, setTableIndexes] = useState<
    Map<string, IndexRedundancyMetric[]>
  >(new Map<string, IndexRedundancyMetric[]>());
  const email = useAdminEmail();

  useEffect(() => {
    const tableNamesSet = new Set(indexData.map((index) => index.tableName));
    let tempTableNamesData: IndexRedundancyTableMetadata[] = [];
    tableNamesSet.forEach((tableName) => tempTableNamesData.push({ tableName: tableName }));
    setTableNames(tempTableNamesData);
    const groupedTableIndexes = groupByTableName(
      indexData,
      (index) => index.tableName
    );
    const tempSelectedIndexes = indexData.filter((tableIndex) =>
      tableIndex.reason ? true : false
    );
    const selectedTableIndexes = groupByTableName(
      tempSelectedIndexes,
      (index) => index.tableName
    );
    setTableIndexes(groupedTableIndexes);
    setSelectedRows(selectedTableIndexes);
  }, [indexData]);

  function groupByTableName(
    list: any[],
    keyGetter: (input: IndexRedundancyMetric) => string
  ): Map<string, Array<IndexRedundancyMetric>> {
    const map = new Map();
    list.forEach((item: any) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  const isTableUnused = (indexList: IndexRedundancyMetric[]): boolean => _.sumBy(indexList, 'indexUsage') <= 10

  const getTotalIndexSize = (indexList: IndexRedundancyMetric[]): number => _.sumBy(indexList, 'indexSizeInKb')

  useEffect(() => {
    let selIndexes: IndexRedundancyMetric[] = [];
    const tempTableNames: IndexRedundancyTableMetadata[] = []
    tableNames.forEach((tableMeta) => {
      const tableIndexList = tableIndexes.get(tableMeta.tableName)
      const selectedIdxList = selectedRows.get(tableMeta.tableName)
      const tableMetadata: IndexRedundancyTableMetadata = {
        tableName: tableMeta.tableName,
        isTableUnused: isTableUnused(tableIndexList ? tableIndexList : []),
        selectedIndexCount: selectedRows.get(tableMeta.tableName)?.length,
        selectedIndexSize: getTotalIndexSize(selectedIdxList ? selectedIdxList : [])
      }
      tempTableNames.push(tableMetadata)
    })
    setTableNames(tempTableNames);

    selectedRows.forEach((mapVal) => {
      selIndexes = selIndexes.concat(mapVal);
    });

    if (selIndexes && selIndexes.length != 0) {
      let selectedCount = 0;
      let selectedSize = 0;
      selIndexes.forEach((idx) => {
        selectedCount += 1;
        selectedSize += idx.indexSizeInKb;
      });
      setSelectedIndexesCount(selectedCount);
      setSelectedIndexesSize(selectedSize);
    } else {
      setSelectedIndexesCount(0);
      setSelectedIndexesSize(0);
    }
  }, [selectedRows]);

  const handleChange = () => {
    setExpanded((prev) => !prev);
  };

  const handleOnApiResponse = (r: any) => {
    if ("error" in r) {
      setErrorMessage(r.error);
    } else {
      setIndexData(r.metricOutput.result.queryList);
      setMetadata(r.metadata);
    }
  };

  const onSelectionChange = (
    currentSelectedRows: IndexRedundancyMetric[],
    tableName: string
  ) => {
    let selRows = selectedRows;
    selRows
      ? selRows.set(
        tableName,
        currentSelectedRows.map((currentValue): IndexRedundancyMetric => {
          const idx = {
            tableObjectId: currentValue.tableObjectId,
            tableName: currentValue.tableName,
            indexId: currentValue.indexId,
            indexName: currentValue.indexName,
            indexType: currentValue.indexType,
            indexUsage: currentValue.indexUsage,
            indexUpdates: currentValue.indexUpdates,
            indexColumnNrs: currentValue.indexColumnNrs,
            indexColumnNames: currentValue.indexColumnNames,
            includeColumnNrs: currentValue.includeColumnNrs,
            includeColumnNames: currentValue.includeColumnNames,
            indexSizeInKb: currentValue.indexSizeInKb,
            isUnique: currentValue.isUnique,
            reason: currentValue.reason,
          };
          return idx;
        })
      )
      : [];
    setSelectedRows(selRows);
  };

  const tableOptions: MUIDataTableOptions = {
    filterType: "multiselect",
    selectableRows: "none",
    responsive: "standard",
    print: false,
    download: true,
    enableNestedDataAccess: ".",
    setTableProps: () => {
      return { size: "small" };
    },
    sortOrder: {
      name: 'selectedIndexSize',
      direction: 'desc'
    },
    rowsPerPage: 250,
    rowsPerPageOptions: [50, 250, 500, 2000],
    expandableRows: true,
    expandableRowsOnClick: true,
    customToolbar: () => {
      return (
        <React.Fragment>
          <Grid style={{ justifyContent: "right" }} container spacing={2}>
            <Grid item>
              <Tooltip title={"Generate Solution Query"}>
                <Button
                  onClick={() => generateSolutionQuery()}
                  variant="contained"
                  color="primary"
                  className={classes.addRecorderButton}
                >
                  {solutionQuery && solQueryExpanded
                    ? "Update Query"
                    : "Generate Query"}
                </Button>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title={"Clear all selections"}>
                <Button
                  onClick={() => clearAllSelections()}
                  variant="outlined"
                  color="primary"
                  className={classes.addRecorderButton}
                >
                  Clear selections
                </Button>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title={"Auto select indexes to delete"}>
                <Button
                  onClick={() => autoSelectIndexes()}
                  variant="outlined"
                  color="primary"
                  className={classes.addRecorderButton}
                >
                  Auto Select
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </React.Fragment>
      );
    },
    isRowExpandable: (dataIndex) => {
      if (indexData[dataIndex]) {
        return true;
      } else return false;
    },
    renderExpandableRow: (rowData, rowMeta) => {
      const colSpan = rowData.length + 1;
      const tableName = rowData[0] ? rowData[0] : "Table Name not found!!!";
      const indexList = tableIndexes ? tableIndexes.get(tableName) : [];
      const selectedTableIndexes = selectedRows.get(tableName);
      if (!indexList) return <></>;
      return (
        <tr>
          <td colSpan={colSpan}>
            <IndexRedundancyIndexesTable
              indexList={indexList}
              selectedIndexes={selectedTableIndexes ? selectedTableIndexes : []}
              onSelectionChange={(
                currentSelectedRows: any[],
                tableName: string
              ) => onSelectionChange(currentSelectedRows, tableName)}
              tableName={rowData[0]}
            ></IndexRedundancyIndexesTable>
          </td>
        </tr>
      );
    },
  };

  const handleActionQueryChange = () => {
    setSolQueryExpanded((prev) => !prev);
  };

  const clearAllSelections = () => {
    setSelectedRows(new Map());
  };

  const autoSelectIndexes = () => {
    if (indexData && indexData.length != 0) {
      const listOfChecked = indexData.filter((idx) => idx.reason != null);
      const selectedTableIndexes = groupByTableName(
        listOfChecked,
        (index) => index.tableName
      );
      setSelectedRows(selectedTableIndexes);
    }
  };

  const generateSolutionQuery = () => {
    let allSelectedIndexes: IndexRedundancyMetric[] = [];
    selectedRows.forEach((tableIndexes) => {
      allSelectedIndexes = allSelectedIndexes.concat(tableIndexes);
    });

    if (allSelectedIndexes && allSelectedIndexes.length != 0) {
      let solnQuery = "/* Drop Index Queries */";
      allSelectedIndexes.forEach((indexInfo: IndexRedundancyMetric) => {
        solnQuery =
          solnQuery +
          `
DROP INDEX ${indexInfo.indexName} ON ${indexInfo.tableName};`;
      });
      setSolutionQuery(solnQuery);
    } else {
      setSolutionQuery("/* No indexes found to delete! */");
    }
    viewSolutionQueryEvent(basicPropsForMixPanel);
  };

  const basicPropsForMixPanel = {
    dbName: props.databaseName,
    userEmail: email,
    metricTitle: MenuTitle.STORAGE,
    metricText: `${MenuText.DATABASE_OPTIMIZATION}_INDEX_REDUNDANCY`,
  };
  const handleOnShowQuery = () => {
    setShowQuery(!showQuery);
    metadata &&
      showQueryEvent({
        ...basicPropsForMixPanel,
        query: metadata.underlyingQueries[0],
      });
  };

  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon onClick={handleChange} />}
      >
        <div className={classes.summaryContent}>
          <MetricHeader title="Index Redundancy" metadata={metadata} />
        </div>
        {metadata && <div style={{ float: "right" }}>
          <Tooltip title={showQuery ? "Hide the source" : "Show the source"}>
            <IconButton aria-label="delete" onClick={() => handleOnShowQuery()} size="large">
              <CodeIcon />
            </IconButton>
          </Tooltip>
        </div>}
      </AccordionSummary>
      <AccordionDetails>
        <Paper style={{ width: "100%" }}>
          {/* <Alert severity="error">
            We are in process of fixing an issue in recommendations. Please do
            not trust this blindly.
          </Alert> */}
          <div style={{ marginLeft: "10px", padding: "10px" }}>
            <Typography variant="caption" display="block" gutterBottom>
              Note: The indexes are classified in below 3 types:{" "}
              <ul>
                <li>
                  <b>Duplicate Indexes:</b> An index has Same key columns in the
                  same order with another index (Identical indexes)
                </li>
                <li>
                  <b>Overlapping Indexes: </b> An index which has Key columns
                  those are left based subset of another index
                </li>
                <li>
                  <b>Similar Indexes: </b> Indexes having same indexed columns
                  but different include columns
                </li>
                <li>
                  <b>Unused Indexes: </b> Indexes which exist but are not used
                  (updated indexes not used in any seeks, scan or lookup
                  operations).
                </li>
              </ul>
              Note: Index Usage is the total of Primary, Read Replica and Slave
              Database wherever applicable.
            </Typography>
          </div>
          <div style={{ marginLeft: "5px", padding: "10px" }}>
            <Fetcher
              fetchData={() =>
                SQLService.getIndexRedundancy(props.databaseName)
              }
              onFetch={(r) => {
                handleOnApiResponse(r);
              }}
            >
              {showQuery && metadata && metadata.underlyingQueries && (
                <div style={{ float: "right", padding: "10px" }}>
                  <CopyToClipboard text={metadata.underlyingQueries[0]} />
                </div>
              )}
              {showQuery && metadata && metadata.underlyingQueries && (
                <div
                  style={{
                    padding: "4px",
                    marginBottom: "4px",
                  }}
                >
                  <ShowQueryScreen query={metadata.underlyingQueries[0]} />
                </div>
              )}
              {!errorMessage && solutionQuery && (
                <div style={{ marginBottom: "4px", padding: "4px" }}>
                  <Accordion expanded={solQueryExpanded}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      onClick={handleActionQueryChange}
                    >
                      <div className={classes.summaryContent}>
                        <MetricHeader title="Solution Query" />
                      </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
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
                            In case of any doubts please reach out on #sigdb
                            channel on Slack.
                          </Alert>
                        </Grid>
                        <Grid item xs={12}>
                          <div
                            style={{
                              marginTop: "5px",
                              height: "auto",
                              width: "100%",
                            }}
                          >
                            <Grid container>
                              <Grid item xs={3}>
                                <h3>Delete Redundant Indexes Query</h3>
                              </Grid>
                              <Grid item>
                                <CopyToClipboard text={solutionQuery} />
                              </Grid>
                            </Grid>
                            <ShowQueryScreen query={solutionQuery} />
                          </div>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </div>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="success">
                    You have selected <b>{selectedIndexesCount}</b> indexes.
                    Deleting these indexes will save you{" "}
                    <b>
                      {Helpers.roundSize(
                        Helpers.convertSize("KB", "GB", selectedIndexesSize)
                      )}{" "}
                      GB.
                    </b>
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <IndexRedundancyTable
                    title="Indexes Redundancy Analysis"
                    rows={tableNames}
                    columns={cols}
                    options={tableOptions}
                  ></IndexRedundancyTable>
                </Grid>
              </Grid>
            </Fetcher>
          </div>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

interface IndexRedundancyTableProps {
  rows: IndexRedundancyTableMetadata[];
  columns: [];
  options: MUIDataTableOptions;
  title: string;
}

export const IndexRedundancyTable: FunctionComponent<
  IndexRedundancyTableProps
> = (props) => {
  const { rows, columns, options, title } = props;
  return (
    <MUIDataTable
      title={title}
      data={rows}
      columns={columns}
      options={options}
    />
  );
};
