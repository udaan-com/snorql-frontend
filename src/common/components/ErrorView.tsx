import * as React from 'react';
import {Box, Button, Typography} from "@mui/material";

interface Props {
    error: Error;
    onRetry: () => void;
}

export default class ErrorView extends React.Component<Props> {
    render() {
        const {error, onRetry} = this.props;
        return (
            <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} margin={3}>
                <Typography variant={'subtitle1'} color={'error'}>
                    Error: {error.message}
                </Typography>
                <Button color="primary" onClick={onRetry} style={{marginTop: 16}}>
                    Retry
                </Button>
            </Box>
        );
    }
}
