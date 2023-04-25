import { makeStyles, Theme, createStyles } from "@material-ui/core";

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