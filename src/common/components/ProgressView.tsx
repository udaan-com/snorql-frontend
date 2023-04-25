import * as React from 'react';
import {Box, CircularProgress, Typography} from "@material-ui/core";

export default class ProgressView extends React.Component {
    render() {
        return (
            <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} margin={3} padding={4}>
                <CircularProgress style={{marginBottom: 10}} />
                <Typography variant={'subtitle1'}>
                    Loading
                </Typography>
            </Box>
        );
    }
}
