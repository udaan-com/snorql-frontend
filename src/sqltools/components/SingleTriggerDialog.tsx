import { CircularProgress, Dialog, DialogTitle, IconButton, Paper, Tooltip } from "@mui/material";
import { Theme } from "@mui/material/styles";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import { Database, ICustomError, IMetricTrigger } from "../models";
import { SQLService } from "../services/SQLService";
import { ErrorMessageCard } from "./ErrorMessageCard";
import { Fetcher } from "../../common/components/Fetcher";
import { REPEAT_INTERVAL_FOR_COMPUTE_UTILIZATION, SingleTriggerConfigurationDisplay } from "./SingleTriggerConfigurationDisplay";
import { addDataRecordingsEvent } from "../tracking/TrackEventMethods";
import { MenuText, MenuTitle } from "../screens/database-dashboard/DatabaseDashboardScreen";
import {useAdminEmail, useAdminName} from "../../hooks";
import { TriggersService } from "../services/TriggersService";

interface Props {
    open: boolean;
    handleClose: () => void;
    databaseName: string;
    metricId: string;
    metricName: string;
    minimumRepeatInterval?: number,
    databaseDetail?: Database
}

export const SingleTriggerDialog: React.FunctionComponent<Props> = (props: Props) => {
    const { open, metricId, metricName, databaseName, minimumRepeatInterval, handleClose, databaseDetail } = props

    const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
        },
    }));

    const userEmail = useAdminEmail();
    const userName = useAdminName();
    const classes = useStyles();
    const [triggerData, setTriggerData] = useState<IMetricTrigger>();
    const [triggerDataForReplica, setTriggerDataForReplica] = useState<IMetricTrigger>();
    const [loadingTriggerData, setLoadingTriggerData] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [triggerList, setTriggerList] = useState<IMetricTrigger[]>([]);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

    useEffect(() => {
        if (triggerList && triggerList.length > 0) {
            const formattedTriggerData = formatTriggerData(triggerList[0])
            setTriggerData(formattedTriggerData);
            setEditMode(false);
        } else {
            setEditMode(true);
        }
    }, [triggerList])

    const formatTriggerData = (receivedTriggerData: IMetricTrigger): IMetricTrigger => {
        const finalTriggerData: IMetricTrigger = {
            triggerName: receivedTriggerData.triggerName,
            metricId: receivedTriggerData.metricId,
            description: receivedTriggerData.description,
            configuredByName: receivedTriggerData.configuredByName,
            configuredByEmail: receivedTriggerData.configuredByEmail,
            repeatInterval: receivedTriggerData.repeatInterval,
            endTime: UTCToDateString(receivedTriggerData.endTime),
            nextFireTime: UTCToDateString(receivedTriggerData.nextFireTime),
            startTime: UTCToDateString(receivedTriggerData.startTime),
            dataRetentionPeriodInDays: receivedTriggerData.dataRetentionPeriodInDays
        }
        return finalTriggerData
    }

    const UTCToDateString = (utcTime?: string): string => {
        if (utcTime) {
            let ISTTime = new Date(utcTime);
            ISTTime.setHours(ISTTime.getHours() + 5);
            ISTTime.setMinutes(ISTTime.getMinutes() + 30);
            return ISTTime.toISOString().slice(0,16);
        } else {
            return ""
        }
    }

    const handleOnTriggerListResponse = (r: Array<IMetricTrigger> | ICustomError) => {
        if(metricId == "performance_computeUtilization") {
            fetchActiveTriggersForComputeUtilization()
        } else {
            if ("code" in r && "message" in r && "details" in r) {
                setErrorMessage(`${r.message}: ${r.details}`);
            } else {
                setTriggerList(r);
            }
            setLoadingTriggerData(false)
            setSubmitLoading(false)
        }
    }

    const fetchActiveTriggers = () => {
        TriggersService.getActiveTriggers(databaseName, metricId)
        .then((r) => {
            handleOnTriggerListResponse(r)
        })
        .catch(e => {
            setErrorMessage(`Failed to fetch triggers, error: ${e}`)
            setSubmitLoading(false)
        })

    }
    const fetchActiveTriggersForComputeUtilization = async () => {
        try {
            if(databaseDetail?.readReplicaDbName) {
                const res = await Promise.all([
                    TriggersService.getActiveTriggers(databaseName, metricId),
                    TriggersService.getActiveTriggers(`${databaseDetail.readReplicaDbName}`, metricId)
                ]);
                const data = res.map((res) => res).flat();
                
                if(data.length == 2) {
                    const primaryDbResponse: IMetricTrigger = data[0];
                    const replicaDbResponse: IMetricTrigger = data[1];
                    const formattedPrimaryResponse = formatTriggerData(primaryDbResponse);
                    const formattedReplicaResponse = formatTriggerData(replicaDbResponse);
            
                    setTriggerData(formattedPrimaryResponse)
                    setTriggerDataForReplica(formattedReplicaResponse)
                } else {
                    setLoadingTriggerData(false)
                    setSubmitLoading(false)
                }
            } else {
                const activeTriggers = await TriggersService.getActiveTriggers(databaseName, metricId);
                if(activeTriggers.length > 0 ) {
                    const formattedPrimaryResponse = formatTriggerData(activeTriggers[0])
                    console.log("formattedPrimaryResponse ", formattedPrimaryResponse);
                    
                    setTriggerData(formattedPrimaryResponse)
                } else {
                    setLoadingTriggerData(false)
                    setSubmitLoading(false)
                }
            }
        } catch (e) {
            setErrorMessage(`Failed to fetch triggers, error: ${e}`)
            setSubmitLoading(false)
        }
    }
    const basicPerformancePropsForMixPanel = { dbName: props.databaseName, userEmail, metricTitle: MenuTitle.STORAGE, metricText: metricName}
    const basicStoragePropsForMixPanel = { dbName: props.databaseName, userEmail, metricTitle: MenuTitle.STORAGE, metricText: metricName}
    const handleSubmit = async (description: string, repeatInterval: number, endTime: string, dataRetentionPeriodInDays: number) => {
        setSubmitLoading(true)
        const configuredByEmail = userEmail
        const configuredByName = userName
        if (metricId == "performance_activeQueries") {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicPerformancePropsForMixPanel)
            TriggersService.configureActiveQueriesTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure Active Queries Trigger, error: ${e}`)
                return false
            })
        } else if (metricId == "performance_activeDDL") {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicPerformancePropsForMixPanel)
            TriggersService.configureActiveDDLQueriesTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure  Active DDL Trigger, error: ${e}`)
                fetchActiveTriggers()
                return false
            })
        } else if (metricId == "performance_blockedQueries") {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicPerformancePropsForMixPanel)
            TriggersService.configureBlockedQueriesTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure Blocked Queries Trigger, error: ${e}`)
                fetchActiveTriggers()
                return false
            })
        } else if (metricId == "performance_computeUtilization") {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicPerformancePropsForMixPanel)
            try {
                if(databaseDetail?.readReplicaDbName) {
                    const res = await Promise.all([
                        TriggersService.configureComputeUtilizationTrigger(databaseName, configuredByName, configuredByEmail, description, REPEAT_INTERVAL_FOR_COMPUTE_UTILIZATION, new Date(endTime), dataRetentionPeriodInDays),
                        TriggersService.configureComputeUtilizationTrigger(`${databaseDetail.readReplicaDbName}`, configuredByName, configuredByEmail, description, REPEAT_INTERVAL_FOR_COMPUTE_UTILIZATION, new Date(endTime), dataRetentionPeriodInDays)
                    ]);
                    const data = res.map((res) => res).flat();
                    fetchActiveTriggersForComputeUtilization()
                    return data && data[0] && data[1];
                } else {
                    const res = await TriggersService.configureComputeUtilizationTrigger(databaseName, configuredByName, configuredByEmail, description, REPEAT_INTERVAL_FOR_COMPUTE_UTILIZATION, new Date(endTime), dataRetentionPeriodInDays);
                    fetchActiveTriggersForComputeUtilization()
                    return res;
                }
              } catch (e) {
                setErrorMessage(`Failed to configure  Compute Utilization Trigger, error: ${e}`)
                fetchActiveTriggersForComputeUtilization()
                return false
              }

        } else if (metricId == "performance_logSpaceUsage") {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicPerformancePropsForMixPanel)
            TriggersService.configurelogSpaceUsageTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure Log Space Usage Trigger, error: ${e}`)
                fetchActiveTriggers()
                return false
            })
        } else if (metricId == "performance_readReplicationLag") {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicPerformancePropsForMixPanel)
            TriggersService.configureReadReplicationLagTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure Read Replication Lag Trigger, error: ${e}`)
                fetchActiveTriggers()
                return false
            })
        } else if (metricId == 'storage_dbIndex') {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicStoragePropsForMixPanel)
            TriggersService.configureDBTopIndexesTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure Database Top Index Trigger, error: ${e}`)
                fetchActiveTriggers()
                return false
            })
        } else if (metricId == 'storage_dbTables') {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicStoragePropsForMixPanel)
            TriggersService.configureDBTableSizeTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure Database Table Storage Trigger, error: ${e}`)
                fetchActiveTriggers()
                return false
            })
        } else if (metricId == 'storage_db') {
            // fire add historical mixpanel event
            addDataRecordingsEvent(basicStoragePropsForMixPanel)
            TriggersService.configureDatabaseStorageTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), dataRetentionPeriodInDays)
            .then(r => {
                fetchActiveTriggers()
                return r == true ? true : false
            })
            .catch(e => {
                setErrorMessage(`Failed to configure Database Storage Trigger, error: ${e}`)
                fetchActiveTriggers()
                return false
            })
        } else {
            return false
        }
    }
    
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Data Recording Configuration
                <Tooltip title='Close dialog'>
                    <IconButton onClick={handleClose} className={classes.closeButton} size="large">
                        <CloseIcon/>
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <Paper style={{maxWidth: 1400, width: "-webkit-fill-available"}}>
                <Fetcher
                    fetchData={() => TriggersService.getActiveTriggers(databaseName, metricId)}
                    onFetch={(r) => { handleOnTriggerListResponse(r) }}
                >
                <div style={{ padding: '10px' }}>
                    {!errorMessage && loadingTriggerData && !triggerList && 
                        <CircularProgress></CircularProgress>
                    }
                    <div>
                        {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                        {!errorMessage && 
                            <SingleTriggerConfigurationDisplay
                                triggerData={triggerData}
                                handleClose={handleClose}
                                handleSubmit={handleSubmit}
                                databaseName={databaseName}
                                metricId={metricId}
                                metricName={metricName}
                                configuredByEmail={userEmail}
                                configuredByName={userName}
                                minimumRepeatInterval={minimumRepeatInterval}
                                submitLoading={submitLoading}
                                loadingTriggerData={loadingTriggerData} 
                                clearTriggerData={() => setTriggerData(undefined)} 
                                triggerDataForReplica={triggerDataForReplica}
                                databaseDetail={databaseDetail}/>
                                
                        }
                        </div>
                    </div>
                </Fetcher>
            </Paper>
        </Dialog>
    );
}