import React from "react";
import { LinearProgress } from "@mui/material";
import { StatementDialog } from "../../../components/StatementDialog";
import { Route } from "react-router";
import { Link } from "react-router-dom";
import { DatabaseType } from "../../../models";

export const getColumns = (
  db: string,
  baseurl?: string,
  databaseType: DatabaseType = DatabaseType.SQLSERVER
) =>
  databaseType == DatabaseType.SQLSERVER
    ? [
        {
          name: "sessionId",
          label: "Session Id",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
            customBodyRender: (colData: any) => {
              if (baseurl)
                return (
                  <Link to={baseurl + "/debug-session?sessionId=" + colData}>
                    {colData}
                  </Link>
                );
              else return { colData };
            },
          },
        },
        {
          name: "status",
          label: "Status",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "blockedBy",
          label: "Blocked By",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "percentComplete",
          label: "Percent Complete (%)",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
            display: false,
            customBodyRender: (colArrayData: any) => (
              <>
                <LinearProgress variant="determinate" value={colArrayData} />
                {colArrayData}
              </>
            ),
          },
        },
        {
          name: "waitStatus",
          label: "Wait Status",
          options: {
            display: true,
            filter: false,
            sort: false,
            setCellProps: () => ({
              style: {
                minWidth: "100px",
                maxWidth: "350px",
                padding: 0,
                whiteSpace: "pre",
              },
            }),
            customBodyRender: (value: any, tableMeta: any) => {
              const rowData = tableMeta.rowData;
              return (
                <ul>
                  <li>wait type:{rowData[5] ? rowData[5] : "N/A"}</li>
                  <li>
                    wait resource:
                    {rowData[6] ? (
                      <StatementDialog statement={rowData[6]} />
                    ) : (
                      "N/A"
                    )}
                  </li>
                  <li>wait time:{rowData[7] ? rowData[7] : "N/A"}</li>
                </ul>
              );
            },
          },
        },
        {
          name: "waitType",
          label: "Wait Type",
          options: {
            display: false,
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "waitResource",
          label: "Wait Resource",
          options: {
            display: false,
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "waitTime",
          label: "Wait Time",
          options: {
            display: false,
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "resourceUtilisation",
          label: "Resource utilisation",
          options: {
            display: true,
            filter: false,
            sort: false,
            setCellProps: () => ({
              style: {
                minWidth: "200px",
                maxWidth: "200px",
                paddingLeft: "15px",
                whiteSpace: "pre",
              },
            }),
            customBodyRender: (value: any, tableMeta: any) => {
              const rowData = tableMeta.rowData;
              return (
                <ul>
                  <li>cpu time:{rowData[9]}</li>
                  <li>logical reads:{rowData[10]}</li>
                  <li>physical reads:{rowData[11]}</li>
                  <li>physical writes:{rowData[12]}</li>
                </ul>
              );
            },
          },
        },
        {
          name: "cpuTime",
          label: "CPU Time",
          options: {
            display: false,
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "logicalReads",
          label: "Logical Reads",
          options: {
            display: false,
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "reads",
          label: "Reads",
          options: {
            display: false,
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "writes",
          label: "Writes",
          options: {
            display: false,
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "elapsedTime",
          label: "Elapsed Time",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "queryText",
          label: "Query Text",
          options: {
            display: true,
            filter: false,
            sort: false,
            setCellProps: () => ({ style: { padding: 0 } }),
            customBodyRender: (value: any) => {
              return <StatementDialog statement={value} />;
            },
          },
        },
        {
          name: "storedProc",
          label: "Stored Procedure",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
            display: false,
          },
        },
        {
          name: "command",
          label: "Command",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
            display: false,
          },
        },
        {
          name: "loginName",
          label: "Login Name",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "hostName",
          label: "Host Name",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "programName",
          label: "Program Name",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "hostProcessId",
          label: "Host Process Id",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
            display: false,
          },
        },
        {
          name: "lastRequestEndTime",
          label: "Last Request End Time",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "login_time",
          label: "Login Time",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "openTransactionCount",
          label: "Open Transaction Count",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
      ]
    : [
        {
          name: "pid",
          label: "Process ID",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "user",
          label: "User",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "query",
          label: "Query Text",
          options: {
            display: true,
            filter: false,
            sort: false,
            setCellProps: () => ({ style: { padding: 0 } }),
            customBodyRender: (value: any) => {
              return value ? (
                <StatementDialog statement={value} />
              ) : (
                <div></div>
              );
            },
          },
        },
        {
          name: "queryTime",
          label: "Query Time",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "queryStart",
          label: "Query Start Time",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "state",
          label: "State",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "applicationName",
          label: "Application Name",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "clientHostName",
          label: "Client Host Name",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "waitEventType",
          label: "Wait Event Type",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "waitEvent",
          label: "Wait Event",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
        {
          name: "backendType",
          label: "Backend Type",
          options: {
            filter: true,
            sort: true,
            setCellProps: () => ({ style: { whiteSpace: "pre" } }),
          },
        },
      ];

export const getIMetricTriggerColumns = (metricId: string) => [
  {
    name: "triggerName",
    label: "Trigger Name",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "description",
    label: "Description",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "Configured By",
    label: "configuredBy",
    options: {
      display: true,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "startTime",
    label: "Start Time",
    options: {
      display: true,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: string | undefined) => {
        return value ? new Date(value).toLocaleString() : "NA";
      },
    },
  },
  {
    name: "endTime",
    label: "End Time",
    options: {
      display: true,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: string | undefined) => {
        return value ? new Date(value).toLocaleString() : "NA";
      },
    },
  },
  {
    name: "nextFireTime",
    label: "Next Fire Time",
    options: {
      display: true,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: string | undefined) => {
        return value ? new Date(value).toLocaleString() : "NA";
      },
    },
  },
];

export const getLongRunningQueriesTriggerConfigColumns = () => [
  {
    name: "triggerName",
    label: "Trigger Name",
    options: {
      display: false,
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "description",
    label: "Trigger Description",
    options: {
      filter: true,
      sort: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "configuredByName",
    label: "Configured By",
    options: {
      display: false,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "configuredByEmail",
    label: "Configured By (Email)",
    options: {
      display: true,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "repeatInterval",
    label: "Repeat Interval",
    options: {
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      display: true,
      customBodyRender: (repeatInterval: any) => {
        return repeatInterval + " seconds";
      },
    },
  },
  {
    name: "elapsedTime",
    label: "Query Elapsed Time",
    options: {
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      display: true,
      customBodyRender: (elapsedTime: any) => {
        return elapsedTime + " seconds";
      },
    },
  },
  {
    name: "startTime",
    label: "Start Time",
    options: {
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      display: false,
      customBodyRender: (value: string | undefined) => {
        return value ? new Date(value).toLocaleString() : "NA";
      },
    },
  },
  {
    name: "endTime",
    label: "End Time",
    options: {
      display: true,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: string | undefined) => {
        return value ? new Date(value).toLocaleString() : "NA";
      }, // (value) ? UTCToDateString(value) : 'NA' }
    },
  },
  {
    name: "nextFireTime",
    label: "Next Fire Time",
    options: {
      display: false,
      filter: false,
      sort: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: string | undefined) => {
        return value ? new Date(value).toLocaleString() : "NA";
      },
    },
  },
];

const UTCToDateString = (utcTime?: string): string => {
  if (utcTime) {
    let ISTTime = new Date(utcTime);
    ISTTime.setHours(ISTTime.getHours() + 5);
    ISTTime.setMinutes(ISTTime.getMinutes() + 30);
    return ISTTime.toISOString().slice(0, 16);
  } else {
    return "";
  }
};

// export const getActiveQueriesHistoricalColumns = () => [
//   {
//     name: "runId",
//     label: "Run Id",
//     options: {
//       filter: true,
//       sort: true,
//       setCellProps: () => ({style: {whiteSpace:"pre"}}),
//     }
//   },
//   {
//     name: "timestamp",
//     label: "Timestamp",
//     options: {
//       filter: true,
//       sort: true,
//       setCellProps: () => ({style: {whiteSpace:"pre"}}),
//     }
//   },
//   {
//     name: "source",
//     label: "Source",
//     options: {
//       filter: true,
//       sort: true,
//       setCellProps: () => ({style: {whiteSpace:"pre"}}),
//     }
//   },
//   {
//     name: "metricInput",
//     label: "Metric Input",
//     options: {
//       display: true,
//       filter: false,
//       sort: false,
//       setCellProps: () => ({style: {whiteSpace:"pre"}}),
//     }
//   },
//   {
//     name: "metricOutput",
//     label: "Metric Output",
//     options: {
//       display: true,
//       filter: false,
//       sort: false,
//       setCellProps: () => ({style: {whiteSpace:"pre"}}),
//     }
//   }
// ]
