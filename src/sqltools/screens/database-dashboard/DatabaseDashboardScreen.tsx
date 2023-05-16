import React, { FunctionComponent, useMemo, useState } from "react";
import {
  Route,
  Switch,
  RouteComponentProps,
  useLocation,
} from "react-router-dom";
import SideDrawer from "../../components/SideDrawer";
import { UserRoleScreen } from "./UserRoleScreen";
import { Menus, Database, DatabaseType } from "../../models";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useParams } from "react-router";
import { OverviewScreen } from "./OverviewScreen";
import PeopleIcon from "@mui/icons-material/People";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import DataUsage from "@mui/icons-material/DataUsage";
import TableUsage from "@mui/icons-material/ViewList";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BugReportIcon from "@mui/icons-material/BugReport";
import StorageIcon from "@mui/icons-material/Storage";
import { DebuggingScreen } from "./debug-level/DebuggingScreen";
import { ActiveQueryLandingScreen } from "./active-queries/ActiveQueryLandingScreen";
import { SQLService } from "../../services/SQLService";
import { ErrorMessageCard } from "../../components/ErrorMessageCard";
import { ConfigureDb } from "../../components/ConfigureDb";
import { IndexStatsScreen } from "./index-stats/IndexStatsScreen";
import { ActiveDDLScreen } from "./active-ddl/ActiveDDLScreen";
import { DatabaseLevelScreen } from "./db-level/DatabaseLevelScreen";
import { TableLevelScreen } from "./table-level/TableLevelScreen";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import { AlertingDashboard } from "./alerting/AlertingDashboard";
import { ComputeUtilizationScreen } from "./compute-utilization/ComputeUtilizationScreen";
import { DatabaseOptimizationLandingScreen } from "./database-optimization/DatabaseOptimizationLandingScreen";
import { DbMonitoringLandingScreen } from "./database-monitoring/DbMonitoringLandingScreen";
import DescriptionIcon from "@mui/icons-material/Description";

export enum MenuTitle {
  ACCESS_CONTROL = "Access Control",
  PERFORMANCE = "Performance",
  STORAGE = "Storage",
}
export enum MenuText {
  OVERVIEW = "Overview",
  USER_ROLES = "User Roles",
  ACTIVE_QUERIES = "Active Queries",
  INDEX_STATS = "Index Stats",
  DATABASE_OPTIMIZATION = "Database Optimization",
  ACTIVE_DDL = "Active DDL",
  DEBUG_SESSION = "Debug Session",
  COMPUTE_UTILIZATION = "Compute Utilization",
  QUERY_STORE = "Query Store",
  ANALYZE_QUERY_PLAN = "Analyze Query Plan",
  DATABASE_LEVEL = "Database Level",
  TABLE_LEVEL = "Table Level",
  DATABASE_MONITORING = "Database Monitoring",
}

export const DatabaseDashboardScreen: FunctionComponent<RouteComponentProps> = (
  props
) => {
  const { databaseType, databaseName } = useParams<{
    databaseType: DatabaseType;
    databaseName: string;
  }>();
  const [isConfigured, setIsConfigured] = useState<Boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<Boolean>(false);
  const formattedDbName = databaseName.replace("$$$", "/");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [databaseDetail, setDatabaseDetail] = useState<Database>();

  const baseurl = props.match.url;

  const getMenus = (databaseType: string): Menus[] => {
    if (databaseType === DatabaseType.SQLSERVER)
      return [
        {
          title: "",
          items: [
            {
              text: MenuText.OVERVIEW,
              icon: <DescriptionIcon />,
              path: `${baseurl}/overview`,
            },
          ],
        },
        {
          title: MenuTitle.ACCESS_CONTROL,
          items: [
            {
              text: MenuText.USER_ROLES,
              icon: <PeopleIcon />,
              path: `${baseurl}/user-roles`,
            },
          ],
        },
        {
          title: MenuTitle.PERFORMANCE,
          items: [
            {
              text: MenuText.ACTIVE_QUERIES,
              icon: <QueryBuilderIcon />,
              path: `${baseurl}/active-queries`,
            },
            {
              text: MenuText.INDEX_STATS,
              icon: <AssessmentIcon />,
              path: `${baseurl}/index-stats`,
            },
            {
              text: MenuText.DATABASE_OPTIMIZATION,
              icon: <StorageIcon />,
              path: `${baseurl}/database-optimization`,
            },
            {
              text: MenuText.DATABASE_MONITORING,
              icon: <VisibilityIcon />,
              path: `${baseurl}/database-monitoring`,
            },
            {
              text: MenuText.ACTIVE_DDL,
              icon: <SearchIcon />,
              path: `${baseurl}/active-ddl`,
            },
            {
              text: MenuText.DEBUG_SESSION,
              icon: <BugReportIcon />,
              path: `${baseurl}/debug-session`,
            },
            {
              text: "Compute Utilization",
              icon: <AssessmentIcon />,
              path: `${baseurl}/compute-utilization`,
            },
          ],
        },
        {
          title: MenuTitle.STORAGE,
          items: [
            {
              text: MenuText.DATABASE_LEVEL,
              icon: <DataUsage />,
              path: `${baseurl}/db-level`,
            },
            {
              text: MenuText.TABLE_LEVEL,
              icon: <TableUsage />,
              path: `${baseurl}/table-level`,
            },
          ],
        },
        {
          title: "Alerting",
          items: [
            {
              text: "Alerts",
              icon: <AddAlertIcon />,
              path: `${baseurl}/alerting`,
            },
          ],
        },
      ];
    else if (databaseType == DatabaseType.POSTGRES)
      return [
        {
          title: "",
          items: [
            {
              text: MenuText.OVERVIEW,
              icon: <DescriptionIcon />,
              path: `${baseurl}/overview`,
            },
          ],
        },
        {
          title: MenuTitle.PERFORMANCE,
          items: [
            {
              text: MenuText.ACTIVE_QUERIES,
              icon: <QueryBuilderIcon />,
              path: `${baseurl}/active-queries`,
            },
          ],
        },
      ];
    else return [];
  };

  const menus: Menus[] = getMenus(databaseType);

  const checkDbExists = () => {
    if (databaseType && databaseName) {
      SQLService.dbExists(databaseType, formattedDbName)
        .then((r) => {
          setIsConfigured(r);
        })
        .catch((e) => {
          setErrorMessage(`Failed to check db existence, error: ${e}`);
        });
    } else {
      setErrorMessage(`[ERROR] Invalid database name`);
    }
  };

  const fetchDatabaseDetail = () => {
    if (databaseName) {
      SQLService.getDatabaseDetail(formattedDbName)
        .then((r) => {
          r && setDatabaseDetail(r);
        })
        .catch((e) => {
          setErrorMessage(`Failed to check db existence, error: ${e}`);
        });
    } else {
      setErrorMessage(`[ERROR] Invalid database name`);
    }
  };

  useMemo(() => {
    checkDbExists();
    fetchDatabaseDetail();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <SideDrawer
        menus={menus}
        navbarTitle="SQL Database Dashboard"
        dbName={formattedDbName}
      />
      {errorMessage && <ErrorMessageCard text={errorMessage} />}
      {!errorMessage && !isConfigured && (
        <ConfigureDb
          dbType={databaseType}
          db={formattedDbName}
          setIsConfigured={setIsConfigured}
          setErrorMessage={setErrorMessage}
        />
      )}
      {!errorMessage && isConfigured && (
        <Switch>
          <Route
            path={baseurl + "/overview"}
            exact
            render={(props) => (
              <OverviewScreen
                {...props}
                databaseName={formattedDbName}
                databaseType={databaseType}
              />
            )}
          />
          <Route
            path={baseurl + "/user-roles"}
            exact
            render={(props) => (
              <UserRoleScreen
                {...props}
                databaseName={formattedDbName}
                databaseType={databaseType}
                setErrorMessage={setErrorMessage}
                setIsOnboarded={setIsOnboarded}
              />
            )}
          />
          <Route
            path={baseurl + "/debug-session"}
            exact
            render={(props) => (
              <DebuggingScreen {...props} databaseName={formattedDbName} />
            )}
          />
          <Route
            path={baseurl + "/active-queries"}
            exact
            render={(props) => (
              <ActiveQueryLandingScreen
                {...props}
                databaseName={formattedDbName}
                databaseType={databaseType}
                isDbConfigured={isConfigured}
                baseurl={baseurl}
              />
            )}
          />
          <Route
            path={baseurl + "/index-stats"}
            exact
            render={(props) => (
              <IndexStatsScreen {...props} databaseName={formattedDbName} />
            )}
          />
          <Route
            path={baseurl + "/active-ddl"}
            exact
            render={(props) => (
              <ActiveDDLScreen {...props} databaseName={formattedDbName} />
            )}
          />
          <Route
            path={baseurl + "/alerting"}
            exact
            render={(props) => (
              <AlertingDashboard {...props} databaseName={formattedDbName} />
            )}
          />
          {databaseDetail && (
            <Route
              path={baseurl + "/compute-utilization"}
              exact
              render={(props) => (
                <ComputeUtilizationScreen
                  {...props}
                  databaseName={formattedDbName}
                  databaseDetail={databaseDetail}
                />
              )}
            />
          )}
          <Route
            path={baseurl + "/database-optimization"}
            exact
            render={(props) => (
              <DatabaseOptimizationLandingScreen
                {...props}
                databaseName={formattedDbName}
              />
            )}
          />
          <Route
            path={baseurl + "/database-monitoring"}
            exact
            render={(props) => (
              <DbMonitoringLandingScreen
                {...props}
                databaseName={formattedDbName}
              />
            )}
          />

          {/* storage */}
          <Route
            path={baseurl + "/db-level"}
            exact
            render={(props) => (
              <DatabaseLevelScreen {...props} databaseName={formattedDbName} />
            )}
          />
          <Route
            path={baseurl + "/table-level"}
            exact
            render={(props) => (
              <TableLevelScreen {...props} databaseName={formattedDbName} />
            )}
          />
        </Switch>
      )}
    </div>
  );
};
