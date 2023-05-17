import React , { FunctionComponent, useEffect, useState } from "react";
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { TextField, Button, InputAdornment, CircularProgress, FormControl } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { ITableIndex } from "./IndexStatsColumn";
import { SQLService } from "../../../services/SQLService";

interface Props {
    handleClose: () => void;
    handleSubmit: (description: string, repeatInterval: number, endTime: string, tableName: string, indexName: string, dataRetentionPeriodInDays: number) => boolean;
    metricId: string;
    metricName: string;
    databaseName: string;
    configuredByName: string;
    configuredByEmail: string;
    submitLoading: boolean;
    minimumRepeatInterval?: number;
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

export const IndexStatsTriggerForm: FunctionComponent<Props> = (props: Props) => {
    const today = new Date()
    const tempToday = new Date()
    var weekAheadDate = new Date(tempToday.setDate(tempToday.getDate() + 7))
    weekAheadDate.setHours(weekAheadDate.getHours() + 5); weekAheadDate.setMinutes(weekAheadDate.getMinutes() + 30);
    const weekAheadString = weekAheadDate.toISOString().slice(0,16)
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    const todayString = today.toISOString().slice(0,16)
    const { handleClose, handleSubmit, metricId, metricName, databaseName, configuredByEmail, configuredByName, submitLoading, minimumRepeatInterval } = props
    const classes = useStyles();
    const [repeatInterval, setRepeatInterval] = useState(3600);
    const [dataRetentionPeriodInDays, setRetentionPeriod] = useState(7);
    const [endTime, setEndTime] = useState(weekAheadString); // useState(today.substring(0, today.length - 8));
    const [description, setDescription] = useState('');
    const [tableList, setTableList] = useState<string[]>([]);
    const [indexList, setIndexList] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [selectedIndex, setSelectedIndex] = useState('');
    const [tableIndex, setTableIndex] = useState<[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        SQLService.getTableList(props.databaseName)
            .then((r) => {
                setTableList(r.map((x: any) => x.tableName))
            }).catch((e) => {
                setErrorMessage(e)
            })
    }, [])

    const handleSubmitForm = () => { 
        const submitSuccessful = handleSubmit(description, repeatInterval, endTime, selectedTable, selectedIndex, dataRetentionPeriodInDays);
    }

    const handleTableSelection = (selectedTable: string | null) => {
        if(selectedTable !== null) {
            setSelectedTable(selectedTable);
            SQLService.getTableIndex(props.databaseName, selectedTable)
                .then((r) => {
                    setTableIndex(r)
                }).catch(
                    (e) => {
                        setErrorMessage(e.details);
                    }
                )
        }
    }
    const handleTableIndexSelection = (selectedTableIndex: ITableIndex | null) => {
        if(selectedTableIndex !== null) {
            setSelectedIndex(selectedTableIndex.indexName);
        }
    }

    return (
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
            <FormControl style={{ minWidth: '320px', }}>
                <Autocomplete
                    id="index-stats-table-name"
                    aria-required
                    options={tableList}
                    getOptionLabel={(option: string) => option}
                    style={{ width: 300 }}
                    renderInput={(params) => <TextField required {...params} label="Table Name" variant="outlined" />}
                    onChange={(event: any, newValue:string | null) => handleTableSelection(newValue)}
                />
            </FormControl>

            <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                <Autocomplete
                    id="index-stats-index-name"
                    aria-required
                    options={tableIndex}
                    getOptionLabel={(option: ITableIndex) => option.indexName}
                    style={{ width: 300 }}
                    renderInput={(params) => <TextField required {...params} label="Index Name" variant="outlined" />}
                    onChange={(event: any, newValue:ITableIndex | null) => handleTableIndexSelection(newValue)}
                />
            </FormControl>
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
            <TextField
                type="number"
                label="Repeat Interval"
                variant="outlined"
                required
                InputProps={{
                    endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                    inputProps: { min: minimumRepeatInterval }
                  }}
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
            />
            <TextField
                type="datetime-local"
                label="End Date Time"
                variant="outlined"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                InputProps={{
                    inputProps: { min: todayString }
                }}
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
                onChange={e => setRetentionPeriod(Number(e.target.value))}
            />
            <div>
                <div>
                <Button variant="contained" onClick={handleClose}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={submitLoading}>
                    {submitLoading ? <CircularProgress/> : 'Add Data Recording'}
                </Button>
                </div>
            </div>
        </form>
    );
}