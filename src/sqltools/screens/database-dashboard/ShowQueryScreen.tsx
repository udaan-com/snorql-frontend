import React, { FunctionComponent } from "react";
import { Box, Typography, Theme, createStyles } from "@material-ui/core"

import { makeStyles } from '@material-ui/core/styles';

interface ShowQueryScreenProps {
    query: string;
}

export const ShowQueryScreen: FunctionComponent<ShowQueryScreenProps> = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,

            content: {
                flexGrow: 1,
                padding: theme.spacing(3),
            },
        }));


    const classes = useStyles();
    return (

        <Box className={[classes.content, classes.toolbar].join(' ')} style={{ backgroundColor: '#D4D4D4' }} boxShadow={3}>
            <Typography variant="body1" gutterBottom style={{ width: '70%' }}>
                <code style={{ whiteSpace: 'pre-wrap', overflowX: 'scroll', flexWrap: 'wrap', wordWrap: 'break-word'}}>
                    {props.query}
                </code>
            </Typography>
        </Box>

    );
};
