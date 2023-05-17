import React from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import { Button } from '@mui/material';
import { useHistory } from 'react-router-dom';

interface Props {
    text: string;
}

export const NoDataExists: React.FunctionComponent<Props> = (props: Props) => {
    const { text } = props;
    const history = useHistory();

    return (
        <Box padding={2}>
            <Typography variant={'h6'}>{text}</Typography>
            <Button style={{ margin: '16px' }} variant={"contained"} onClick={() => history.push('/')}> Back to Home</Button>
        </Box>
    );
};
