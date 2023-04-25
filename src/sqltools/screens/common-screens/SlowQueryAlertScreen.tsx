import React, { FunctionComponent, useState } from "react";
import { useHistory } from "react-router-dom";
import { Box, Button, Typography, Paper, TextField, Grid } from "@material-ui/core"
import { AlertModalDialog } from '../../components/AlertModalDialog';
import { AlertDetailsCard } from "../../components/AlertDetailsCard";
import { alertType, GetSQLAlert } from "../../models";
import { Fetcher } from "../../../common/components/Fetcher";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {AlertService} from "../../services/AlertService";
import {MiscService} from "../../services/MiscService";

interface SlowQueryAlertScreenProps {
    name: string;
    type: alertType;
}

export const SlowQueryAlertScreen: FunctionComponent<SlowQueryAlertScreenProps> = (props) => {
    // AlertModalDialog helpers
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,

            content: {
                flexGrow: 1,
                padding: theme.spacing(3),
            },
        }));

    const classes = useStyles();

    // helpers
    const [alertDetailsList, setAlertDetailsList] = useState<GetSQLAlert[]>([]);

    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={10}>
            <Paper>
                <Box padding={2}>
                    <Fetcher
                        fetchData={() => MiscService.getAlertConfigByName(props.name, props.type)}
                        onFetch={r => setAlertDetailsList(r) }
                    >
                        <div style={{paddingBottom:'25px'}}>
                            <Button style={{ marginTop: '16px'}} variant="contained" color="primary" onClick={handleOpen}>Add New Alert</Button>
                            <AlertModalDialog open={open} handleClose={handleClose} name={props.name} type={props.type} />
                        </div>
                        {alertDetailsList.length > 0 && <Typography variant="h5" component="h2" color="textSecondary">Alert Configurations</Typography> }
                        <Grid container spacing={3}>
                            {alertDetailsList && alertDetailsList.map((item) => (
                                <Grid item xs={12} sm={6}>
                                    <AlertDetailsCard alertDetails={item} />
                                </Grid>
                            ))}
                        </Grid>
                        
                    </Fetcher>
                </Box>
            </Paper>
        </Box>

    );
};
