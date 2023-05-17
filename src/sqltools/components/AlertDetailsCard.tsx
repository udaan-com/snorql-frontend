import React, {useState} from 'react';
import { TextField, Button, Card, CardContent, Checkbox } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { GetSQLAlert, UpdatePayloadSQLAlert } from '../models';
import {MiscService} from "../services/MiscService";
interface Props {
    alertDetails: GetSQLAlert
}

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        marginTop: '25px',
        marginLeft: '10px',
        marginRight: '10px',
        width: 'max-content'
    },
    div: {
        padding: '10px', 
        display:'flex', 
        justifyContent:'space-around'
    },
    textField: {
        padding: '10px',
        width: '300px'
    },
    title: {
      fontSize: 14,
    }
});

export const AlertDetailsCard: React.FunctionComponent<Props> = (props: Props) => {
    const classes = useStyles();
    const { alertDetails } = props
    const [duration, setDuration] = useState(alertDetails.duration.toString());
    const [threshold, setThreshold] = useState(alertDetails.threshold.toString());
    const [squadName, setSquadName] = useState(alertDetails.squadName);
    const [hostname, setHostname] = useState(alertDetails.hostname);
    const [serviceSlug, setServiceSlug] = useState(alertDetails.serviceSlug);
    const [alertDisabled, setAlertDisabled] = useState<Boolean>(alertDetails.disabled);

    const [editMode, setEditMode] = useState(false)
    const handleSubmit = (e:any) => {
        e.preventDefault();
        if(editMode) {
            setEditMode(false)
            const payload: UpdatePayloadSQLAlert = {
                duration: parseInt(duration),
                threshold: parseInt(threshold),
                squadName,
                serviceSlug,
                name: alertDetails.name,
                hostname,
                disabled: alertDisabled
            }
            MiscService.putAlertConfig(alertDetails.id, payload, alertDetails.type)
                .then(() => {
                    window.location.reload();
                }).catch(e => alert(e.message))
        } else {
            setEditMode(true)
        }
    };

    return (
        <Card className={classes.root} variant="outlined">
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className={classes.div}>
                        <TextField
                            className={classes.textField}
                            disabled={!editMode}
                            label="DURATION(in hours)"
                            defaultValue={duration}
                            variant="outlined"
                            onChange={e => setDuration(e.target.value)}
                        />
                        <TextField
                            className={classes.textField}
                            disabled={!editMode}
                            label="THRESHOLD(in secs)"
                            defaultValue={threshold}
                            placeholder="<=60s(recommended)"
                            variant="outlined"
                            onChange={e => setThreshold(e.target.value)}
                        />
                    </div>
                    <div className={classes.div}>
                        <TextField
                            className={classes.textField}
                            disabled={!editMode}
                            label="SQUAD NAME"
                            defaultValue={squadName}
                            variant="outlined"
                            onChange={e => setSquadName(e.target.value)}
                        />
                        <TextField
                            className={classes.textField}
                            disabled={!editMode}
                            label="SQUADCAST SERVICE NAME"
                            defaultValue={serviceSlug}
                            variant="outlined"
                            onChange={e => setServiceSlug(e.target.value)}
                        />
                    </div>
                    <div  style={{padding: '10px'}}>
                        <TextField
                            className={classes.textField}
                            disabled={!editMode}
                            label="HOST NAME(optional)"
                            defaultValue={hostname}
                            variant="outlined"
                            onChange={e => setHostname(e.target.value)}
                        />
                    </div>
                    <div>
                        <span style={{width:'295px', color:'grey', padding: '10px'}}>
                            <Checkbox
                                disabled={!editMode}
                                checked={alertDisabled ? true : false}
                                onChange={() => setAlertDisabled(!alertDisabled)}
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                            Disable Alerts
                        </span>
                    </div>
                    <div style={{ padding: '20px', float: 'right'}}>
                        {editMode ? (
                            <Button type="submit" variant="contained" color="primary">
                                Save
                            </Button>
                        ): (
                            <Button variant="contained" onClick={handleSubmit}>
                                Edit
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
