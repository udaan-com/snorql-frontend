import * as React from "react";
import {Box, BoxProps} from "@mui/material";

export const FBox: React.FunctionComponent<BoxProps> = props => {
    // noinspection JSUnusedLocalSymbols
    const {display, children, ...rest} = props;
    const newProps = {
        ...rest,
    };
    return (
        <Box display={"flex"} {...newProps}>
            {children}
        </Box>
    );
};
