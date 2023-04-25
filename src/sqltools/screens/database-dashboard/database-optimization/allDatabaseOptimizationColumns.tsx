import Chip from "@material-ui/core/Chip";
import React from "react";
import { StatementDialog } from "../../../components/StatementDialog";

export const indexFragmentationColumns = () => [
  {
    name: "schemaName",
    label: "Schema Name",
    options: {
      filter: true,
      sort: true,
      display: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "objectName",
    label: "Object Name",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "indexName",
    label: "Index Name",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "indexType",
    label: "Index Type",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "avgFragmentationInPercent",
    label: "Average Fragmentation (%)",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: string | undefined) => {
        return value ? value + " %" : "NA";
      },
    },
  },
  {
    name: "avgPageSpaceUsedInPercent",
    label: "Average Page Space Used (%)",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: string | undefined) => {
        return value ? value + " %" : "NA";
      },
    },
  },
  {
    name: "pageCount",
    label: "Page Count",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "allocUnitTypeDesc",
    label: "Allocation Unit Type Desc",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
];

export const indexRedundancyColumns = () => [
  {
    name: "tableName",
    label: "Table Name",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "selectedIndexCount",
    label: "Selected Index Count",
    options: {
      filter: false,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre", textAlign: "center" } }),
      setCellHeaderProps: () => ({
        style: {
          display: "flex",
          justifyContent: "center",
          flexDirection: "row-reverse",
        },
      }),
      customBodyRender: (value: number | null | undefined) => {
        if (value) {
          return (
            <div>
              <Chip
                  label={value}
                  color="secondary"
                  variant="outlined"
                />
            </div>
          )
        } else {
          return <div>
          <Chip
              label={0}
              color="primary"
              variant="outlined"
            />
        </div>
        }
      },
    },
  },
  {
    name: "isTableUnused",
    label: "Is Table Unused",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      // setCellHeaderProps: () => ({
      //   style: {
      //     display: "flex",
      //     justifyContent: "center",
      //     flexDirection: "row-reverse",
      //   },
      // }),
      customBodyRender: (value: number | null | undefined) => {
        if (value) {
          return (
            <div>
              <Chip
                  label={"UNUSED TABLE"}
                  color="secondary"
                  variant="outlined"
                />
            </div>
          )
        } else {
          return <div />
        }
      },
    },
  },
  {
    name: "selectedIndexSize",
    label: "Selected Index Size (KB)",
    options: {
      filter: true,
      sort: true,
      setCellHeaderProps: () => ({
        style: {
          display: "flex",
          justifyContent: "center",
          flexDirection: "row-reverse",
        },
      }),
      setCellProps: () => ({ style: { whiteSpace: "pre", textAlign: "center" } }),
    },
  }
];

export const indexRedundancyAnalysedColumns = () => [
  {
    name: "reason",
    label: "Index Type",
    options: {
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: any) => {
        if (value) {
          return (
            <div>
              <Chip
                  label={value.type}
                  color="primary"
                  variant="outlined"
                />
            </div>
          )
        } else {
          return <div />
        }
      },
    },
  },
  {
    name: "reason",
    label: "Alternate Index",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: any) => {
        if (value) return (<div>{value.servingIndex}</div>)
        else return <div></div>
      }
    },
  },
  {
    name: "reason",
    label: "Drop Index Reason",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: any) => {
        if (value) return (<StatementDialog statement={value.message}/>)
        else return <div></div>
      }
    },
  },
  {
    name: "tableObjectId",
    label: "Table ID",
    options: {
      filter: true,
      sort: true,
      display: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "tableName",
    label: "Table Name",
    options: {
      filter: true,
      sort: true,
      display: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "indexId",
    label: "Index ID",
    options: {
      filter: true,
      sort: true,
      display: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "indexName",
    label: "Index Name",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "unique",
    label: "Unique Index",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre", textAlign: "center" } }),
      customBodyRender: (value: boolean) => {
        if (value) return (<div>{"✓"}</div>)
        else return <div>{"X"}</div>
      }
    },
  },
  {
    name: "indexType",
    label: "Index Type",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "indexUsage",
    label: "Index Usage",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre", textAlign: "center" } }),
    },
  },
  {
    name: "indexUpdates",
    label: "Index updates",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre", textAlign: "center" } }),
    },
  },
  {
    name: "indexColumnNrs",
    label: "Index Column Numbers",
    options: {
      filter: true,
      sort: true,
      display: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "indexColumnNames",
    label: "Index Column Names",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "includeColumnNrs",
    label: "Include Column Numbers",
    options: {
      filter: true,
      sort: true,
      display: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "includeColumnNames",
    label: "Include Column Names",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "indexSizeInKb",
    label: "Index Size (KB)",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre", textAlign: "center" } })
    },
  }
];
