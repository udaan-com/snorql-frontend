import React, {useState} from 'react';
import { TextField, Button, makeStyles } from '@material-ui/core';
import { SQLService } from '../services/SQLService';
import { alertType, CreatePayloadSQLAlert } from '../models';
import {AlertService} from "../services/AlertService";
import {MiscService} from "../services/MiscService";

interface Props {
    handleClose: () => void;
    name: string,
    type: alertType
}

const useStyles = makeStyles(theme => ({
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

export const AlertForm: React.FunctionComponent<Props> = (props: Props) => {
    const { handleClose, name, type } = props
    const classes = useStyles();
    const [duration, setDuration] = useState('24');
    const [threshold, setThreshold] = useState('10');
    const [hostname, setHostname] = useState('');
    const [squadName, setSquadName] = useState('');
    const [serviceSlug, setServiceSlug] = useState('');

    const handleSubmit = (e:any) => {
        e.preventDefault();
        const payload: CreatePayloadSQLAlert = {
            duration: parseInt(duration),
            threshold: parseInt(threshold),
            squadName,
            serviceSlug,
            name,
            hostname,
            disabled: false,
            type
        }
        MiscService.postAlertConfig(payload, type)
            .then(() => {
                handleClose()
                window.location.reload();
            })
            .catch(e => alert(e.message))
    };

    return (
        <form className={classes.root} onSubmit={handleSubmit}>
            <TextField
                type="number"
                label="Duration(in hours)"
                variant="outlined"
                required
                value={duration}
                onChange={e => setDuration(e.target.value)}
            />
            <TextField
                type="number"
                label="Threshold(in sec)"
                variant="outlined"
                required
                value={threshold}
                placeholder="<=60s(recommended)"
                onChange={e => setThreshold(e.target.value)}
            />
            <TextField
                label="Host Name"
                variant="outlined"
                value={hostname}
                onChange={e => setHostname(e.target.value)}
            />
            <TextField
                label="Squad Name"
                variant="outlined"
                required
                value={squadName}
                onChange={e => setSquadName(e.target.value)}
            />
            <TextField
                label="Squadcast Service Name"
                variant="outlined"
                required
                value={serviceSlug}
                onChange={e => setServiceSlug(e.target.value)}
            />
            <div>
                <Button variant="contained" onClick={handleClose}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                    Save
                </Button>
            </div>
        </form>
    );
};
