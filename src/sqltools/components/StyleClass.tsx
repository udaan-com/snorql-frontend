import { Theme } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

export const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,
            content: {
                maxWidth: 1500,
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
            summaryContent: {
                justifyContent: "space-between",
                display: "flex",
                flexGrow: 1,
                marginBottom: "-10px"
            },
            simpleButton: {
                textTransform: 'none'
            }
        }));

export  const outerLevelUseStyles = makeStyles((theme: Theme) =>
createStyles({
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 150,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));