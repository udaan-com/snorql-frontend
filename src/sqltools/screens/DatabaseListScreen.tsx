import React, { FunctionComponent, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Fetcher } from "../../common/components/Fetcher";
import { useHistory } from "react-router-dom";
import { SQLService } from "../services/SQLService";
import { Database, DatabaseType } from "../models";
import { selectDatabaseEvent } from "../tracking/TrackEventMethods";
import {useAdminEmail} from "../../hooks";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import { dbListColumns } from "./dbListColumns";

interface DbList extends Database {
  hasReadReplica: string;
  hasGeoReplica: string;
}

export const getTierAndCapacity = (
  databaseType: string,
  skuName: string,
  capacity: string,
  tier: string,
  family?: string
): { capacity: string; tier: string } => {
  if (databaseType == DatabaseType.SQLSERVER) {
    const DTUBasedTiers = ["Basic", "Standard", "Premium"];
    const vCoreBasedTiers = [
      "GeneralPurpose",
      "BusinessCritical",
      "Hyperscale",
    ];
    if (skuName == "ElasticPool") {
      return { capacity: "N/A", tier: `Elastic${tier}` };
    } else if (DTUBasedTiers.includes(tier)) {
      return { capacity: `${capacity} DTUs`, tier: tier };
    } else if (vCoreBasedTiers.includes(tier)) {
      return { capacity: `${capacity} vCores`, tier: `${tier}:${family}` };
    } else {
      return { capacity, tier };
    }
  } else if (databaseType == DatabaseType.POSTGRES) {
    return {capacity: `${capacity} vCores`, tier: `${tier}:${skuName}`}
  } else {
    return {capacity, tier}
  }
};
export const formatDbName = (name: string): string => {
  return name.replaceAll("/", "$$$$$");
};

export const DatabaseListScreen: FunctionComponent = () => {
  const [databases, setDatabases] = useState<DbList[]>([]);
  const history = useHistory();
  const email = useAdminEmail();
  const cols = dbListColumns();

  const getDatabaseType = (type: string) => {
    if (type == "Microsoft.Sql/servers/databases") return DatabaseType.SQLSERVER
    else if (type == "Microsoft.DBforPostgreSQL/flexibleServers") return DatabaseType.POSTGRES
    else return "unknown"
  }

  const handleOnClick = (name: string, type: string, id: string) => {
    if (type == "Microsoft.Sql/servers/databases")
      history.push({
        pathname: `databases/sqlserver/${formatDbName(name)}/overview`,
        state: { rgid: id },
      });
    else if (type == "Microsoft.DBforPostgreSQL/flexibleServers")
      history.push({
        pathname: `databases/postgres/${formatDbName(name)}/overview`,
        state: { rgid: id },
      });
    selectDatabaseEvent({ dbName: name, userEmail: email });
  };
  const options: MUIDataTableOptions = {
    filter: true,
    download: false,
    print: false,
    selectableRows: "none",
    onRowClick: (rowData, meta) =>
      handleOnClick(rowData[0], rowData[1], rowData[6]),
    rowsPerPage: 500,
    rowsPerPageOptions: [100, 500],
  };
  return (
    <Box padding={2} mt={2}>
      <Fetcher
        fetchData={() => SQLService.getDatabases()}
        onFetch={(r) => {
          if (r !== undefined && r.length > 0) {
            let value: DbList[] = r.map((x: Database) => {
              let formattedValues = getTierAndCapacity(
                getDatabaseType(x.type),
                x.skuName,
                x.capacity,
                x.tier,
                x.family
              );
              return {
                ...x,
                isShow: true,
                hasReadReplica: x.readReplicaDbName ? "Yes" : "No",
                hasGeoReplica: x.geoReplicaProperties ? "Yes" : "No",
                tier: formattedValues.tier,
                capacity: formattedValues.capacity,
              };
            });
            setDatabases(value);
          }
        }}
      >
        {databases.length > 0 && (
          <MUIDataTable
            columns={cols}
            data={databases}
            options={options}
            title={
              <strong>
                Please click on a database to proceed to dashboard
              </strong>
            }
          />
        )}
        {!databases.length && (
          <Box px={2} py={4}>
            <Typography>No records found</Typography>
          </Box>
        )}
      </Fetcher>
    </Box>
  );
};
