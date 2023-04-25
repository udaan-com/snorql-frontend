import React from 'react';
import { Typography } from '@material-ui/core';
import { Box } from '@material-ui/core';
import { Button } from '@material-ui/core';
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
