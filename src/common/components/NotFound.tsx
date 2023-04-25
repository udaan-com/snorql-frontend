import React from 'react';
import {Box, Button, Typography} from "@material-ui/core";
import {useHistory} from "react-router";
import {ScreenContainer} from "./ScreenContainer";

export const NotFound: React.FunctionComponent = () => {
    const history = useHistory();
    return (
        <ScreenContainer title={"Not Found"}>
            <Box flex={1} alignItems={'center'} justifyContent={'center'} paddingTop={10}>
                <Typography variant={'h3'}>Not Found</Typography>
                <Typography variant={'body1'}>The page you requested was not found.</Typography>
                <Button style={{marginTop: 8}} variant={"contained"} onClick={() => history.push('/')}>Home</Button>
            </Box>
        </ScreenContainer>
    );
};
