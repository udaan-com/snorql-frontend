import { Button, CircularProgress, FormControl, InputAdornment, TextField } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Autocomplete } from '@mui/material';
import React, { useEffect, useState } from "react";
import {
  ActiveQueriesAlert,
  AlertInfo,
  AlertSeverity,
  ALERT_SEVERITY,
  ALERT_TYPE,
  DatabaseUsedSpaceAlert,
  IMetricAlert,
  IndexFragmentationAlert,
  IndexPhysicalStats,
  INDEX_PHYSICAL_STATS_MODES,
  ResourceTypeInfo,
  ResourceUtilizationAlert,
  RESOURCE_TYPE,
  Database,
  LogSpaceUsageAlert,
  ReadReplicationLagAlert,
  GeoReplicaLagAlert
} from "../models";
import { SQLService } from "../services/SQLService";
import { AlertService } from "../services/AlertService"
import { ErrorMessageCard } from "./ErrorMessageCard";
import { SnackbarComponent } from "./SnackbarComponent";

interface SqlAlertFormProps {
  databaseName: string;
  configuredByName: string;
  configuredByEmail: string;
  supportedAlertsList: AlertInfo[];
  alertSeverityList: AlertSeverity[];
  alertData?: IMetricAlert;
  handleClose: () => void;
  primaryDbName?: string
}

const useStyles = makeStyles((theme) => ({
  buttonStyle: {
    textTransform: "none",
  },
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),

    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "300px",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(2),
    },
  },
}));

export const SqlAlertForm: React.FunctionComponent<SqlAlertFormProps> = (
  props: SqlAlertFormProps
) => {
  const today = new Date();
  const tempToday = new Date();
  var weekAheadDate = new Date(tempToday.setDate(tempToday.getDate() + 7));
  weekAheadDate.setHours(weekAheadDate.getHours() + 5);
  weekAheadDate.setMinutes(weekAheadDate.getMinutes() + 30);
  const weekAheadString = weekAheadDate.toISOString().slice(0, 16);
  today.setHours(today.getHours() + 5);
  today.setMinutes(today.getMinutes() + 30);
  const todayString = today.toISOString().slice(0, 16);

  const indexPhysicalStatsModeList: IndexPhysicalStats[] = [
    { modeId: INDEX_PHYSICAL_STATS_MODES.DEFAULT, modeName: "DEFAULT"},
    { modeId: INDEX_PHYSICAL_STATS_MODES.DETAILED, modeName: "DETAILED"},
    { modeId: INDEX_PHYSICAL_STATS_MODES.LIMITED, modeName: "LIMITED"},
    { modeId: INDEX_PHYSICAL_STATS_MODES.NULL, modeName: "NULL"},
    { modeId: INDEX_PHYSICAL_STATS_MODES.SAMPLED, modeName: "SAMPLED"}
  ]

  const resourceTypeOptions: ResourceTypeInfo[] = [
    { resourceName: "Max CPU Utilization", resourceType: RESOURCE_TYPE.CPU},
    { resourceName: "Max Data IO", resourceType: RESOURCE_TYPE.DATA_IO},
    { resourceName: "Max Memory Utilization", resourceType: RESOURCE_TYPE.MEMORY},
    {resourceName: "Max Log IO", resourceType: RESOURCE_TYPE.LOG_IO}
  ]

  const { databaseName, handleClose, configuredByEmail, configuredByName, supportedAlertsList, alertSeverityList, alertData, primaryDbName } = props;
  const classes = useStyles();
  // generic states
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [endTime, setEndTime] = useState(weekAheadString);
  const [monitoringInterval, setMonitoringInterval] = useState<number>(10);
  const [selectedAlertInfo, setSelectedAlertInfo] = useState<AlertInfo>();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarType, setSnackbarType] = useState<string>("error");
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [alertAddSuccess, setAlertAddSuccess] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<ALERT_SEVERITY>(ALERT_SEVERITY.INFORMATIONAL); 
  const [severityObject, setSeverityObject] = useState<AlertSeverity>({ severityId: ALERT_SEVERITY.INFORMATIONAL, severityName: "Informational" });
  const [editMode, setEditMode] = useState<boolean>(false);

  //active query alert states
  const [queriesCountThreshold, setQueriesCountThreshold] = useState<number>();
  const [elapsedTimeThreshold, setElapsedTimeThreshold] = useState<number>();
  const [cpuTimeThreshold, setCpuTimeThreshold] = useState<number>();
  const [logicalReadsThreshold, setLogicalReadsThreshold] = useState<number>();
  const [readsThreshold, setReadsThreshold] = useState<number>();
  const [writesThreshold, setWritesThreshold] = useState<number>();
  const [openTransactionCountThreshold, setOpenTransactionCountThreshold] = useState<number>();

   //database used space alert states
  const [percentageOccupiedThreshold, setPercentageOccupiedThreshold] = useState<number>(80);

   // index fragmentation alert states
  const [pageCountThreshold, setPageCountThreshold] = useState<number>(1000);
  const [indexStatModeObject, setIndexStatModeObject] = useState<IndexPhysicalStats>(indexPhysicalStatsModeList[2]);
  const [indexPhysicalStatMode, setIndexPhysicalStatMode] = useState<INDEX_PHYSICAL_STATS_MODES>(INDEX_PHYSICAL_STATS_MODES.LIMITED);

  // resource utilization alert states
  const [resourceUtilizationThreshold, setResourceUtilThreshold] = useState<number>(70);
  const [selectedResourceTypeInfo, setSelectedResTypeInfo] = useState<ResourceTypeInfo>(resourceTypeOptions[0]);
  const [resourceType, setResourceType] = useState<RESOURCE_TYPE>(RESOURCE_TYPE.CPU);
  const [databaseType, setDatabaseType] = useState<string>("REPLICA");
  const [databaseInfo, setDatabaseInfo] = useState<Database | undefined>(undefined);

  // log space usage alert states
  const [logSpaceUsageLimitInPercent, setLogSpaceUsageLimitInPercent] = useState<number>(60)

  // read replica lag alert states
  const [readReplicaLagThresholdInSec, setReadReplicaLagThresholdInSec] = useState<number>(6)

  // geo replica lag space usage alert states
  const [geoReplicaLagThresholdInSec, setGeoReplicaLagThresholdInSec] = useState<number>(6)


  useEffect(() => {
    if (alertAddSuccess) {
      setSnackbarValues(
        true,
        "success",
        "Alert successfully added. Alert can be viewed on Alerting page"
      );
    }
  }, [alertAddSuccess]);

  useEffect(() => {
    if (!databaseInfo) {
      SQLService.getDatabaseDetail(databaseName)
      .then((r) => { 
        setDatabaseInfo(r);});
    }
  }, [databaseInfo])


  useEffect(() => {
    if (alertData) {
      setEditMode(true);

      const tempSeverityObj: AlertSeverity | undefined = alertSeverityList.find(sev => sev.severityId === ALERT_SEVERITY[alertData.severity])
      if (tempSeverityObj) setSeverityObject(tempSeverityObj)
      
      setMonitoringInterval(alertData.watchIntervalInSeconds);
      setDescription(alertData.description ? alertData.description : '');
      setEndTime(alertData.endAt ? alertData.endAt.toISOString() : weekAheadString);
      
      if (alertData.alertType == ALERT_TYPE.alert_activeQueriesFilter) {
        const tempAlert = alertData as ActiveQueriesAlert
        const alertInfoObj = supportedAlertsList.find(alert => alert.alertId == ALERT_TYPE.alert_activeQueriesFilter)
        if (alertInfoObj) setSelectedAlertInfo(alertInfoObj);
        setQueriesCountThreshold(tempAlert.queriesCountThreshold);
        setElapsedTimeThreshold(tempAlert.elapsedTimeThreshold);
        setCpuTimeThreshold(tempAlert.cpuTimeThreshold);
        setLogicalReadsThreshold(tempAlert.logicalReadsThreshold);
        setReadsThreshold(tempAlert.readsThreshold);
        setWritesThreshold(tempAlert.writesThreshold);
        setOpenTransactionCountThreshold(tempAlert.openTransactionCountThreshold);

      } else if (alertData.alertType == ALERT_TYPE.alert_databaseUsedSpace) {
        const tempAlert = alertData as DatabaseUsedSpaceAlert
        const alertInfoObj = supportedAlertsList.find(alert => alert.alertId == ALERT_TYPE.alert_databaseUsedSpace)
        if (alertInfoObj) setSelectedAlertInfo(alertInfoObj);
        setPercentageOccupiedThreshold(tempAlert.percentageOccupiedThreshold);

      } else if (alertData.alertType == ALERT_TYPE.alert_indexFragmentation) {
        const tempAlert = alertData as IndexFragmentationAlert
        const alertInfoObj = supportedAlertsList.find(alert => alert.alertId == ALERT_TYPE.alert_indexFragmentation)
        if (alertInfoObj) setSelectedAlertInfo(alertInfoObj)
        setPageCountThreshold(tempAlert.pageCountThreshold)
        setIndexPhysicalStatMode(tempAlert.mode)

      } else if (alertData.alertType == ALERT_TYPE.alert_logSpaceUsage) {
        const tempAlert = alertData as LogSpaceUsageAlert
        const alertInfoObj = supportedAlertsList.find(alert => alert.alertId == ALERT_TYPE.alert_logSpaceUsage)
        if (alertInfoObj) setSelectedAlertInfo(alertInfoObj);
        setLogSpaceUsageLimitInPercent(tempAlert.logSpaceUsageLimitInPercent);

      } else if (alertData.alertType == ALERT_TYPE.alert_readReplicationLag) {
        const tempAlert = alertData as ReadReplicationLagAlert
        const alertInfoObj = supportedAlertsList.find(alert => alert.alertId == ALERT_TYPE.alert_readReplicationLag)
        if (alertInfoObj) setSelectedAlertInfo(alertInfoObj);
        setReadReplicaLagThresholdInSec(tempAlert.thresholdInSec);

      } else if (alertData.alertType == ALERT_TYPE.alert_geoReplicaLag) {
        const tempAlert = alertData as GeoReplicaLagAlert
        const alertInfoObj = supportedAlertsList.find(alert => alert.alertId == ALERT_TYPE.alert_geoReplicaLag)
        if (alertInfoObj) setSelectedAlertInfo(alertInfoObj);
        setGeoReplicaLagThresholdInSec(tempAlert.thresholdInSec);

      } else {
        setSnackbarValues(true, "warning", "Unsupported Alert")
      }
    }
  }, [alertData])

  //generic helper functions
  const handleFailedToSaveAlert = (errMsg: string, alertType: string) => {
    setErrorMessage(errMsg);
    setSubmitLoading(false);
    setSnackbarValues(true, "error", `Failed to add ${alertType}.\nError: ${errMsg}`);
    setAlertAddSuccess(false);
  }

  // active queries alert helper functions
  const getPaylodForActiveQueriesAlert = (): ActiveQueriesAlert => {
    return {
      databaseName: databaseName,
      alertType: ALERT_TYPE.alert_activeQueriesFilter,
      alertNameString: "Active Queries Alert",
      severity: alertSeverity,
      configuredByName: configuredByName,
      configuredByEmail: configuredByEmail,
      watchIntervalInSeconds: monitoringInterval,
      description: description,
      endAt: new Date(endTime),
      queriesCountThreshold: queriesCountThreshold,
      elapsedTimeThreshold: elapsedTimeThreshold,
      cpuTimeThreshold: cpuTimeThreshold,
      logicalReadsThreshold: logicalReadsThreshold,
      readsThreshold: readsThreshold,
      writesThreshold: writesThreshold,
      openTransactionCountThreshold: openTransactionCountThreshold
    }
  }
  const saveActiveQueryAlert = (payload: ActiveQueriesAlert): boolean => {
    AlertService.addActiveQueryAlert(payload).then((r) => {
      const isSuccessful = r == true ? true : false;
      setSubmitLoading(false);
      setAlertAddSuccess(isSuccessful);
      if(!isSuccessful) setSnackbarValues(true, "error", "Failed to add Active Queries Alert");
      return isSuccessful
    }).catch((e) => {
      handleFailedToSaveAlert(e.message, "Active Queries Alert")
      return false;
    });
    return false;
  }

  // database usage alert helper functions
  const getPaylodForDatabaseUsedSpaceAlert = (): DatabaseUsedSpaceAlert => {
    return {
      dbName: databaseName.split("/")[1],
      description: description,
      severity: alertSeverity,
      percentageOccupiedThreshold: percentageOccupiedThreshold,
      databaseName: databaseName,
      alertType: ALERT_TYPE.alert_databaseUsedSpace,
      alertNameString: "Database Used Space Alert",
      configuredByName: configuredByName,
      configuredByEmail: configuredByEmail,
      watchIntervalInSeconds: monitoringInterval,
      endAt: new Date(endTime),
    }
  }
  const saveDatabaseUsedSpaceAlert = (payload: DatabaseUsedSpaceAlert): boolean => {
    AlertService.addDatabaseUsedSpaceAlert(payload).then((r) => {
      const isSuccessful = r == true ? true : false;
      setSubmitLoading(false);
      setAlertAddSuccess(isSuccessful);
      if(!isSuccessful) setSnackbarValues(true, "error", "Failed to add Database Used Space alert");
      return isSuccessful
    }).catch((e) => {
      handleFailedToSaveAlert(e.message, "Database Used Space Alert")
      return false;
    });
    return false;
  }

  // index fragmentation alert helper functions
  const getPaylodForIndexFragmentationAlert = (): IndexFragmentationAlert => {
    return {
      databaseName: databaseName,
      alertType: ALERT_TYPE.alert_indexFragmentation,
      alertNameString: "Index Fragmentation Alert",
      severity: alertSeverity,
      configuredByName: configuredByName,
      configuredByEmail: configuredByEmail,
      watchIntervalInSeconds: monitoringInterval,
      description: description,
      endAt: new Date(endTime),
      mode: indexPhysicalStatMode,
      pageCountThreshold: pageCountThreshold
    }
  }
  const saveIndexFragmentationAlert = (payload: IndexFragmentationAlert): boolean => {
    AlertService.addIndexFragmentationAlert(payload).then((r) => {
      const isSuccessful = r == true ? true : false;
      setSubmitLoading(false);
      setAlertAddSuccess(isSuccessful);
      if(!isSuccessful) setSnackbarValues(true, "error", "Failed to add Index Fragmentation alert");
      return isSuccessful
    }).catch((e) => {
      handleFailedToSaveAlert(e.message, "Index Fragmentation Alert");
      return false;
    });
    return false;
  }

    // resource utilization alert helper functions
    const isReplica = () => databaseInfo && ["BusinessCritical","Premium"].includes(databaseInfo.tier) && databaseType == "REPLICA" 
    const getPaylodForResourceUtilizationAlert = (): ResourceUtilizationAlert => {
      let configuredOnReplica = isReplica()
      return {
        databaseName: databaseName,
        alertType: ALERT_TYPE.alert_resourceUtilization,
        alertNameString: "Resource Utilization Alert",
        severity: alertSeverity,
        configuredByName: configuredByName,
        configuredByEmail: configuredByEmail,
        watchIntervalInSeconds: monitoringInterval,
        description: description,
        endAt: new Date(endTime),
        resourceType: resourceType,
        resourceUtilizationThreshold: resourceUtilizationThreshold,
        configuredOnReplica: configuredOnReplica ? configuredOnReplica : false
      }
    }
    const saveResourceUtilizationAlert = (payload: ResourceUtilizationAlert): boolean => {
      AlertService.addResourceUtilizationAlert(payload).then((r) => {
        const isSuccessful = r == true ? true : false;
        setSubmitLoading(false);
        setAlertAddSuccess(isSuccessful);
        if(!isSuccessful) setSnackbarValues(true, "error", "Failed to add Resource utilization alert");
        return isSuccessful
      }).catch((e) => {
        handleFailedToSaveAlert(e.message, "Resource utilization Alert");
        return false;
      });
      return false;
    }

    // log space usage alert helper functions
    const getPaylodForLogSpaceUsageAlert = (): LogSpaceUsageAlert => {
      return {
        databaseName: databaseName,
        alertType: ALERT_TYPE.alert_logSpaceUsage,
        alertNameString: "Log Space Usage Alert",
        severity: alertSeverity,
        configuredByName: configuredByName,
        configuredByEmail: configuredByEmail,
        watchIntervalInSeconds: monitoringInterval,
        description: description,
        endAt: new Date(endTime),
        logSpaceUsageLimitInPercent: logSpaceUsageLimitInPercent,
      }
    }
    const saveLogSpaceUsageAlert = (payload: LogSpaceUsageAlert): boolean => {
      AlertService.addLogSpaceUsageAlert(payload).then((r) => {
        const isSuccessful = r == true ? true : false;
        setSubmitLoading(false);
        setAlertAddSuccess(isSuccessful);
        if(!isSuccessful) setSnackbarValues(true, "error", "Failed to add Log Space Usage alert");
        return isSuccessful
      }).catch((e) => {
        handleFailedToSaveAlert(e.message, "Log Space Usage Alert");
        return false;
      });
      return false;
    }

    // read replication lag alert helper functions
    const getPaylodForReadReplicationLagAlert = (): ReadReplicationLagAlert => {
      return {
        databaseName: databaseName,
        alertType: ALERT_TYPE.alert_readReplicationLag,
        alertNameString: "Read Replica Lag Alert",
        severity: alertSeverity,
        configuredByName: configuredByName,
        configuredByEmail: configuredByEmail,
        watchIntervalInSeconds: monitoringInterval,
        description: description,
        endAt: new Date(endTime),
        thresholdInSec: readReplicaLagThresholdInSec,
      }
    }
    const saveReadReplicationLagAlert = (payload: ReadReplicationLagAlert): boolean => {
      AlertService.addReadReplicationLagAlert(payload).then((r) => {
        const isSuccessful = r == true ? true : false;
        setSubmitLoading(false);
        setAlertAddSuccess(isSuccessful);
        if(!isSuccessful) setSnackbarValues(true, "error", "Failed to add Read Replication Lag alert");
        return isSuccessful
      }).catch((e) => {
        handleFailedToSaveAlert(e.message, "Read Replication Lag Alert");
        return false;
      });
      return false;
    }


    // geo replica lag alert helper functions
    const getPaylodForGeoReplicaLagAlert = (): GeoReplicaLagAlert => {
      if(primaryDbName) {
        return {
          databaseName: databaseName,
          alertType: ALERT_TYPE.alert_geoReplicaLag,
          alertNameString: "Geo Replica Lag Alert",
          severity: alertSeverity,
          configuredByName: configuredByName,
          configuredByEmail: configuredByEmail,
          watchIntervalInSeconds: monitoringInterval,
          description: description,
          endAt: new Date(endTime),
          thresholdInSec: geoReplicaLagThresholdInSec,
          primaryDatabaseName: primaryDbName
        }
      } else {
        setSnackbarValues(true, "error", "Unable to create alert. Primary database name missing from alert input");
        throw Error("Unable to create alert. Primary database name missing from alert input.")
      }

      }
    const saveGeoReplicaLagAlert = (payload: GeoReplicaLagAlert): boolean => {
      AlertService.addGeoReplicaLagAlert(payload).then((r) => {
        const isSuccessful = r == true ? true : false;
        setSubmitLoading(false);
        setAlertAddSuccess(isSuccessful);
        if(!isSuccessful) setSnackbarValues(true, "error", "Failed to add Geo Replica Lag alert");
        return isSuccessful
      }).catch((e) => {
        handleFailedToSaveAlert(e.message, "Geo Replica Lag Alert");
        return false;
      });
      return false;
    }


  const handleSubmitForm = (event: any): boolean => {
    event.preventDefault();
    if (validate(selectedAlertInfo?.alertId)) {
      setSubmitLoading(true);
      if (selectedAlertInfo?.alertId == ALERT_TYPE.alert_activeQueriesFilter) {
        const payload = getPaylodForActiveQueriesAlert();
        return saveActiveQueryAlert(payload)

      } else if (selectedAlertInfo?.alertId == ALERT_TYPE.alert_databaseUsedSpace) {
        const payload = getPaylodForDatabaseUsedSpaceAlert();
        
        return saveDatabaseUsedSpaceAlert(payload);
      } else if (selectedAlertInfo?.alertId == ALERT_TYPE.alert_indexFragmentation) {
        const payload = getPaylodForIndexFragmentationAlert()
        return saveIndexFragmentationAlert(payload);

      } else if (selectedAlertInfo?.alertId == ALERT_TYPE.alert_resourceUtilization) {
        const payload = getPaylodForResourceUtilizationAlert()
        return saveResourceUtilizationAlert(payload);

      } else if (selectedAlertInfo?.alertId == ALERT_TYPE.alert_logSpaceUsage) {
        const payload = getPaylodForLogSpaceUsageAlert()
        return saveLogSpaceUsageAlert(payload);

      } else if (selectedAlertInfo?.alertId == ALERT_TYPE.alert_readReplicationLag) {
        const payload = getPaylodForReadReplicationLagAlert();
        return saveReadReplicationLagAlert(payload);

      } else if (selectedAlertInfo?.alertId == ALERT_TYPE.alert_geoReplicaLag) {
        const payload = getPaylodForGeoReplicaLagAlert();
        return saveGeoReplicaLagAlert(payload)

      } else {
        setSubmitLoading(false);
        setAlertAddSuccess(false);
        return false;
      }
    }
    setSubmitLoading(false);
    // setErrorMessage("Failed to validate inputs")
    setSnackbarValues(true, "warning", "Failed to validate inputs");
    return false;
  };

  const validate = (alertId?: ALERT_TYPE): boolean => {
    if (!alertId) {
      setSnackbarValues(true, 'warning', "Invalid Alert Type")
    }
    if (alertId == ALERT_TYPE.alert_activeQueriesFilter) {
      if (
          !queriesCountThreshold &&
          !elapsedTimeThreshold &&
          !cpuTimeThreshold &&
          !logicalReadsThreshold &&
          !writesThreshold &&
          !readsThreshold &&
          !openTransactionCountThreshold
      ) {
        setSnackbarValues(
          true,
          "warning",
          "All filter parameters can not be empty"
        );
        return false;
      }
      return true;
    }
    // setSnackbarValues(true, 'warning', "Invalid Alert Type")
    return true;
  };

  const setSnackbarValues = (
    snackbarOpen: boolean,
    snackbarType: string,
    snackbarMessage: string
  ) => {
    setSnackbarOpen(snackbarOpen);
    setSnackbarType(snackbarType);
    setSnackbarMessage(snackbarMessage);
  };
  
  // const handleSeveritySelection = () => {
  //   if (severityObject) {
  //     setAlertSeverity(severityObject.severityId)
  //   }
  // }

  const handleSeveritySelection = (alertSeverity: AlertSeverity | null) => {
    if (alertSeverity) {
      setAlertSeverity(alertSeverity.severityId)
    }
  }

  const handleIndexPhysicalStatModeChange = (indexStatMode: IndexPhysicalStats | null) => {
    if (indexStatMode) {
      setIndexPhysicalStatMode(indexStatMode.modeId)
    }
  }

  const handleAlertSelection = (selectedAlert: AlertInfo | null) => {
    if (selectedAlert) {
      setSelectedAlertInfo(selectedAlert);
    }
  };

  return (
    <>
      <SnackbarComponent
        snackbarOpen={snackbarOpen}
        handleClose={() => setSnackbarOpen(false)}
        snackbarType={snackbarType}
        snackbarMessage={snackbarMessage}
      ></SnackbarComponent>
      {errorMessage && <ErrorMessageCard text={errorMessage} />}
      <form className={classes.root} onSubmit={handleSubmitForm}>
        <FormControl style={{ minWidth: "320px" }}>
          <Autocomplete
            aria-required
            options={supportedAlertsList}
            getOptionLabel={(option: AlertInfo) => option.alertName}
            style={{ width: 300 }}
            value={selectedAlertInfo}
            renderInput={(params) => (
              <TextField
                required
                {...params}
                label="Alert Type"
                variant="outlined"
              />
            )}
            onChange={(event: any, newValue: AlertInfo | null) =>
              handleAlertSelection(newValue)
            }
          />
        </FormControl>
        <TextField
          label="Database Name"
          variant="outlined"
          required
          value={databaseName}
          InputProps={{
            readOnly: true,
          }}
          onChange={(e) => null}
        />
        <TextField
          label="Configured By"
          variant="outlined"
          required
          value={`${configuredByName} (${configuredByEmail})`}
          InputProps={{
            readOnly: true,
          }}
          onChange={(e) => null}
        />
        <TextField
          label="Description"
          variant="outlined"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          type="datetime-local"
          label="End Date Time"
          variant="outlined"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            inputProps: { min: todayString },
          }}
          helperText="Stop data recording on"
        />
        <TextField
          type="number"
          label="Monitoring Interval"
          variant="outlined"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">seconds</InputAdornment>
            ),
            inputProps: { min: 1 },
          }}
          value={monitoringInterval}
          onChange={(e) => setMonitoringInterval(Number(e.target.value))}
        />
        <FormControl style={{ minWidth: "320px" }}>
          <Autocomplete
            id="alert-type"
            aria-required
            options={alertSeverityList}
            getOptionLabel={(option: AlertSeverity) => option.severityName}
            style={{ width: 300 }}
            value={severityObject}
            renderInput={(params) => (
              <TextField
                required
                {...params}
                label="Severity"
                variant="outlined"
              />
            )}
            onChange={(event: any, newValue: AlertSeverity | null) =>
              handleSeveritySelection(newValue)
            }
          />
        </FormControl>
        {selectedAlertInfo?.alertId == ALERT_TYPE.alert_databaseUsedSpace && (
          <>
            <TextField
              type="number"
              label="Database Used Space Threshold"
              variant="outlined"
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: { min: 1, max: 99.99 },
              }}
              value={percentageOccupiedThreshold}
              onChange={(e) =>
                setPercentageOccupiedThreshold(Number(e.target.value))
              }
            />
          </>
        )}
        {selectedAlertInfo?.alertId == ALERT_TYPE.alert_indexFragmentation && (
          <>
          <FormControl style={{ minWidth: "320px" }}>
              <Autocomplete
                id="index-physical-state-mode"
                aria-required
                options={indexPhysicalStatsModeList}
                getOptionLabel={(option: IndexPhysicalStats) => option.modeName}
                style={{ width: 300 }}
                value={indexStatModeObject}
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    label="Index Physical State Mode"
                    variant="outlined"
                  />
                )}
                onChange={(event: any, newValue: IndexPhysicalStats | null) =>
                  handleIndexPhysicalStatModeChange(newValue)
                }
              />
            </FormControl>
          <TextField
              type="number"
              label="Page Count Threshold"
              variant="outlined"
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">pages</InputAdornment>,
                inputProps: { min: 1 },
              }}
              value={pageCountThreshold}
              onChange={(e) =>
                setPageCountThreshold(Number(e.target.value))
              }
            />
          </>
        )}
        {selectedAlertInfo?.alertId == ALERT_TYPE.alert_activeQueriesFilter && (
          <>
            <TextField
              type="number"
              label="Queries Count Threshold"
              variant="outlined"
              value={queriesCountThreshold}
              InputProps={{ inputProps: { min: 1 } }}
              onChange={(e) => setQueriesCountThreshold(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Elapsed Time Threshold"
              variant="outlined"
              value={elapsedTimeThreshold}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">seconds</InputAdornment>
                ),
                inputProps: { min: 1 },
              }}
              onChange={(e) => setElapsedTimeThreshold(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="CPU Time Threshold"
              variant="outlined"
              value={cpuTimeThreshold}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">microseconds</InputAdornment>
                ),
                inputProps: { min: 1 },
              }}
              onChange={(e) => setCpuTimeThreshold(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Logical Reads Threshold"
              variant="outlined"
              value={logicalReadsThreshold}
              InputProps={{ inputProps: { min: 1 } }}
              onChange={(e) => setLogicalReadsThreshold(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Reads Threshold"
              variant="outlined"
              value={readsThreshold}
              InputProps={{ inputProps: { min: 1 } }}
              onChange={(e) => setReadsThreshold(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Writes Threshold"
              variant="outlined"
              value={writesThreshold}
              InputProps={{ inputProps: { min: 1 } }}
              onChange={(e) => setWritesThreshold(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Open Transaction Count Threshold"
              variant="outlined"
              value={openTransactionCountThreshold}
              InputProps={{ inputProps: { min: 1 } }}
              onChange={(e) =>
                setOpenTransactionCountThreshold(Number(e.target.value))
              }
            />
          </>
        )}
        {selectedAlertInfo?.alertId == ALERT_TYPE.alert_resourceUtilization && (
          <>
          {true && databaseInfo && ["BusinessCritical","Premium"].includes(databaseInfo.tier) && 
          <FormControl style={{ minWidth: "320px" }}>
            <Autocomplete
              id="database-type"
              aria-required
              options={["REPLICA", "PRIMARY"]}
              style={{ width: 300 }}
              defaultValue={databaseType}
              value={databaseType}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  label="Configure Alert On"
                  variant="outlined"
                />
              )}
              onChange={(event: any, newValue: string | null) =>
                { if (newValue) { setDatabaseType(newValue) }}
              }
            />
          </FormControl>}
          <FormControl style={{ minWidth: "320px" }}>
            <Autocomplete
              id="resource-type"
              aria-required
              options={resourceTypeOptions}
              getOptionLabel={(option: ResourceTypeInfo) => option.resourceName}
              style={{ width: 300 }}
              value={selectedResourceTypeInfo}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  label="Resource Type"
                  variant="outlined"
                />
              )}
              onChange={(event: any, newValue: ResourceTypeInfo | null) =>
                { if (newValue) { setSelectedResTypeInfo(newValue); setResourceType(newValue.resourceType) }}
              }
            />
          </FormControl>
          <TextField
              type="number"
              label="Resource Utilization Threshold"
              variant="outlined"
              value={resourceUtilizationThreshold}
              InputProps={{ endAdornment: (
                <InputAdornment position="end">%</InputAdornment>
                ),
                inputProps: { min: 1, max: 100 } }}
              onChange={(e) => setResourceUtilThreshold(Number(e.target.value))}
            />
          </>
        )}
        {selectedAlertInfo?.alertId == ALERT_TYPE.alert_logSpaceUsage && (
          <>
            <TextField
              type="number"
              label="Log Space Usage Limit (in %)"
              variant="outlined"
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: { min: 0, max: 79.99 },
              }}
              value={logSpaceUsageLimitInPercent}
              onChange={(e) =>
                setLogSpaceUsageLimitInPercent(Number(e.target.value))
              }
            />
          </>
        )}
        {selectedAlertInfo?.alertId == ALERT_TYPE.alert_readReplicationLag && (
          <>
            <TextField
              type="number"
              label="Replication Lag Threshold (in seconds)"
              variant="outlined"
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">s</InputAdornment>,
                inputProps: { min: 1, max: 120 },
              }}
              value={readReplicaLagThresholdInSec}
              onChange={(e) =>
                setReadReplicaLagThresholdInSec(Number(e.target.value))
              }
            />
          </>
        )}
        {selectedAlertInfo?.alertId == ALERT_TYPE.alert_geoReplicaLag && (
          <>
            <TextField
              type="number"
              label="Replication Lag Threshold (in seconds)"
              variant="outlined"
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">s</InputAdornment>,
                inputProps: { min: 1, max: 120 },
              }}
              value={geoReplicaLagThresholdInSec}
              onChange={(e) =>
                setGeoReplicaLagThresholdInSec(Number(e.target.value))
              }
            />
          </>
        )}
        <div>
          <Button
            className={classes.buttonStyle}
            variant="contained"
            onClick={handleClose}
          >
            {alertAddSuccess ? "Close" : "Cancel"}
          </Button>
          {!alertAddSuccess && (
            <Button
              className={classes.buttonStyle}
              type="submit"
              variant="contained"
              color="primary"
            >
              {submitLoading ? (
                <CircularProgress color="secondary" />
              ) : (
                "Add Alert"
              )}
            </Button>
          )}
        </div>
      </form>
    </>
  );
};
