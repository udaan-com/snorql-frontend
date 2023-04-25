import React from "react"
import { StatementDialog } from "../../../components/StatementDialog"

export const getAlertingColumns = () => [
    {
        name: "alertId",
        label: "Alert ID",
        options: {
          display: false,
          filter: true,
          sort: true,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
      },
      {
        name: "alertName",
        label: "Alert Name",
        options: {
          filter: true,
          sort: true,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
      },
      {
        name: "severity",
        label: "Severity",
        options: {
          filter: true,
          sort: true,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
      },
      {
        name: "description",
        label: "Description",
        options: {
          filter: true,
          sort: true,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
          customBodyRender: (value: any) => {
            return <StatementDialog statement={value}/>
          }
        }
      },
      {
        name: "watchIntervalInSeconds",
        label: "Watch Interval",
        options: {
          filter: true,
          sort: true,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
          customBodyRender: (value: string | undefined) => { return ((value) ? value + " seconds" : "NA") }
        }
      },
      {
        name: "configuredByName",
        label: "Configured By",
        options: {
          display: true,
          filter: false,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
      },
      {
        name: "configuredByEmail",
        label: "Configured By Email",
        options: {
          display: false,
          filter: false,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
        }
      },
      {
        name: "startTime",
        label: "Start Time",
        options: {
          display: false,
          filter: false,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
          customBodyRender: (value: string | undefined) => { return ((value) ? (new Date(value)).toLocaleString() : "NA") }
        }
      },
      {
        name: "endTime",
        label: "End Time",
        options: {
          display: true,
          filter: false,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
          customBodyRender: (value: string | undefined) => { return ((value) ? (new Date(value)).toLocaleString() : "NA") }
        }
      },
      {
        name: "nextFireTime",
        label: "Next Fire Time",
        options: {
          display: false,
          filter: false,
          sort: false,
          setCellProps: () => ({style: {whiteSpace:"pre"}}),
          customBodyRender: (value: string | undefined) => { return ((value) ? (new Date(value)).toLocaleString() : "NA") }
        }
      }
]