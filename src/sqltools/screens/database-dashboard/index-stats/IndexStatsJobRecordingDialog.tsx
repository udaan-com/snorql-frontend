import { Button, CircularProgress, Dialog, DialogTitle, IconButton, Paper, Snackbar, Tooltip } from "@mui/material";
import { Theme } from "@mui/material/styles";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FunctionComponent, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import { useAdminEmail, useAdminName } from "../../../../hooks";
import { ICustomError, IIndexStatsTrigger } from "../../../models";
import { getIndexStatsTriggerConfigColumns } from "./AllIndexColumns";
import { SQLService } from "../../../services/SQLService";
import MUIDataTable, { MUIDataTableColumn, MUIDataTableOptions } from "mui-datatables";
import { Fetcher } from "../../../../common/components/Fetcher";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { IndexStatsTriggerForm } from "./IndexStatsTriggerForm";
import Alert from '@mui/material/Alert';
import { addDataRecordingsEvent } from "../../../tracking/TrackEventMethods";
import { MenuTitle } from "../DatabaseDashboardScreen";
import {TriggersService} from "../../../services/TriggersService";

interface Props {
    open: boolean;
    handleClose: () => void;
    databaseName: string;
    metricId: string;
    metricName: string;
    tableName: string;
    indexName: string;
    tableList: string[];
    minimumRepeatInterval?: number;
}

export const IndexStatsJobRecordingDialog: React.FunctionComponent<Props> = (props: Props) => {
    const { open, metricId, metricName, databaseName, tableName, indexName, tableList, minimumRepeatInterval, handleClose } = props

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
    const [triggerList, setTriggerList] = useState<IIndexStatsTrigger[]>([]);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
    const [triggerCols, setTriggerCols] = useState<any>([]);
    const [resetCols, setResetCols] = useState<any>([]);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

    useEffect(() => {
        if (triggerList && triggerList.length > 0) { 
            const columns = getIndexStatsTriggerConfigColumns();
            if(resetCols.length > 0) {
                setTriggerCols(resetCols)
            } else {
                setTriggerCols(columns);
            }
        } 
        else {
            setErrorMessage("No Triggers found");
            setSnackbarOpen(true)
        }
    }, [triggerList])

    const handleOnTriggerListResponse = (r: Array<IIndexStatsTrigger> | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
            setSnackbarOpen(true)
        } else {
            setErrorMessage('')
            setTriggerList(r);
        }
        setLoadingTriggerData(false)
    }

    const handleSubmit = (description: string, repeatInterval: number, endTime: string, tableName: string, indexName: string, dataRetentionPeriodInDays: number): boolean => {
        setSubmitLoading(true)
        const configuredByEmail = userEmail
        const configuredByName = userName
        TriggersService.configureIndexStatsTrigger(databaseName, configuredByName, configuredByEmail, description, repeatInterval, new Date(endTime), tableName, indexName, dataRetentionPeriodInDays)
        .then(r => {
            TriggersService.getIndexStatsTriggers(databaseName, metricId)
            .then((r) => {
                handleOnTriggerListResponse(r)
                setSubmitLoading(false)
                setAddDialogOpen(false)
                return r == true ? true : false
            })
        })
        .catch(e => {
            setErrorMessage(`Failed to check db existence, error: ${e}`)
            setSubmitLoading(false)
            setSnackbarOpen(true)
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
                    setSnackbarOpen(true)
                    return false;
                } else {
                return r == true ? true : false
                }
            })
            .catch(e => {
                setErrorMessage('Unable to delete trigger: ' + e) 
                setSnackbarOpen(true)
                return false
            })
        } else {
            setErrorMessage("Incorrect triggerName: " + triggerName + " found")
            setSnackbarOpen(true)
            return false
        }
    }

    const options: MUIDataTableOptions = {
        filterType: "multiselect",
        print: false,
        download: true,
        onRowsDelete: (e) => { deleteTrigger(triggerList[e.data[0].dataIndex].triggerName) },
        selectableRows: 'single',
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
            <DialogTitle>Data Recording Configuration
                <Button 
                onClick={() => setAddDialogOpen(true)}
                variant="contained" 
                color='primary' 
                className={classes.addRecorderButton}>
                    + Add Recorder
                </Button>
                <Tooltip title='Close dialog'>
                    <IconButton onClick={handleClose} className={classes.closeButton} size="large">
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                    <DialogTitle>Add Data Recording Configuration
                        <Tooltip title='Close dialog'>
                            <IconButton
                                onClick={() => setAddDialogOpen(false)}
                                className={classes.closeButton}
                                size="large">
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </DialogTitle>
                    <IndexStatsTriggerForm
                    handleClose={() => setAddDialogOpen(false)}
                    handleSubmit={handleSubmit}
                    databaseName={databaseName}
                    metricId={metricId}
                    metricName={metricName}
                    configuredByEmail={userEmail}
                    configuredByName={userName}
                    submitLoading={submitLoading}
                    minimumRepeatInterval={minimumRepeatInterval} />
                </Dialog> 
            <Paper style={{maxWidth: 1400, width: "-webkit-fill-available"}}>
                <Fetcher
                    fetchData={() => TriggersService.getIndexStatsTriggers(databaseName, metricId)}
                    onFetch={(r) => { handleOnTriggerListResponse(r) }}
                >
                <div style={{ padding: '10px' }}>
                    {!errorMessage && loadingTriggerData && !triggerList && 
                        <CircularProgress></CircularProgress>
                    }
                    <div>
                        {errorMessage && <ErrorMessageCard text={errorMessage}/>}
                        {triggerList && triggerList.length > 0 &&
                            <IndexStatsTriggerTable
                            rows={triggerList} 
                            columns={triggerCols} 
                            options={options}>
                            </IndexStatsTriggerTable>
                        }
                    </div>
                </div>
                {errorMessage &&
                <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
                    <Alert severity="error">
                        {errorMessage}
                    </Alert>
                </Snackbar> }
                </Fetcher>
            </Paper>
        </Dialog>
    );
}

interface IndexStatsTableProps {
    rows: IIndexStatsTrigger[];
    columns: [];
    options: MUIDataTableOptions;
}

export const IndexStatsTriggerTable: FunctionComponent<IndexStatsTableProps> = (props) => {
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