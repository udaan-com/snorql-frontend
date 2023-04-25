import React from "react";
import {TableCell} from "@material-ui/core";

interface HMCellProps {
    val?: number;
    good: number;
    bad: number;
    unit?: string;
}

export const HMCell: React.FunctionComponent<HMCellProps> = props => {
    const {val, good, bad, unit} = props;
    if (!val || isNaN(val) || val < 0) {
        return <TableCell align="right">0.00{unit || '%'}</TableCell>;
    }
    const opacity = val <= good ? 0 : val >= bad ? 1 : ((val - good) / (bad - good));
    const hex = Math.round(opacity * 255).toString(16);
    const h = hex.length == 1 ? `0${hex}` : hex;
    const color = `#BF616A${h}`; // What color to show in the worst case.
    return (
        <TableCell align="right" style={{backgroundColor: color}}>
            {val.toFixed(2)}{unit || '%'}
        </TableCell>
    );
};
