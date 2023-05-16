import { Box, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import React from "react";
import { FunctionComponent } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { IndexFragmentationScreen } from "./IndexFragmentationScreen";
import { IndexRedundancyAnalysis } from "./IndexRedundancyAnalysis";

interface DatabaseOptimizationprops {
    databaseName: string
}

export const DatabaseOptimizationLandingScreen: FunctionComponent<DatabaseOptimizationprops> = (props) => {

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,
            content: {
                maxWidth: "85%",
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
            <IndexFragmentationScreen databaseName={props.databaseName} />
            <IndexRedundancyAnalysis databaseName={props.databaseName} />
        </Box>
    )
}