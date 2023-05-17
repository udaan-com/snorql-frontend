import React, { FunctionComponent, useState } from "react";
import { Link } from "react-router-dom";
import { Fetcher } from "../../../common/components/Fetcher";
import { Box, Typography, Paper, Table, TableBody, TableRow, TableCell, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import { Database, DatabaseType } from "../../models";
import { SQLService } from "../../services/SQLService";
import makeStyles from '@mui/styles/makeStyles';
import { formatDbName, getTierAndCapacity } from "../DatabaseListScreen";

interface OverviewScreenProps {
  databaseName: string;
  databaseType: DatabaseType;
}

export const OverviewScreen: FunctionComponent<OverviewScreenProps> = (
  props
) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      toolbar: theme.mixins.toolbar,

      content: {
        flexGrow: 1,
        padding: theme.spacing(3),
      },
    })
  );

  const classes = useStyles();
  const [dbDetails, setDbDetails] = useState<Database | undefined>(undefined);

  const setDatabaseDetails = (r: Database | undefined) => {
    if (r != undefined) {
      let db = r;
      const formattedDBDetails = getTierAndCapacity(
        props.databaseType,
        r.skuName,
        r.capacity,
        r.tier,
        r.family
      );
      db.tier = formattedDBDetails.tier;
      db.capacity = formattedDBDetails.capacity;
      setDbDetails(db);
    }
  };
  const getRgId = (name: string, replicaName: string): string => {
    const value = name.split("/servers");
    return `${value[0]}/servers/${replicaName}`;
  };
  const getServerType = (): string => {
    if(dbDetails?.type.toLowerCase().includes("postgre")) {
      return "postgres"
    } else {
      return "sqlserver"
    }
  }

  return (
    <Box
      className={[classes.content, classes.toolbar].join(" ")}
      mt={10}
      alignItems={"center"}
      justifyContent={"center"}
      paddingTop={5}
    >
      <Paper>
        <Box padding={2}>
          <Fetcher
            fetchData={() => SQLService.getDatabaseDetail(props.databaseName)}
            onFetch={(r) => setDatabaseDetails(r)}
          >
            {dbDetails !== undefined && dbDetails.name ? (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>{dbDetails.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tier</TableCell>
                    <TableCell>{dbDetails.tier}</TableCell>
                  </TableRow>
                  {props.databaseType == DatabaseType.POSTGRES && (
                    <>
                      <TableRow>
                        <TableCell>Capacity</TableCell>
                        <TableCell>{dbDetails.capacity}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Storage</TableCell>
                        <TableCell>{dbDetails.storage} GiB</TableCell>
                      </TableRow>
                    </>
                  )}
                  {props.databaseType == DatabaseType.SQLSERVER && (
                    <>
                      <TableRow>
                        <TableCell>Capacity</TableCell>
                        <TableCell>{dbDetails.capacity}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Kind</TableCell>
                        <TableCell>{dbDetails.kind}</TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>{dbDetails.location}</TableCell>
                  </TableRow>
                  {props.databaseType == DatabaseType.POSTGRES &&
                    dbDetails.highAvailability && (
                      <TableRow>
                        <TableCell>High Availability</TableCell>
                        <TableCell>
                          {dbDetails.highAvailability.mode} |{" "}
                          {dbDetails.highAvailability.state}
                        </TableCell>
                      </TableRow>
                    )}
                  {props.databaseType == DatabaseType.SQLSERVER &&
                    dbDetails.readReplicaDbName && (
                      <TableRow>
                        <TableCell>Read Replica</TableCell>
                        <TableCell>Enabled</TableCell>
                      </TableRow>
                    )}
                  {dbDetails.geoReplicaProperties &&
                    dbDetails.geoReplicaProperties.dbRole && (
                      <TableRow>
                        <TableCell>DB Role</TableCell>
                        <TableCell>
                          {dbDetails.geoReplicaProperties.dbRole}
                        </TableCell>
                      </TableRow>
                    )}
                  {dbDetails.geoReplicaProperties &&
                    dbDetails.geoReplicaProperties.dbRole == "PRIMARY" &&
                    dbDetails.geoReplicaProperties.secondaryReplicas.map(
                      (i, index) => {
                        return (
                          <TableRow>
                            {index == 0 && (
                              <TableCell>Link to Geo Replicas</TableCell>
                            )}
                            <TableCell>
                              <Link
                                target="_blank"
                                to={{
                                  pathname: `/databases/${getServerType()}/${formatDbName(
                                    i
                                  )}/overview`,
                                  state: { rgid: getRgId(dbDetails.name, i) },
                                }}
                              >
                                {i}
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  {dbDetails &&
                    dbDetails.geoReplicaProperties &&
                    dbDetails.geoReplicaProperties.dbRole == "GEO_REPLICA" &&
                    dbDetails.geoReplicaProperties.primaryDbName && (
                      <TableRow>
                        <TableCell>Link to Primary</TableCell>
                        <TableCell>
                          <Link
                            target="_blank"
                            to={{
                              pathname: `/databases/${getServerType()}/${formatDbName(
                                dbDetails.geoReplicaProperties!!.primaryDbName
                              )}/overview`,
                              state: {
                                rgid: getRgId(
                                  dbDetails.name,
                                  dbDetails.geoReplicaProperties!!.primaryDbName
                                ),
                              },
                            }}
                          >
                            {dbDetails.geoReplicaProperties.primaryDbName}
                          </Link>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            ) : (
              <Typography>No records found</Typography>
            )}
          </Fetcher>
        </Box>
      </Paper>
    </Box>
  );
};
