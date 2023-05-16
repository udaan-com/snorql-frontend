import React from "react";
import {TableCell} from "@mui/material";

interface LoadResponseCell {
    val?: string;
}

export const LoadResponseCell: React.FunctionComponent<LoadResponseCell> = props => {
    const {val} = props;
    if (!val) {
        return <TableCell align="right">-</TableCell>;
    }
    let color = ''; // What color to show in the worst case.
    if (parseFloat(val.slice(0, -1)) > 100) {
        color = '#FF0000'
    } else if (parseFloat(val.slice(0, -1)) > 80) {
        color = '#FFA500'
    } else {
        color = '#FFFFFF'
    }
    return (
        <TableCell style={{backgroundColor: color}}>
            {val}
        </TableCell>
    );
};
