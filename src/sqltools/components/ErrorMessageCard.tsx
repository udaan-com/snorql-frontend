import React from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import { Paper } from '@mui/material';
import { Button } from '@mui/material';
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
