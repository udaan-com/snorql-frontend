import {fetchFromService} from "./SQLService";
import {DatabaseType} from "../models";
import * as m from "../models";

export class MiscService {
    // SERVICE APIs
    static getAllServices(): Promise<string[]> {
        return fetchFromService(`/sql/services`).then((r) =>
            r.json().then((json) => {
                if (r.status !== 200) {
                    throw new Error(json.error || JSON.stringify(json));
                }
                return json;
            })
        );
    }

    // CRONJOB APIs
    static getAllCronjobs(): Promise<string[]> {
        return fetchFromService(`/sql/cronjobs`).then((r) =>
            r.json().then((json) => {
                if (r.status !== 200) {
                    throw new Error(json.error || JSON.stringify(json));
                }
                return json;
            })
        );
    }

    static configureDatabase(dbType: DatabaseType = DatabaseType.SQLSERVER, dbName: string): Promise<any> {
        return fetchFromService(`/sql/databases/configuredb?dbName=${dbName}`, {
            method: "POST",
            headers: {
                "content-type": `application/json`,
            },
        }).then((r) => {
            if (r.status !== 200) {
                return [];
            }
            return r.json();
        });
    }

    static postAlertConfig(
        payload: m.CreatePayloadSQLAlert,
        type: m.alertType
    ): Promise<any> {
        return fetchFromService(`/sql/${type}s/configure-alerts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
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

    static getAlertConfigByName(
        service: string,
        type: m.alertType
    ): Promise<m.GetSQLAlert[]> {
        return fetchFromService(`/sql/${type}s/alerts/${service}`, {
            headers: {
                "content-Type": "application/json",
            },
        }).then((r) => {
            if (r.status == 200) {
                return r.json();
            }
            return null;
        });
    }

    static putAlertConfig(
        id: number,
        payload: m.UpdatePayloadSQLAlert,
        type: m.alertType
    ): Promise<any> {
        return fetchFromService(`/sql/${type}s/alerts/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
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

    static getAllAlerts(): Promise<m.GetSQLAlert[]> {
        return fetchFromService(`/sql-alerts/all`)
            .then((r) => r.json().then((json) => {
                    if (r.status !== 200) {
                        throw new Error(json.error || JSON.stringify(json));
                    }
                    return json;
                })
            );
    }

    // COMMON SERVICE/CRONJOB APIs
    static getSQLQueryDetails(
        serviceName: string,
        startTime: number,
        endTime: number,
        numResults: number,
        threshold: number,
        type: m.alertType,
        hostname: string
    ): Promise<m.LongRunningSQLQueries[]> {
        return fetchFromService(
            `/sql/${type}s/alerts/realtime?${type}Name=${serviceName}&startTime=${startTime}&endTime=${endTime}&numResults=${numResults}&threshold=${threshold}&hostname=${hostname}`,
            {
                headers: {
                    "content-type": `application/json`,
                },
            }
        )
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

    static getGroupMembers(
        groupName: string
    ): Promise<m.GroupMembersResponse | any> {
        return fetchFromService(`/sql/databases/getGroupMembers?groupName=${groupName}`, {
            headers: {
                "content-type": `application/json`,
            },
        }).then(async (r) => {
            return r.json();
        });
    }

    static getAdmin(rgid: string): Promise<m.SQLAdminResponse | any> {
        return fetchFromService(`/sql/databases/getAdmin?rgid=${rgid}`, {
            headers: {
                "content-type": `application/json`,
            },
        }).then(async (r) => {
            return r.json();
        });
    }

}