import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Box, Button, Typography, Paper, FormControl, TextField } from "@mui/material"
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { SessionLocksScreen } from "./SessionLocksScreen";
import { SessionActiveQueryScreen } from "./SessionActiveQueryScreen";
import { LatestExecutedQueryScreen } from "./LatestExecutedQuery";

interface DebuggingScreenProps {
    databaseName: string;
}

export const DebuggingScreen: FunctionComponent<DebuggingScreenProps> = (props) => {

    const [sessionId, setSessionId] = useState<number>()
    const [sessionIdTemp, setSessionIdTemp] = useState<number>()
    const {search} = useLocation();
    const history = useHistory();
    const sq = new URLSearchParams(search);
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,
            simpleButton: { textTransform: "none"},
            content: {
                flexGrow: 1,
                padding: theme.spacing(3),
            },
        }));
    const classes = useStyles();

    useEffect(() => {
        const sessionIdFromParam = sq.get("sessionId")
        if (sessionIdFromParam && Number(sessionIdFromParam)) { 
            setSessionIdTemp(Number(sessionIdFromParam))
            setSessionId(Number(sessionIdFromParam))
        }
    }, [search])

    const handleSearch = () => {
        if (sessionIdTemp && sessionIdTemp != sessionId) {
            sq.set("sessionId", sessionIdTemp.toString())
            history.push({
                search: '?sessionId=' + sessionIdTemp
            })
            setSessionId(sessionIdTemp)
            // console.log("Handle Search called!!")
        }
    }

    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={5}>
            <Paper>
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                <h2 style={{ padding: '5px' }} >Enter Inputs</h2>

                <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                <div style={{marginLeft:'5px', padding: '10px'}}>
                    <Typography style={{ padding: '5px'}} variant={"subtitle1"}>Session ID</Typography>
                    <TextField
                    type="number"
                    label="Enter Session ID"
                    variant="outlined"
                    style={{width:'250px'}}
                    value={sessionIdTemp}
                    onChange={(e) => setSessionIdTemp(Number(e.target.value))}
                    />
                    <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleSearch()}
                    className={classes.simpleButton}
                    style={{marginLeft: 8, height: '56px', width: 'auto'}}>
                        Search
                    </Button>
                </div>
                </FormControl>
            </div>
            { sessionId && <LatestExecutedQueryScreen databaseName={props.databaseName} sessionId={sessionId} />}
            { sessionId && <SessionActiveQueryScreen databaseName={props.databaseName} sessionId={sessionId} />}
            { sessionId && <SessionLocksScreen databaseName={props.databaseName} sessionId={sessionId} />}
            </Paper>
        </Box>
    );
};