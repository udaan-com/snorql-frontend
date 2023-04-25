import { APIClient } from "../../common/fetch";
import { INFRA_PROBS_BASE_PATH } from "../constants";
import * as m from "../models";
import { DatabaseType } from "../models";
import {
  ITableIndex,
  ITableName,
} from "../screens/database-dashboard/index-stats/IndexStatsColumn";
import {CustomError} from "../CustomError";
const { fetch } = new APIClient(`/api${INFRA_PROBS_BASE_PATH}`);

const backendServiceUrl = "http://localhost:8020"


export const fetchFromService = (url: string, params: {} = {}) => {
  // @ts-ignore
  return fetch(backendServiceUrl + url, params)
}


export class SQLService {

  // DATABASE APIs
  static getDatabases(): Promise<m.Database[]> {
    const newStr = `/database/all`
    return fetchFromService(newStr, {
      headers: {
        "content-type": `application/json`,
      }
    })
      .then((r) => {
        if (r.status !== 200) {
          return r.text().then((t) => {
            throw new Error(`HTTP ${r.status}: ${t}`);
          });
        }
        return r;
      })
      .then((r) => r.json());
  }

  static async getDatabaseDetail(
    dbName: string
  ): Promise<m.Database | undefined> {
    try {
      const dbList: m.Database[] = await this.getDatabases();
      return dbList.find((db) => db.name == dbName);
    } catch (error) {
      throw new Error(`HTTP ${error}`);
    }
  }




  static getDbUsers(dbName: string): Promise<m.IUserRoleMetricResponse | any> {
    const metricId = "accessControl_userRole";
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = { "metricId": metricId, "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false  }
    return this.postMetrics("userRole", payload);
  }

  static getDbActiveQueries(
    dbName: string,
    dbType: DatabaseType = DatabaseType.SQLSERVER
  ): Promise<m.IActiveQueryMetricResponse | any> {
    const metricId = (dbType == DatabaseType.SQLSERVER) ? "performance_activeQueries" : "postgres_performance_activeQueries";
    const metricPeriod = "REAL_TIME";

    const payload = { "metricId": metricId, "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false  }
    return this.postMetrics("activeQueries", payload, dbType)
  }


  static dbExists(dbType: DatabaseType = DatabaseType.SQLSERVER, dbName: string): Promise<Boolean> {
    return fetchFromService(`/database/dbExists?databaseName=${dbName}&databaseType=${dbType}`, {
      method: "POST",
      headers: {
        "content-type": `application/json`,
      },
    }).then((r) => {
      if (r.status !== 200) {
        return false;
      }
      return r.json();
    });
  }

  static getDbLongRunningQueries(
    dbName: string,
    elapsedTimeParam: number
  ): Promise<m.ILongRunningQueryMetricResponse | any> {
    const metricId = "performance_longRunningQueries";
    const metricPeriod = "REAL_TIME";
    const elapsedTimeInMillisec = elapsedTimeParam * 1000;

    const payload: m.ILongRunningQueryMetricInput = {
      "metricId": metricId,
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "recommendationRequired": false,
      "elapsedTime": elapsedTimeInMillisec.toString()
    }
    return this.postMetrics("longRunningQueries", payload);
  }

  static getDbBlockingQueries(
    dbName: string
  ): Promise<m.IBlockingTreeMetricResponse | any> {
    const metricId = "performance_blockedQueries";
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = { "metricId": metricId, "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false  }
    return this.postMetrics("blockedQueries", payload);
  }

  static getIndexStats(
    dbName: string,
    tableName: string,
    indexName: string
  ): Promise<m.IIndexStatsMetricResponse | any> {
    const metricPeriod = "REAL_TIME";
    if (indexName && tableName) {
      const payload: m.IIndexStatsInput = {
        "metricPeriod": metricPeriod,
        "databaseName": dbName,
        "recommendationRequired": false,
        "tableName": tableName,
        "indexName": indexName
      }
      return this.postMetrics("indexStats", payload);
    } else {
      return Promise.resolve([]);
    }
  }

  static getIndexFragmentation(
    dbName: string,
    mode: m.INDEX_PHYSICAL_STATS_MODES
  ): Promise<m.IndexFragmentationmetricResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IndexFragmentationMetricInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "recommendationRequired": true,
      "mode": mode
    }
    return this.postMetrics("indexFragmentation", payload);
  }

  static getIndexRedundancy(
    dbName: string
  ): Promise<m.IndexRedundancyMetricResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = { "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": true  }
    return this.postMetrics("indexRedundancy", payload)
  }

  static getActiveDDL(
    dbName: string
  ): Promise<m.IActiveDDLMetricResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "recommendationRequired": false,
    }
    return this.postMetrics("activeDDL", payload);
  }

  static getComputeUtilization(
    dbName: string
  ): Promise<m.IComputeUtilizationMetricResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "recommendationRequired": false,
    }
    return this.postMetrics("computeUtilization", payload);
  }

  static getTableList(dbName: string): Promise<ITableName | any> {
    const payload = { "dbName": dbName }
    return this.postMetrics("getTableList", payload);
  }

  static getTableIndex(
    dbName: string,
    tableName: string
  ): Promise<ITableIndex | any> {
    const payload = {
      "dbName": dbName, "tableName": tableName,
    }
    return this.postMetrics("getTableIndex", payload);
  }

  static getDatabaseStorageSize(
    dbName: string
  ): Promise<m.IDatabseStorageSizeResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IDatabseStorageSizeInput = { "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false, "dbName": dbName.split("/")[1]  }
    return this.postMetrics("dbStorage", payload);
  }

  static getDatabaseTableSize(
    dbName: string
  ): Promise<m.IDatabaseTableSizeResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = { "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false  }
    return this.postMetrics("dbTableStorage", payload);
  }

  static getDatabaseTopIndex(
    dbName: string
  ): Promise<m.IDatabaseTopIndexResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = { "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false  }
    return this.postMetrics("dbIndex", payload);
  }

  static getTableSize(
    dbName: string,
    tableName: string
  ): Promise<m.ITableSizeResponse | any> {
    const metricPeriod = "REAL_TIME";
    if (tableName != "") {
      const payload: m.ITableSizeInput = {
        "metricPeriod": metricPeriod,
        "databaseName": dbName,
        "recommendationRequired": false,
        "tableName": tableName
      }
      return this.postMetrics("tableStorage", payload);
    } else {
      return Promise.resolve([]);
    }
  }

  static getTableUnusedIndex(
    dbName: string,
    tableName: string,
    recommendationRequired: Boolean = true
  ): Promise<m.ITableUnusedIndexResponse | any> {
    const metricPeriod = "REAL_TIME";
    if (tableName != "") {
      const payload: m.ITableSizeInput = { "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": recommendationRequired ,"tableName": tableName}
      return this.postMetrics("tableUnusedIndex", payload);
    } else {
      return Promise.resolve([]);
    }
  }

  static getPVS(dbName: string): Promise<m.IPVSResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = { "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false}
    return this.postMetrics("pvs", payload);
  }

  static getDatabaseGrowth(
    dbName: string
  ): Promise<m.IDatabaseGrowthResponse | any> {
    const metricPeriod = "REAL_TIME";
    let tokens =  dbName.split("/")
    let databaseName = tokens[0]+"/master"
    let dbNameForGrowth = tokens[1]
    const payload: m.IDatabaseGrowthInput = { "metricPeriod": metricPeriod, "databaseName": databaseName, "recommendationRequired": false ,"dbNameForGrowth":dbNameForGrowth}
    return this.postMetrics("dbGrowth", payload);
  }

  static getTableSchema(
    dbName: string,
    tableName: string
  ): Promise<m.ITableSchemaResponse | any> {
    const metricPeriod = "REAL_TIME";
    if (tableName != ""){
      const payload: m.ITableSchemaInput = { "metricPeriod": metricPeriod, "databaseName": dbName, "recommendationRequired": false ,"tableName": tableName }
      return this.postMetrics("tableSchema", payload);
    } else {
      return Promise.resolve([]);
    }
  }

  static getSessionLocks(
    dbName: string,
    sessionId: number
  ): Promise<m.ISessionLocksResponse | any> {
    const metricPeriod = "REAL_TIME";
    if (sessionId) {
      const payload: m.ISessionInput = {
        "metricPeriod": metricPeriod,
        "databaseName": dbName,
        "recommendationRequired": false,
        "sessionId": sessionId
      }
      return this.postMetrics("sessionLocks", payload)
    } else {
      return Promise.resolve([]);
    }
  }

  static getSessionLatestExecutedQuery(
    dbName: string,
    sessionId: number
  ): Promise<m.ISessionLatestExecutedQueryResponse | any> {
    const metricPeriod = "REAL_TIME";
    if (sessionId) {
      const payload: m.ISessionInput = {
        "metricPeriod": metricPeriod,
        "databaseName": dbName,
        "recommendationRequired": false,
        "sessionId": sessionId
      }
      return this.postMetrics("sessionLatestExecutedQuery", payload)
    } else {
      return Promise.resolve([]);
    }
  }

  static getSessionActiveQuery(
    dbName: string,
    sessionId: number
  ): Promise<m.ISessionActiveQueryMetricResponse | any> {
    const metricPeriod = "REAL_TIME";
    if (sessionId){
      const payload: m.ISessionInput =  { "metricPeriod":metricPeriod, "databaseName":dbName, "recommendationRequired": false, "sessionId": sessionId }
      return this.postMetrics("sessionActiveQuery", payload)
    } else {
      return Promise.resolve([]);
    }
  }

  static getQueryStore(
    dbName: string,
    startTime: string,
    endTime: string,
    sortKey: string,
    sortOrder: string
  ): Promise<m.IQueryStoreResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IQueryStoreInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "recommendationRequired": false,
      "startTime": startTime,
      "endTime": endTime,
      "sortKey": sortKey,
      "sortOrder": sortOrder
    }
    return this.postMetrics("queryStore", payload);
  }

  static getAnalyzeQueryPlan(
    dbName: string,
    startTime: string,
    endTime: string,
    queryId: string
  ): Promise<m.IAnalyzeQueryPlanResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IAnalyzeQueryPlanInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "recommendationRequired": false,
      "startTime": startTime,
      "endTime": endTime,
      "queryId": queryId
    }
    return this.postMetrics("analyzeQueryPlan", payload);
  }

  static getLogSpaceUsage(
    dbName: string
  ): Promise<m.ILogSpaceUsageResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IMetricInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "recommendationRequired": true
    }
    return this.postMetrics("logSpaceUsage", payload);
  }

  static getReadReplicationLag(
    dbName: string,
    replicaDbName: string
  ): Promise<m.IReadReplicationLagResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IReadReplicationLagInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "replicaDatabaseName": replicaDbName,
      "recommendationRequired": true
    }
    return this.postMetrics("readReplicationLag", payload);
  }

  static getGeoReplicaLag(
    dbName: string,
    primaryDatabaseName: string
  ): Promise<m.IGeoReplicaLagResponse | any> {
    const metricPeriod = "REAL_TIME";
    const payload: m.IGeoReplicaLagInput = {
      "metricPeriod": metricPeriod,
      "databaseName": dbName,
      "primaryDatabaseName": primaryDatabaseName,
      "recommendationRequired": true
    }
    return this.postMetrics("geoReplicaLag", payload);
  }

  static getMetricHistoricalData(
    metricId: string,
    dbName: string,
    payload: m.IMetricHistoricalDataFilter
  ): Promise<m.HistoricalDataResult | any> {
    if (dbName === "")
      return Promise.resolve([]);

    return fetchFromService(`/job/getHistoricalData?metricId=${metricId}&databaseName=${dbName}`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(payload)
    })
        .then(async (response) => {
          const result = await response.json();
          if(response.ok){
            return result
          } else {
            const message = result.errMessage ? result.errMessage : result.message;
            const code = result.code ? result.code : response.status;
            throw new CustomError(message, result.details, code);
          }
        }).catch((error) => {
          if(error.details) {
            return Promise.reject(error)
          }
          return Promise.reject(new CustomError(error.name, error.message))
        })
  }


  // Fetch all db metrics
  static fetchDbMetrics(weekStartDate: string): Promise<m.DbMetrics[] | any> {
    let payload = {
      "weekStartDate": weekStartDate
    }
    return this.postRequest('/db-analyzer/getDbMetrics', payload)
  }

  // Fetch all weeks
  static fetchWeeks(): Promise<m.DbMetricWeeks | any> {
    return this.getRequest(`/db-analyzer/getWeeks`)
  }

  private static postMetrics(metricUrl:string, payload:any, dbType: DatabaseType = DatabaseType.SQLSERVER):Promise<any> {
    return fetchFromService(`/${dbType}/sql-metric/${metricUrl}`,
        {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: JSON.stringify(payload),
        }
    ).then(async (response) => {
      const result = await response.json();
      if(response.ok){
        return result
      } else {
        const message = result.errMessage ? result.errMessage : result.message;
        const code = result.code ? result.code : response.status;
        throw new CustomError(message, result.details, code);
      }
    }).catch((error) => {
      if(error.details) {
        return Promise.reject(error)
      }
      return Promise.reject(new CustomError(error.name, error.message))
    })
  }

  static getRequest(url: string): Promise<any> {
    return this.wrappedRequest(url, 'GET')
  }

  static postRequest(url: string, payload: {}): Promise<any> {
    return this.wrappedRequest(url, 'POST', payload)
  }

  static wrappedRequest(url: string, method: string = 'GET', payload: {} = {}): Promise<any> {
    const params = {
      method: method,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      ...(method === "POST" ? {body: JSON.stringify(payload)}: {} )
    }
    console.log(params)

    return fetchFromService(`${url}`,params).then(async (response) => {
      const result = await response.json();
      if(response.ok){
        return result
      } else {
        const message = result.errMessage ? result.errMessage : result.message;
        const code = result.code ? result.code : response.status;
        throw new CustomError(message, result.details, code);
      }
    }).catch((error) => {
      if(error.details) {
        return Promise.reject(error)
      }
      return Promise.reject(new CustomError(error.name, error.message))
    })
  }
}
//
// axios({
//   url: '/' + cleanProxyPartial,
//   method: req.method,
//   headers: req.headers,
//   params: req.params,
//   data: req.body
// }).then(response => {
//   console.log(response)
//   res.send(response)
// })