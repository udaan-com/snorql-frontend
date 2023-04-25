import { Box, Grid } from "@material-ui/core";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import React, { FunctionComponent, useState } from "react";
import { IndexRedundancyMetric } from "../../../models";
import { indexRedundancyAnalysedColumns } from "./allDatabaseOptimizationColumns";

interface Props {
    tableName: string,
    selectedIndexes: IndexRedundancyMetric[],
    indexList: IndexRedundancyMetric[],
    onSelectionChange: (
        currentSelectedRows: any[],
        tableName: string
      ) => void;
}

export const IndexRedundancyIndexesTable: React.FunctionComponent<Props> = (
    props: Props
  ) => {

    const { indexList } = props;

    const columns = indexRedundancyAnalysedColumns();
    const [cols] = useState<any>(columns);
    // const tempChildData = indexList.filter((item) => item.reason ? true : false)
    const selectedArray = []
    for (let i = 0; i < props.selectedIndexes.length; i++) {
      const tempDataIndex = indexList.findIndex((tempIdx) => {
        return tempIdx.indexId == props.selectedIndexes[i].indexId;
      });
      selectedArray.push(tempDataIndex);
    }

    const tableOptions: MUIDataTableOptions = {
    filterType: "multiselect",
    // selectableRows: "none",
    viewColumns: false,
    customToolbar: undefined,
    filter: false,
    search: false,
    print: false,
    download: false,
    setTableProps: () => {
      return { size: "small" };
    },
    rowsPerPage: 50,
    rowsPerPageOptions: [50, 250, 500, 2000],
    rowsSelected: selectedArray,
    onRowSelectionChange: (
      currentRowsSelected,
      allRowsSelected,
      rowsSelected
    ) => {
      props.onSelectionChange(
        allRowsSelected.map((item) => {
          return indexList ? indexList[item.dataIndex] : null;
        }),
        props.tableName
      );
    },
  };

    return (
        <Box paddingTop={2} paddingRight={2} paddingBottom={2} paddingLeft={4}>
          <div style={{ width: "100%" }}>
            <Grid container spacing={2}>
              {indexList && indexList.length != 0 && (
                <Grid item xs={12}>
                  <IndexRedundancyTable
                    rows={indexList}
                    columns={cols}
                    options={tableOptions}
                    title={""}
                  ></IndexRedundancyTable>
                </Grid>
              )}
            </Grid>
          </div>
        </Box>
      );
    };
    
    interface IndexRedundancyTableProps {
      rows: IndexRedundancyMetric[];
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
    