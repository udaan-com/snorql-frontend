import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { IMetricAlert } from "../models";

interface Props {
  alertData: IMetricAlert;
}

export const AlertDetailsTable: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { alertData } = props;

  const alertDataEntries = Object.entries(alertData);

  const ignoreColumns = [
    "alertId",
    "alertName",
    "description",
    "watchIntervalInSeconds",
    "configuredByName",
    "configuredByEmail",
    "startTime",
    "endTime",
    "nextFireTime",
    "databaseName",
    "triggerGroup",
    "severity",
  ];

  return (
    <Box paddingRight={8} paddingBottom={4} paddingLeft={4}>
      <div style={{ width: "100%" }}>
        {alertDataEntries.length ? (
          <>
          <Table>
            <TableHead>
              {Object.entries(alertData).map((x, y) => {
                if (ignoreColumns.indexOf(x[0]) == -1) {
                  return (
                    <TableCell align="center" key={y}>
                      {x[0]
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, function (str) {
                          return str.toUpperCase();
                        })}
                    </TableCell>
                  );
                }
              })}
            </TableHead>
            {/* <TableBody> */}
            <TableRow>
              {Object.entries(alertData).map((x, y) => {
                if (ignoreColumns.indexOf(x[0]) == -1) {
                  return (
                    <TableCell align="center" key={y}>
                      {x[1] ? x[1] : "-"}
                    </TableCell>
                  );
                }
              })}
            {/* </TableBody> */}
            </TableRow>
          </Table>
          </>
        ) : (
          <Typography>No records found</Typography>
        )}
      </div>
    </Box>
  );
};
