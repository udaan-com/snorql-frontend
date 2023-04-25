import React , { FunctionComponent, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button, InputAdornment, CircularProgress } from '@material-ui/core';
import { IMetricTrigger, Database } from "../models";
import { ErrorMessageCard } from "./ErrorMessageCard";
import DeleteIcon from '@material-ui/icons/Delete';
import { SQLService } from "../services/SQLService";
import {TriggersService} from "../services/TriggersService";

interface Props {
    handleClose: () => void;
    handleSubmit: (description: string, repeatInterval: number, endTime: string, dataRetentionPeriodInDays: number) => any;
    clearTriggerData: () => void;
    triggerData?: IMetricTrigger
    metricId: string;
    metricName: string;
    databaseName: string;
    configuredByName: string;
    configuredByEmail: string;
    submitLoading: boolean;
    loadingTriggerData: boolean;
    minimumRepeatInterval?: number;
    triggerDataForReplica?: IMetricTrigger;
    databaseDetail?: Database
}

const useStyles = makeStyles(theme => ({
    buttonStyle: {
        textTransform: 'none'
    },
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(2),
  
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '300px',
      },
      '& .MuiButtonBase-root': {
        margin: theme.spacing(2),
      },
    },
  }));

export const REPEAT_INTERVAL_FOR_COMPUTE_UTILIZATION = 3000;

export const SingleTriggerConfigurationDisplay: FunctionComponent<Props> = (props: Props) => {
    const today = new Date()
    const tempToday = new Date()
    const REPEAT_INTERVAL = 3600
    var weekAheadDate = new Date(tempToday.setDate(tempToday.getDate() + 7))
    weekAheadDate.setHours(weekAheadDate.getHours() + 5); weekAheadDate.setMinutes(weekAheadDate.getMinutes() + 30);
    const weekAheadString = weekAheadDate.toISOString().slice(0,16)
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    const todayString = today.toISOString().slice(0,16)
    const { handleClose, handleSubmit, clearTriggerData, triggerData, metricId, metricName, databaseName, configuredByEmail,
         configuredByName, submitLoading, minimumRepeatInterval, triggerDataForReplica, databaseDetail } = props
    const classes = useStyles();
    const [repeatInterval, setRepeatInterval] = useState(REPEAT_INTERVAL);
    const [dataRetentionPeriodInDays, setDataRetentionPeriodInDays] = useState(7);
    const [endTime, setEndTime] = useState(weekAheadString);
    const [description, setDescription] = useState('');
    const [editMode, setEditMode] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const handleSubmitForm = (event: any): Boolean => { 
        event.preventDefault()
        const success = handleSubmit(description, repeatInterval, endTime, dataRetentionPeriodInDays)
        if (success) {
            setEditMode(false);
        } else {
            setErrorMessage("Unable to configure trigger. Please try again later.");
        }
        return false
    }

    const handleTriggerDelete = () => {
        setDeleteLoading(true)
        if(metricId == "performance_computeUtilization") {
            handleTriggerDeleteForComputeUtilization()
        } else {
            if (triggerData && triggerData.triggerName) {
                TriggersService.deleteTrigger(triggerData.triggerName)
                .then(r => {
                    setDeleteLoading(false)
                    if (r == true) clearTriggerData()
                    else setErrorMessage("Unable to delete trigger")
                })
                .catch(e => {
                    setErrorMessage(`Failed to delete trigger, error: ${e}`)
                    setDeleteLoading(false)
                })
            }
        }
    }

    const handleTriggerDeleteForComputeUtilization = async () => {
        try {
            if(databaseDetail?.readReplicaDbName && triggerData && triggerData.triggerName && triggerDataForReplica && triggerDataForReplica.triggerName) {
                const res = await Promise.all([
                    TriggersService.deleteTrigger(triggerData.triggerName),
                    TriggersService.deleteTrigger(triggerDataForReplica.triggerName)
                ]);
                const data = res.map((res) => res).flat();
                const primaryDbResponse: boolean = data[0];
                const replicaDbResponse: boolean = data[1];
                
                setDeleteLoading(false)
                if (primaryDbResponse && replicaDbResponse) clearTriggerData()
                else setErrorMessage("Unable to delete trigger")
            } else if(triggerData && triggerData.triggerName) {
                const primaryDbResponse = await TriggersService.deleteTrigger(triggerData.triggerName)
                setDeleteLoading(false)
                if (primaryDbResponse) clearTriggerData()
                else setErrorMessage("Unable to delete trigger")
            } else {
                setErrorMessage("Unable to delete trigger")
            }
        } catch (e) {
            setErrorMessage(`Failed to fetch triggers, error: ${e}`)
            setDeleteLoading(false)
        }
    }

    return (
        <>
        {errorMessage && <ErrorMessageCard text={errorMessage}/>}
        <form className={classes.root} onSubmit={handleSubmitForm}>
            <TextField
                label="Database Name"
                variant="outlined"
                required
                value={databaseName}
                InputProps={{
                    readOnly: true,
                }}
                onChange={e => null}
            />
            <TextField
                label="Metric Name"
                variant="outlined"
                required
                value={metricName}
                InputProps={{
                    readOnly: true,
                }}
                onChange={e => null}
            />
            {triggerData && !editMode &&
            <>
            <TextField
                label="Configured By"
                variant="outlined"
                required
                value={`${triggerData.configuredByName} (${triggerData.configuredByEmail})`}
                InputProps={{
                    readOnly: true,
                }}
                onChange={e => null}
            />
            <TextField
                label="Description"
                variant="outlined"
                required
                value={triggerData.description}
                InputProps={{
                    readOnly: true,
                }}
                onChange={e => setDescription(e.target.value)}
            />
            {metricId != "performance_computeUtilization" && <TextField
                type="number"
                label="Repeat Interval"
                variant="outlined"
                required
                InputProps={{
                    readOnly: true,
                    endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                  }}
                value={ metricId == "performance_computeUtilization" ? REPEAT_INTERVAL_FOR_COMPUTE_UTILIZATION : triggerData.repeatInterval } 
                onChange={e => setRepeatInterval(Number(e.target.value))}
            />}
            {triggerData.endTime !== "" &&
            <TextField
                type="datetime-local"
                label="End Date Time"
                variant="outlined"
                helperText="Stop data recording on"
                value={triggerData.endTime}
                onChange={e => setEndTime(e.target.value)}
                InputProps={{
                    readOnly: true,
                }}
                InputLabelProps={{
                    shrink: true,
                }}
            />}
            <TextField
                type="number"
                label="Retention Period"
                variant="outlined"
                required
                InputProps={{
                    readOnly: true,
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                value={triggerData.dataRetentionPeriodInDays}
                onChange={e => setRepeatInterval(Number(e.target.value))}
            />
            </>}
            {(!triggerData || editMode) &&
            <>
            <TextField
                label="Configured By"
                variant="outlined"
                required
                value={`${configuredByName} (${configuredByEmail})`}
                InputProps={{
                    readOnly: true,
                }}
                onChange={e => null}
            />
            <TextField
                label="Description"
                variant="outlined"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            {metricId != "performance_computeUtilization" && <TextField
                type="number"
                label="Repeat Interval"
                variant="outlined"
                required
                InputProps={{
                    endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                    inputProps: { min: minimumRepeatInterval }
                  }}
                value={ metricId == "performance_computeUtilization" ? REPEAT_INTERVAL_FOR_COMPUTE_UTILIZATION : repeatInterval } 
                onChange={e =>setRepeatInterval(Number(e.target.value))}
            />}
            <TextField
                type="datetime-local"
                label="End Date Time"
                variant="outlined"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                InputLabelProps={{
                    shrink: true,
                }}
                InputProps={{
                    inputProps: { min: todayString }
                }}
                helperText="Stop data recording on"
            />
            <TextField
                type="number"
                label="Retention Period"
                variant="outlined"
                required
                InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                    inputProps: { min: 1 }
                  }}
                value={dataRetentionPeriodInDays}
                onChange={e => setDataRetentionPeriodInDays(Number(e.target.value))}
            />
            </>}
            <div>
                {(!triggerData || editMode) &&
                <div>
                <Button className={classes.buttonStyle} variant="contained" onClick={handleClose}>
                    Cancel
                </Button>
                <Button className={classes.buttonStyle} type="submit" variant="contained" color="primary">
                    {submitLoading ? <CircularProgress color="secondary"/> : 'Add Data Recording'}
                </Button>
                </div>
                }
                {triggerData && !editMode &&
                <div>
                    <Button className={classes.buttonStyle} variant="contained" color="secondary" startIcon={<DeleteIcon />} 
                    onClick={() => handleTriggerDelete()} disabled={deleteLoading}>
                        Delete
                    </Button>
                    <Button className={classes.buttonStyle} variant="contained" color="primary" onClick={() => setEditMode(true)}>
                        Edit Trigger
                    </Button>
                </div>
                }
            </div>
        </form>
        </>
    );
}