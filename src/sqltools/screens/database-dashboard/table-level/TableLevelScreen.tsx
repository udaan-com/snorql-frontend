import React, { FunctionComponent, useEffect, useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, TextField } from "@material-ui/core"

import { TableSizeScreen } from "./TableSizeScreen";
import { TableUnusedIndexScreen } from "./TableUnusedIndexScreen";
import { outerLevelUseStyles } from "../../../components/StyleClass";
import { SQLService } from "../../../services/SQLService";
import { TableSchemaScreen } from "./TableSchemaScreen";
import Autocomplete from '@material-ui/lab/Autocomplete';

interface TableLevelProps {
    databaseName: string;
}

export const TableLevelScreen: FunctionComponent<TableLevelProps> = (props) => {
    const classes = outerLevelUseStyles();
    const [tableList, setTableList] = useState<[]>([]);
    const [tableName, setTableName] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setTableName("")
        SQLService.getTableList(props.databaseName)
            .then((r) => {
                setTableList(r.map((x: any) => x.tableName))
            }).catch((e) => {
                setErrorMessage(e)
            })
    }, [])

    const handleSelectChange = (selectedTable: string | null) => {
        if(selectedTable !== null) {
            setTableName(selectedTable);
        }
    }

    useEffect(() => {
        setTableName(tableName)
    }, [tableName])
    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={5}>
            <Paper>
            <div style={{ marginLeft: '15px', padding: '10px' }}>
                <h2 style={{ padding: '5px' }} >Enter Inputs</h2>

                <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                    <Autocomplete
                        id="index-stats-table-name"
                        options={tableList}
                        getOptionLabel={(option: string) => option}
                        style={{ width: 300 }}
                        renderInput={(params:any) => <TextField {...params} label="Table Name" variant="outlined" />}
                        onChange={(event: any, newValue:string | null) => handleSelectChange(newValue)}
                    />
                </FormControl>
            </div>
            <TableSchemaScreen databaseName={props.databaseName} tableName={tableName}/> 
            <TableSizeScreen databaseName={props.databaseName} tableName={tableName}/>
            <TableUnusedIndexScreen databaseName={props.databaseName} tableName={tableName}/>
            </Paper>
        </Box>
    );
};
