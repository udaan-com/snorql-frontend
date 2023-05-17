import React, { FunctionComponent, useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material"
import { RenderChart } from "./RenderChart";
import { AggregationType } from "./ComputeUtilizationScreen";
import { Database } from "../../../models";

interface HistoricalProps {
    databaseName: string;
    databaseDetail: Database
}

export const Historical: FunctionComponent<HistoricalProps> = (props) => {
    const [aggregationType, setAggregationType] = useState<AggregationType>('Max');

    return (
        <div>
            <div>
                <Box mt={2}>
                    <div>
                        <FormControl variant="outlined" style={{minWidth: 150, float:'right', marginRight:'10%'}}>
                            <InputLabel id="historical-aggregation-type-label">Aggregation type</InputLabel>
                            <Select
                                labelId="historical-aggregation-type-label"
                                id="historical-aggregation-type"
                                value={aggregationType}
                                onChange={(event: SelectChangeEvent<"Avg" | "Max">) => setAggregationType(event.target.value as AggregationType)}
                                label="Aggregation type"
                            >
                                <MenuItem value={'Avg'}>Avg</MenuItem>
                                <MenuItem value={'Max'}>Max</MenuItem>
                            </Select>
                        </FormControl>
                        <RenderChart 
                            databaseName={props.databaseName}
                            aggregationType={aggregationType}
                        />
                        {props.databaseDetail.readReplicaDbName && <RenderChart 
                            databaseName={`${props.databaseDetail.readReplicaDbName}`}
                            aggregationType={aggregationType}
                        />}
                    </div>
                </Box>
            </div>
        </div>
    )
}