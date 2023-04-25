import * as m from "../models";
import {fetchFromService, SQLService} from "./SQLService";


export class AlertService {
    // Add Active Queries Filter Alert
    static addActiveQueryAlert(
        payload: m.ActiveQueriesAlert
    ): Promise<boolean | any> {
        if (payload.databaseName) {
            return this.addAlertGeneric("activeQueryFilter", payload)
        } else {
            return Promise.resolve([]);
        }
    }

    // Add Database Used Space Alert
    static addDatabaseUsedSpaceAlert(
        payload: m.DatabaseUsedSpaceAlert
    ): Promise<boolean | any> {
        if (payload.databaseName && payload.dbName) {
            return this.addAlertGeneric("databaseUsedSpace", payload)
        } else {
            return Promise.resolve([]);
        }
    }

    // Add Index Fragmentation Alert
    static addIndexFragmentationAlert(
        payload: m.IndexFragmentationAlert
    ): Promise<boolean | any> {
        if (payload.databaseName && payload.mode) {
            return this.addAlertGeneric("indexFragmentation", payload)
        } else {
            return Promise.resolve([]);
        }
    }

    // Add Resource Utilization Alert
    static addResourceUtilizationAlert(
        payload: m.ResourceUtilizationAlert
    ): Promise<boolean | any> {
        if (
            payload.databaseName &&
            payload.resourceType &&
            payload.resourceUtilizationThreshold
        ) {
            return this.addAlertGeneric("resourceUtilization", payload)
        } else {
            return Promise.resolve([]);
        }
    }

    // Add Log Space Usage Alert
    static addLogSpaceUsageAlert(
        payload: m.LogSpaceUsageAlert
    ): Promise<boolean | any> {
        if (payload.databaseName && payload.logSpaceUsageLimitInPercent) {
            return this.addAlertGeneric("logSpaceUsage", payload)
        } else {
            return Promise.resolve([]);
        }
    }

    // Add Read Replica  Alert
    static addReadReplicationLagAlert(
        payload: m.ReadReplicationLagAlert
    ): Promise<boolean | any> {
        if (payload.databaseName && payload.thresholdInSec) {
            return this.addAlertGeneric("readReplicationLag", payload)
        } else {
            return Promise.resolve([]);
        }
    }

    // Add Geo Replica Alert
    static addGeoReplicaLagAlert(
        payload: m.GeoReplicaLagAlert
    ): Promise<boolean | any> {
        if (
            payload.databaseName &&
            payload.thresholdInSec &&
            payload.primaryDatabaseName
        ) {
            return this.addAlertGeneric("geoReplicaLag", payload)
        } else {
            return Promise.resolve([]);
        }
    }

    // Delete an alert
    static deleteAlert(alertId: string): Promise<Boolean | any> {
        if (alertId) {
            return SQLService.postRequest(`/alert/deleteAlert?alertId=${alertId}`, {})
        } else {
            return Promise.resolve([]);
        }
    }

    // Fetch all alerts
    static fetchActiveAlerts(
        databaseName: string
    ): Promise<m.IMetricAlert[] | any> {
        if (databaseName) {
            return SQLService.getRequest(`/alert/getAlerts?databaseName=${databaseName}`)
        } else {
            return Promise.resolve([]);
        }
    }

    // Fetch a single alert
    static fetchActiveAlert(
        databaseName: string,
        alertId: string
    ): Promise<m.IMetricAlert | any> {
        if (databaseName && alertId) {
            return SQLService.getRequest(`/alert/getAlert?databaseName=${databaseName}&alertId=${alertId}`)
        } else {
            return Promise.resolve();
        }
    }


    static addAlertGeneric(alertName: string, payload: {}, ) {
        return fetchFromService(`/alert/${alertName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }).then(async (r) => {
            return r.json();
        });
    }

}