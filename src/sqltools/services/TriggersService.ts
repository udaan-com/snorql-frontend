import * as m from "../models";
import {fetchFromService, SQLService} from "./SQLService";

export class TriggersService {
    static configureActiveQueriesTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "performance_activeQueries",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordActiveQueriesMetric", payload)
    }

    static configureDatabaseStorageTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "storage_db",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordDatabaseStorage", payload)
    }

    static configureDBTableStorageTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "storage_dbTable",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordDBTableMetric", payload)
    }

    static configureActiveDDLQueriesTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "performance_activeDDL",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordActiveDDLQueries", payload)
    }

    static configureBlockedQueriesTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "performance_blockedQueries",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordBlockedQueries", payload)
    }

    static configureDBTableSizeTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "storage_dbTables",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordDBTablesMetric", payload)
    }

    static configureLongRunningQueriesTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        elapsedTime: number,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.ILongRunningMetricJobConfig = {
            databaseName: databaseName,
            metricId: "performance_longRunningQueries",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
            elapsedTime: elapsedTime,
        };
        return this.configureTriggers("recordLongRunningQueries", payload)
    }

    static configureIndexStatsTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        tableName: string,
        indexName: string,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IIndexStatsJobConfig = {
            databaseName: databaseName,
            metricId: "performance_indexStats",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
            tableName: tableName,
            indexName: indexName,
        };

        return this.configureTriggers("recordIndexStats", payload)
    }

    static configureTableSizeTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        tableName: string,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.ITableSizeJobConfig = {
            databaseName: databaseName,
            metricId: "storage_table",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
            tableName: tableName,
        };
        return this.configureTriggers("recordTableSize", payload)
    }

    static configureDBTopIndexesTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "storage_dbIndex",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordDBIndexQueries", payload)
    }

    static configureComputeUtilizationTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "performance_computeUtilization",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordComputeUtilization", payload)
    }

    static configurelogSpaceUsageTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "performance_logSpaceUsage",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordLogSpaceUsage", payload)
    }

    static configureReadReplicationLagTrigger(
        databaseName: string,
        configuredByName: string,
        configuredByEmail: string,
        descriptionString: string,
        watchIntervalInSeconds: number,
        endAt: Date,
        dataRetentionPeriodInDays: number
    ): Promise<Boolean> {
        const payload: m.IMetricJobConfig = {
            databaseName: databaseName,
            metricId: "performance_readReplicationLag",
            description: descriptionString,
            configuredByName: configuredByName,
            configuredByEmail: configuredByEmail,
            watchIntervalInSeconds: watchIntervalInSeconds,
            endAt: endAt,
            dataRetentionPeriodInDays: dataRetentionPeriodInDays,
        };
        return this.configureTriggers("recordReadReplicationLag", payload)
    }

    private static configureTriggers(metricSlug:string, payload:any):Promise<any> {
        return fetchFromService(`/job/${metricSlug}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": `application/json`,
                },
                body: JSON.stringify(payload),
            }
        ).then(async (r) => {
            if (r.status !== 200) {
                return false;
            }
            return r.json()
        }).catch((error) => {

        })
    }

    static getTriggers(dbName: string, metricId: string): Promise<m.IMetricTrigger[] | any> {
        if (dbName != "" && metricId != "") {
            let url = `/job/getTriggers?metricId=${metricId}&databaseName=${dbName}`
            return SQLService.getRequest(url)
        } else {
            return Promise.resolve([]);
        }
    }


    static getActiveTriggers(
        dbName: string,
        metricId: string
    ): Promise<m.IMetricTrigger[] | any> {
        return this.getTriggers(dbName, metricId)
    }

    static getLongRunningTriggers(
        dbName: string,
        metricId: string
    ): Promise<m.ILongRunningMetricTrigger[] | any> {
        return this.getTriggers(dbName, metricId)
    }

    static getIndexStatsTriggers(
        dbName: string,
        metricId: string
    ): Promise<m.IIndexStatsTrigger[] | any> {
        return this.getTriggers(dbName, metricId)
    }

    static getTableSizeTriggers(
        dbName: string,
        metricId: string
    ): Promise<m.ITableSizeTrigger[] | any> {
        return this.getTriggers(dbName, metricId)
    }

    static deleteTrigger(triggerName: string): Promise<boolean | any> {
        if (triggerName) {
            return SQLService.postRequest(`/job/deleteTrigger?triggerName=${triggerName}`, {})
        } else {
            return Promise.resolve([]);
        }
    }
}