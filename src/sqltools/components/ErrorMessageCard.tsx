import React from 'react';
import { Typography } from '@material-ui/core';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { createStyles, Theme } from '@material-ui/core';
import { Paper } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

interface Props {
    text: string;
}
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: theme.mixins.toolbar,

        content: {
            maxWidth: 1500,
            flexGrow: 1,
            padding: theme.spacing(3),
        },
    })
);


export const ErrorMessageCard: React.FunctionComponent<Props> = (props: Props) => {
    const classes = useStyles();
    const { text } = props;
    const history = useHistory();

    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'}>
            <Paper>
                <div style={{ padding: '10px' }}>
                    <Typography variant={'h6'}>{text}</Typography>

                    <Button style={{ margin: '16px' }} variant={"contained"} onClick={() => history.push('/')}> Back to Home</Button>
                </div>
            </Paper>
        </Box>
    );
};
