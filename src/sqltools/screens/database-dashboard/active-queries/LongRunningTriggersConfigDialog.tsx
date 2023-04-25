import {Button, CircularProgress, Dialog, DialogTitle, IconButton, Paper, Tooltip} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React, {FunctionComponent, useEffect, useState} from "react";
import CloseIcon from '@material-ui/icons/Close';
import {LongRunningQueriesTriggerForm} from "./LongRunningQueriesTriggerForm";
import MUIDataTable, {MUIDataTableColumn, MUIDataTableOptions} from "mui-datatables";
import {ICustomError, ILongRunningMetricTrigger} from "../../../models";
import {useAdminEmail, useAdminName} from "../../../../hooks";
import {getLongRunningQueriesTriggerConfigColumns} from "./allQueryColumns";
import {SnackbarComponent} from "../../../components/SnackbarComponent";
import {Fetcher} from "../../../../common/components/Fetcher";
import {ErrorMessageCard} from "../../../components/ErrorMessageCard";
import {addDataRecordingsEvent} from "../../../tracking/TrackEventMethods";
import {MenuTitle} from "../DatabaseDashboardScreen";
import {TriggersService} from "../../../services/TriggersService";

interface Props {
    open: boolean;
    handleClose: () => void;
    databaseName: string;
    metricId: string;
    metricName: string;
    minimumRepeatInterval?: number;
}

export const LongRunningTriggersConfigDialog: React.FunctionComponent<Props> = (props: Props) => {
    const { open, metricId, metricName, databaseName, minimumRepeatInterval, handleClose } = props

    const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        addRecorderButton: {
            position: 'absolute',
            right: theme.spacing(7),
            top: theme.spacing(2),
            textTransform: 'none'
        },
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
    const [loadingTriggerData, setLoadingTriggerData] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [triggerList, setTriggerList] = useState<ILongRunningMetricTrigger[]>([]);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
    const [triggerCols, setTriggerCols] = useState<any>([]);
    const [resetCols, setResetCols] = useState<any>([]);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarType, setSnackbarType] = useState('error');
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        if (triggerList && triggerList.length > 0) { 
            const columns = getLongRunningQueriesTriggerConfigColumns();
            if(resetCols.length > 0) {
                setTriggerCols(resetCols)
            } else {
                setTriggerCols(columns);
            }
        }
    }, [triggerList])

    const handleOnTriggerListResponse = (r: Array<ILongRunningMetricTrigger> | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        } else {
            setErrorMessage('');
            setTriggerList(r);
        }
        setLoadingTriggerData(false)
    }

    const handleSubmit = (description: string, repeatInterval: number, endTime: string, elapsedTime: number, dataRetentionPeriodInDays: number): boolean => {
        setSubmitLoading(true)
        const configuredByEmail = userEmail
        const configuredByName = userName // useAdminName()
        TriggersService.configureLongRunningQueriesTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), elapsedTime, dataRetentionPeriodInDays)
        .then(r => {
            TriggersService.getLongRunningTriggers(databaseName, metricId)
                .then((r) => {
                    handleOnTriggerListResponse(r)
                    setSubmitLoading(false)
                    setSnackbarValues(true, 'success', 'Data recording configured')
                    setAddDialogOpen(false)
                    return r == true
                })
        })
        .catch(e => {
            // setErrorMessage(`Failed to configure data recording, error: ${e}`)
            setSubmitLoading(false)
            setSnackbarValues(true, 'error', `Failed to configure data recording, error: ${e}`)
            setAddDialogOpen(false)
            return false
        })
        // fire add historical mixpanel event
        addDataRecordingsEvent({
            dbName: databaseName,
            userEmail,
            metricTitle: MenuTitle.PERFORMANCE,
            metricText: metricName
        })
        return true
    }

    const resetColumns = (column: string, action: string): any => {
        const prevColumns: MUIDataTableColumn[] = triggerCols;
        prevColumns.map((col) => {
            if(col.name == column && action == "add" && col.options) {
                col.options.display = true;
            }
            if(col.name == column && action == "remove" && col.options) {
                col.options.display = false;
            }
        })
        return prevColumns;
    }

    const deleteTrigger = async (triggerName: string) => {
        if (triggerName) {
            TriggersService.deleteTrigger(triggerName)
            .then(r => {
                if (r.error) {
                    setErrorMessage(r.error)
                    setSnackbarValues(true, 'error', r.error)
                    return false;
                } else {
                    TriggersService.getLongRunningTriggers(databaseName, metricId)
                .then((r) => {
                    handleOnTriggerListResponse(r)
                    setSnackbarValues(true, 'success', 'Trigger successfully deleted')
                    setAddDialogOpen(false)
                    return r == true ? true : false
                })
                }
            })
            .catch(e => {
                setErrorMessage('Unable to delete trigger: ' + e)
                setSnackbarValues(true, 'error', 'Unable to delete trigger: ' + e)
                setAddDialogOpen(false)
                return false
            })
        } else {
            setErrorMessage("Incorrect triggerName: " + triggerName + " found")
            setSnackbarValues(true, 'warning', "Incorrect triggerName: " + triggerName + " found")
            return false
        }
    }

    const setSnackbarValues = (snackbarOpen: boolean, snackbarType: string, snackbarMessage: string) => {
        setSnackbarOpen(snackbarOpen)
        setSnackbarType(snackbarType)
        setSnackbarMessage(snackbarMessage)
    }

    const options: MUIDataTableOptions = {
        filterType: "multiselect",
        selectableRows: 'single',
        print: false,
        download: true,
        onRowsDelete: (e) => { deleteTrigger(triggerList[e.data[0].dataIndex].triggerName) },
        setTableProps: () => {
            return {size: 'small'}
        },
        onViewColumnsChange: (column, action) => {
            const newColumns = resetColumns(column, action);
            setResetCols(newColumns)
        },
    };

    return (
        <Dialog open={open} maxWidth='md' fullWidth onClose={handleClose}>
            <SnackbarComponent 
                snackbarOpen={snackbarOpen} 
                handleClose={() => setSnackbarOpen(false)} 
                snackbarType={snackbarType} 
                snackbarMessage={snackbarMessage}>
            </SnackbarComponent>
            <DialogTitle>Data Recording Configuration
                <Button 
                onClick={() => setAddDialogOpen(true)}
                variant="contained" 
                color='primary' 
                className={classes.addRecorderButton}>
                    + Add Recorder
                </Button>
                <Tooltip title='Close dialog'>
                    <IconButton onClick={handleClose} className={classes.closeButton}>
                        <CloseIcon fontSize="default" />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <Paper style={{maxWidth: 1400, width: "-webkit-fill-available"}}>
                <Fetcher
                    fetchData={() => TriggersService.getLongRunningTriggers(databaseName, metricId)}
                    onFetch={(r) => { handleOnTriggerListResponse(r) }}
                >
                <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                    <DialogTitle>Add Data Recording Configuration
                        <Tooltip title='Close dialog'>
                            <IconButton onClick={() => setAddDialogOpen(false)} className={classes.closeButton}>
                                <CloseIcon fontSize="default" />
                            </IconButton>
                        </Tooltip>
                    </DialogTitle>
                    <LongRunningQueriesTriggerForm
                    handleClose={() => setAddDialogOpen(false) }
                    handleSubmit={handleSubmit}
                    databaseName={databaseName}
                    metricId={metricId}
                    metricName={metricName}
                    configuredByEmail={userEmail}
                    configuredByName={userName}
                    submitLoading={submitLoading}
                    minimumRepeatInterval={minimumRepeatInterval} />
                </Dialog> 
                <div style={{ padding: '10px' }}>
                    {!errorMessage && loadingTriggerData && 
                        <CircularProgress></CircularProgress>
                    }
                    <div>
                        {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                        {!errorMessage && 
                            <LongRunningQueriesTriggerTable 
                            rows={triggerList} 
                            columns={triggerCols} 
                            options={options} />
                        }
                    </div>
                </div>
                </Fetcher>
            </Paper>
        </Dialog>
    )
}

interface LongRunningQueriesTableProps {
    rows: ILongRunningMetricTrigger[];
    columns: [];
    options: MUIDataTableOptions
}

export const LongRunningQueriesTriggerTable: FunctionComponent<LongRunningQueriesTableProps> = (props) => {
    const { rows, columns, options } = props

    return (
        <MUIDataTable 
            title="" 
            data={rows} 
            columns={columns} 
            options={options}
        />
    );
};