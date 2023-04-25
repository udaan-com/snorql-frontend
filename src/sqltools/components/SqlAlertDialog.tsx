import React, { useEffect, useState } from "react";
import {
  createStyles,
  Dialog,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  Tooltip,
} from "@material-ui/core";
import { AlertInfo, AlertSeverity, ALERT_SEVERITY, ALERT_TYPE, GeoReplicaProperties, IMetricAlert } from "../models";
import { SqlAlertForm } from "./SqlAlertForm";
import CloseIcon from "@material-ui/icons/Close";
import { useAdminEmail, useAdminName } from "../../hooks";
import { SQLService } from "../services/SQLService";
import {AlertService} from "../services/AlertService";

interface Props {
  open: boolean;
  handleClose: () => void;
  databaseName: string;
  supportedAlertTypes?: ALERT_TYPE[];
  mode?: string;
  alertId?: string
}

export const SqlAlertDialog: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { open, handleClose, supportedAlertTypes, databaseName, mode, alertId } = props;

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
      },
    })
  );
  const alertTypesListr: AlertInfo[] = [
    {
        alertId: ALERT_TYPE.alert_activeQueriesFilter, alertName: "Active Queries Alert"
    },
    {
        alertId: ALERT_TYPE.alert_databaseUsedSpace, alertName: "Database Used Space Alert"
    },
    {
      alertId: ALERT_TYPE.alert_indexFragmentation, alertName: "Index Fragmentation Alert"
    },
    {
      alertId: ALERT_TYPE.alert_resourceUtilization, alertName: "Resource Utilization Alert"
    },
    {
      alertId: ALERT_TYPE.alert_logSpaceUsage, alertName: "Log Space Usage Alert"
    }
]

  const userEmail = useAdminEmail();
  const userName = useAdminName();
  const classes = useStyles();
  const [activeAlert, setActiveAlert] = useState<IMetricAlert | undefined>()
  const [alertLoading, setAlertLoading] = useState<boolean>(false);
  const [readReplicaDbName, setReadReplicaDbName] = useState<string | null>(null)
  const [geoReplicaProperties, setGeoReplicaProperties] = useState<GeoReplicaProperties | null>(null)
  const [alertTypesList, setAlertTypesList] = useState<AlertInfo[]>(
    [
      {
        alertId: ALERT_TYPE.alert_activeQueriesFilter, alertName: "Active Queries Alert"
      },
      {
          alertId: ALERT_TYPE.alert_databaseUsedSpace, alertName: "Database Used Space Alert"
      },
      {
        alertId: ALERT_TYPE.alert_indexFragmentation, alertName: "Index Fragmentation Alert"
      },
      {
        alertId: ALERT_TYPE.alert_resourceUtilization, alertName: "Resource Utilization Alert"
      },
      {
        alertId: ALERT_TYPE.alert_logSpaceUsage, alertName: "Log Space Usage Alert"
      }
    ]
  )

  const fetchReplicaDetails = async () => {
    const dbInfo = await SQLService.getDatabaseDetail(props.databaseName)
    dbInfo && dbInfo.readReplicaDbName!=null ? setReadReplicaDbName(dbInfo.readReplicaDbName) : setReadReplicaDbName(null)
    dbInfo && dbInfo.geoReplicaProperties!=null ? setGeoReplicaProperties(dbInfo.geoReplicaProperties) : setGeoReplicaProperties(null)
    
  }

  useEffect(() => {
      (async () => {
        fetchReplicaDetails()
        })();
        return () => {}; 
  }, [])

  useEffect(() => {
    if (alertId && mode == "EDIT" && !alertLoading) { fetchAlert() };
  }, [mode, alertId])

  useEffect(() => {
    if(readReplicaDbName) {
      setAlertTypesList([...alertTypesList, { alertId: ALERT_TYPE.alert_readReplicationLag, alertName: "Read Replica Lag Alert"}])
    }
  }, [readReplicaDbName])

  useEffect(() => {
    if(geoReplicaProperties) {
      setAlertTypesList([...alertTypesList, { alertId: ALERT_TYPE.alert_geoReplicaLag, alertName: "Geo Replica Lag Alert"}])
    }
  }, [geoReplicaProperties])



  const alertSeverity: AlertSeverity[] = [
    { severityId: ALERT_SEVERITY.CRITICAL, severityName: "Critical" },
    { severityId: ALERT_SEVERITY.ERROR, severityName: "Error" },
    { severityId: ALERT_SEVERITY.INFORMATIONAL, severityName: "Informational" },
    { severityId: ALERT_SEVERITY.VERBOSE, severityName: "Verbose" },
    { severityId: ALERT_SEVERITY.WARNING, severityName: "Warning" }
  ]

  const supportedAlertInfo: AlertInfo[] = alertTypesList.filter((alertInfo) => {
      // console.log(`${alertInfo.alertId} is in ${supportedAlertTypes}\n${supportedAlertTypes?.includes(alertInfo.alertId)}`)
      return supportedAlertTypes?.includes(alertInfo.alertId)
    })

  const fetchAlert = () => {
    if (mode && mode == "EDIT" && alertId) {
      setAlertLoading(true)
      AlertService.fetchActiveAlert(databaseName, alertId)
      .then((res) => {
        setActiveAlert(res)
        setAlertLoading(false)
      }).catch((err) => {
        setAlertLoading(false)
      })
    }
  }

  const handleCloseDialog = () => {
    setActiveAlert(undefined)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={() => handleCloseDialog()}>
      <DialogTitle>
        Alert Configuration
        <Tooltip title="Close dialog">
          <IconButton onClick={() => handleCloseDialog()} className={classes.closeButton}>
            <CloseIcon fontSize="default" />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <Paper style={{ maxWidth: 1400, width: "-webkit-fill-available" }}>
        <div style={{ padding: "10px" }}>
          <div>
              <SqlAlertForm
                databaseName={databaseName}
                configuredByName={userName}
                configuredByEmail={userEmail}
                handleClose={() => handleCloseDialog()}
                supportedAlertsList={supportedAlertTypes ? supportedAlertInfo : alertTypesList}
                alertSeverityList={alertSeverity}
                alertData={activeAlert}
                primaryDbName={geoReplicaProperties && geoReplicaProperties.primaryDbName ? geoReplicaProperties.primaryDbName : undefined}
              ></SqlAlertForm>
          </div>
        </div>
      </Paper>
    </Dialog>
  );
};
