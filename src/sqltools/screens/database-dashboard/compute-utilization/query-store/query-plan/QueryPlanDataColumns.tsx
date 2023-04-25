import { LinearProgress } from "@material-ui/core";
import React from "react";
import { StatementDialog } from "../../../../../components/StatementDialog";


export const getColumns = () => [
    {
        name: "queryId",
        label: "Query Id",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {whiteSpace:"pre",textAlign:'center'}})
        }
    },    {
        name: "planId",
        label: "Plan Id",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {whiteSpace:"pre",textAlign:'center'}}),
          customBodyRender: (value: any) => value ? value : 'Aggregate'
        }
    },
    {
        name: "querySqlText",
        label: "Query SQL Text",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
          customBodyRender: (value: any) => {
            return <StatementDialog statement={value}/>
          }
        }
    },
    {
        name: "avgDuration",
        label: "Average Duration",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgCpuTime",
        label: "Average CPU Time",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgLogicalIoReads",
        label: "Average Logical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgLogicalIoWrites",
        label: "Average Logical IO Writes",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgPhysicalIoReads",
        label: "Average Physical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgClrTime",
        label: "Average Clr Time",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgDop",
        label: "Average DOP",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgQueryMaxUsedMemory",
        label: "Average Query Max used Memory",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgRowcount",
        label: "Average Row Count",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgLogBytesUsed",
        label: "Average LogBytes Used",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgTempdbSpaceUsed",
        label: "Average Tempdb Space Used",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "avgQueryWaitTime",
        label: "Average Query Wait Time",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalDuration",
        label: "Total Duration",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalCpuTime",
        label: "Total CPU Time",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalLogicalIoReads",
        label: "Total Logical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalLogicalIoWrites",
        label: "Total Logical IO Writes",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalPhysicalIoReads",
        label: "Total Physical IO Reads",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalClrTime",
        label: "Total Clr Time",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalDop",
        label: "Total DOP",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalQueryMaxUsedMemory",
        label: "Total Query Max Used Memory",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalRowcount",
        label: "Total Rowcount",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalLogBytesUsed",
        label: "Total LogBytes Used",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "totalTempdbSpaceUsed",
        label: "Total Tempdb Space Used",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    },
    {
        name: "countExecutions",
        label: "Count Executions",
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {padding: 0, textAlign:'center'}}),
        }
    }
];