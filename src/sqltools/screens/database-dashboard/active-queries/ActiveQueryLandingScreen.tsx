import React, { FunctionComponent } from "react";
import { Box, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { AllQueriesScreen } from "./AllQueriesScreen";
import { LongRunningQueriesScreen } from "./LongRunningQueriesScreen";
import { BlockingQueriesScreen } from "./BlockingQueriesScreen";
import { DatabaseType } from "../../../models";

interface ActiveQueryLandingProps {
    databaseName: string;
    databaseType: DatabaseType;
    isDbConfigured: Boolean;
    baseurl: string;
}

export const ActiveQueryLandingScreen: FunctionComponent<ActiveQueryLandingProps> = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,
            content: {
                width: "80%",
                flexGrow: 1,
                padding: theme.spacing(3),
            },
            heading: {
                fontSize: theme.typography.pxToRem(15),
                fontWeight: "bold",
                flexBasis: '33.33%',
                flexShrink: 0,
                textTransform: "uppercase"
            },
        }));
    const classes = useStyles();

    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'}>

            <AllQueriesScreen databaseName={props.databaseName} baseurl={props.baseurl} databaseType={props.databaseType} />
            { props.databaseType == DatabaseType.SQLSERVER && <LongRunningQueriesScreen databaseName={props.databaseName} baseurl={props.baseurl}/> }
            { props.databaseType == DatabaseType.SQLSERVER && <BlockingQueriesScreen databaseName={props.databaseName}/> }
        </Box>
    )
};

