import React from "react";
import { StatementDialog } from "../../../../../components/StatementDialog";
import { QueryPlanGraphDialog } from '../query-plan/QueryPlanGraphDialog';
import { IAnalyzeQueryPlan } from '../../../../../models'
 
export const getColumns = (startTime: string, endTime:string, databaseName: string) => [
    {
        name: "queryId",
        label: "Query Id",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}})
        }
    },
    {
        name: "objectId",
        label: "Object Id",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}})
        }
    },
    {
        name: "objectName",
        label: "Object Name",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}})
        }
    },
    {
        name: "querySqlText",
        label: "Query SQL Text",
        options: {
          display: true,
          filter: false,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
          customBodyRender: (value: any) => {
            return <StatementDialog statement={value}/>
          }
        }
    },
    {
        name: "countExecutions",
        label: "Count Executions",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "numPlans",
        label: "No of Plans",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
      name: "",
      label: "Plan Details",
      options: {
        display: true,
        filter: false,
        sort: false,
        setCellProps: () => ({style: {whiteSpace:"pre"}}),
        customBodyRender: (value: any, tableMeta: any) => {
          const rowData: any = tableMeta.rowData;
          return (<QueryPlanGraphDialog 
            numOfPlans={value} 
            startTime={startTime} 
            endTime={endTime} 
            aggregatedQueryPlanData={castRowDataToIAnalyzeQueryPlan(rowData)} 
            databaseName={databaseName}
            queryText={rowData[3]}
            />)
        }
      }
  },
    {
        name: "totalDuration",
        label: "Total Duration",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalCpuTime",
        label: "Total CPU Time",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalLogicalIoReads",
        label: "Total Logical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalLogicalIoWrites",
        label: "Total Logical IO Writes",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalPhysicalIoReads",
        label: "Total Physical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalClrTime",
        label: "Total Clr Time",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalDop",
        label: "Total DOP",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalQueryMaxUsedMemory",
        label: "Total Query Max Used Memory",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalRowcount",
        label: "Total Rowcount",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalLogBytesUsed",
        label: "Total LogBytes Used",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "totalTempdbSpaceUsed",
        label: "Total Tempdb Space Used",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgDuration",
        label: "Average Duration",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgCpuTime",
        label: "Average CPU Time",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgLogicalIoReads",
        label: "Average Logical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgLogicalIoWrites",
        label: "Average Logical IO Writes",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgPhysicalIoReads",
        label: "Average Physical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgClrTime",
        label: "Average Clr Time",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgDop",
        label: "Average DOP",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgQueryMaxUsedMemory",
        label: "Average Query Max used Memory",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgRowcount",
        label: "Average Row Count",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgLogBytesUsed",
        label: "Average LogBytes Used",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    },
    {
        name: "avgTempdbSpaceUsed",
        label: "Average Tempdb Space Used",
        options: {
          display: false,
          filter: true,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
    }
];

const castRowDataToIAnalyzeQueryPlan = (rowData:any[]): IAnalyzeQueryPlan => {
  const data: IAnalyzeQueryPlan = {
      queryId: rowData[0],
      querySqlText: rowData[3],
      countExecutions: rowData[4],
      totalDuration: rowData[7],
      totalCpuTime: rowData[8],
      totalLogicalIoReads: rowData[9],
      totalLogicalIoWrites: rowData[10],
      totalPhysicalIoReads: rowData[11],
      totalClrTime: rowData[12],
      totalDOP: rowData[13],
      totalQueryMaxUsedMemory: rowData[14],
      totalRowcount: rowData[15],
      totalLogBytesUsed: rowData[16],
      totalTempdbSpaceUsed: rowData[17],
      avgDuration: rowData[18],
      avgCpuTime: rowData[19],
      avgLogicalIoReads: rowData[20],
      avgLogicalIoWrites: rowData[21],
      avgPhysicalIoReads: rowData[22],
      avgClrTime: rowData[23],
      avgDOP: rowData[24],
      avgQueryMaxUsedMemory: rowData[25],
      avgRowcount: rowData[26],
      avgLogBytesUsed: rowData[27],
      avgTempdbSpaceUsed: rowData[28],
      planXML:""
  }
  return data
}