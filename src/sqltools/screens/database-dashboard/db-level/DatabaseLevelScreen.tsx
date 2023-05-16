import React, { FunctionComponent } from "react";
import { Box, Paper} from "@mui/material"

import { DatabaseStorageSizeScreen } from "./DatabaseStorageSizeScreen";
import { DatabaseTableSizeScreen } from "./DatabaseTableSizeScreen";
import { DatabaseTopIndexScreen } from "./DatabaseTopIndexScreen";
import { PVSScreen } from "./PVSScreen";
import { outerLevelUseStyles } from "../../../components/StyleClass";
import { DatabaseGrowthScreen } from "./DatabaseGrowthScreen";
import { MUIDataTableOptions } from "mui-datatables";
interface DatabaseLevelProps {
    databaseName: string;
}
export const tableOptions: MUIDataTableOptions = {
    filterType: "dropdown",
    selectableRows: 'none',
    print: false,
    download: true,
    setTableProps: () => {
        return {size: 'small'}
    },
    rowsPerPage: 50,
    rowsPerPageOptions: [50, 250, 500, 2000]
};

export const DatabaseLevelScreen: FunctionComponent<DatabaseLevelProps> = (props) => {
    const classes = outerLevelUseStyles();
    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={5}>
            <Paper>
                <DatabaseStorageSizeScreen databaseName={props.databaseName} />
                <DatabaseTableSizeScreen databaseName={props.databaseName} />
                <DatabaseTopIndexScreen databaseName={props.databaseName} />
                <DatabaseGrowthScreen databaseName={props.databaseName} />
                <PVSScreen databaseName={props.databaseName} />
            </Paper>
        </Box>
    );
};
