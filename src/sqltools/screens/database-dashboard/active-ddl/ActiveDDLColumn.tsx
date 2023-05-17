import { LinearProgress } from "@mui/material";
import React from "react"
import { StatementDialog } from "../../../components/StatementDialog";

export const getColumns = () => [
  {
name:"queryText",
label:"Query"
,options:{
  customBodyRender: (value: any) => {
    return <StatementDialog statement={value}/>
  }
}
  } , 
  {
      name: "currentStep",
      label: "Current Step",
      
    },
    {
     name: "totalRows",
      label: "Total Rows",
    },
    {
     name: "rowsProcessed",
      label: "Rows Processed",
    },
    {
     name: "rowsLeft",
      label: "Rows Left",
    },
    {
     name: "percentComplete",
      label: "Percent Complete",
      options: { customBodyRender: (colArrayData: any) =>  <><LinearProgress variant="determinate" value={colArrayData} />{colArrayData}</> },
    },
    {
     name: "elapsedSeconds",
      label: "Elapsed Seconds",
    },
    {
     name: "estimatedSecondsLeft",
      label: "Estimated Seconds Left",
    },
    {
     name: "estimatedCompletionTime",
      label: "Estimated Completion Time",
    }
   
];