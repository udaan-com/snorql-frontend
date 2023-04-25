import React, { FunctionComponent, useState, useEffect } from "react";
import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import { SQLService } from "../../services/SQLService"
import { DbMetrics, DbMetricsExpanded, DbMetricWeeks } from "../../models";
import MUIDataTable, { MUIDataTableOptions, MUIDataTableColumnDef } from "mui-datatables";
import { dbMetricsColumns } from "./dbInsightsColumns";
import { Autocomplete } from '@material-ui/lab';
import { CustomError } from '../../CustomError';

export const DbMetricsScreen: FunctionComponent = () => {
    const [dbMetrics, setDbMetrics] = useState<DbMetricsExpanded[]>([]);
    const [weeks, setWeeks] = React.useState<string[]>([]);
    const [selectedWeek, setSelectedWeek] = React.useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const cols = dbMetricsColumns();

    useEffect(() => {
        fetchWeeks()
    }, [])

    useEffect(() => {
        if(selectedWeek !== undefined) {
            fetchDbMetrics(selectedWeek)
        }
    }, [selectedWeek])

    const fetchWeeks = () => {
        SQLService.fetchWeeks()
            .then((r: DbMetricWeeks) => {
                setWeeks(r.weeks)
                setSelectedWeek(r.weeks[0])
            }).catch((ex: CustomError) => {
                setErrorMessage(`${ex.message}: ${ex.details}`)
            })
    }

    const handleSelectionChange = (selectedWeek: string | null) => {
        if(selectedWeek !== null) {
            setSelectedWeek(selectedWeek)
        }
    }

    const getDbMetricExpanded = (dbMetrics: DbMetrics[]): DbMetricsExpanded[] => {
        const dbMetricsExpanded: DbMetricsExpanded[] = []
        dbMetrics.forEach(dbMetric => {
            dbMetricsExpanded.push({
                dbName: dbMetric.db.name,
                tier: dbMetric.db.tier,
                kind: dbMetric.db.kind,
                
                rebuildIndexesCountValue: dbMetric?.rebuildIndexesCount?.value,
                rebuildIndexesCountTimestamp: dbMetric?.rebuildIndexesCount?.timestamp,
            
                reorganizeIndexesCountValue: dbMetric?.reorganizeIndexesCount?.value,
                reorganizeIndexesCountTimestamp: dbMetric?.reorganizeIndexesCount?.timestamp,
            
                idxFragAbove90Value: dbMetric?.idxFragAbove90?.value,
                idxFragAbove90Timestamp: dbMetric?.idxFragAbove90?.timestamp,
            
                idxFragBetween60to90Value: dbMetric?.idxFragBetween60to90?.value,
                idxFragBetween60to90Timestamp: dbMetric?.idxFragBetween60to90?.timestamp,
            
                idxFragBetween30to60Value: dbMetric?.idxFragBetween30to60?.value,
                idxFragBetween30to60Timestamp: dbMetric?.idxFragBetween30to60?.timestamp,
            
                idxFragBetween15to30Value: dbMetric?.idxFragBetween15to30?.value,
                idxFragBetween15to30Timestamp: dbMetric?.idxFragBetween15to30?.timestamp,
            
                idxFragBelow15Value: dbMetric?.idxFragBelow15?.value,
                idxFragBelow15Timestamp: dbMetric?.idxFragBelow15?.timestamp,
                
                duplicateIndexesCountValue: dbMetric?.duplicateIndexesCount?.value,
                duplicateIndexesCountTimestamp: dbMetric?.duplicateIndexesCount?.timestamp,
            
                unusedIndexesCountValue: dbMetric?.unusedIndexesCount?.value,
                unusedIndexesCountTimestamp: dbMetric?.unusedIndexesCount?.timestamp,
            
                overlappingIndexesCountValue: dbMetric?.overlappingIndexesCount?.value,
                overlappingIndexesCountTimestamp: dbMetric?.overlappingIndexesCount?.timestamp,
            
                similarIndexesCountValue: dbMetric?.similarIndexesCount?.value,
                similarIndexesCountTimestamp: dbMetric?.similarIndexesCount?.timestamp,
            
                cpuPercentP99Value: dbMetric?.cpuPercentP99?.value,
                cpuPercentP99Timestamp: dbMetric?.cpuPercentP99?.timestamp,
            
                cpuPercentP95Value: dbMetric?.cpuPercentP95?.value,
                cpuPercentP95Timestamp: dbMetric?.cpuPercentP95?.timestamp,
            
                cpuPercentP90Value: dbMetric?.cpuPercentP90?.value,
                cpuPercentP90Timestamp: dbMetric?.cpuPercentP90?.timestamp,
            
                cpuPercentP70Value: dbMetric?.cpuPercentP70?.value,
                cpuPercentP70Timestamp: dbMetric?.cpuPercentP70?.timestamp,
                
                memPercentP99Value: dbMetric?.memPercentP99?.value,
                memPercentP99Timestamp: dbMetric?.memPercentP99?.timestamp,
            
                memPercentP95Value: dbMetric?.memPercentP95?.value,
                memPercentP95Timestamp: dbMetric?.memPercentP95?.timestamp,
            
                memPercentP90Value: dbMetric?.memPercentP90?.value,
                memPercentP90Timestamp: dbMetric?.memPercentP90?.timestamp,
            
                memPercentP70Value: dbMetric?.memPercentP70?.value,
                memPercentP70Timestamp: dbMetric?.memPercentP70?.timestamp,
            
                dataIoPercentP99Value: dbMetric?.dataIoPercentP99?.value,
                dataIoPercentP99Timestamp: dbMetric?.dataIoPercentP99?.timestamp,
            
                dataIoPercentP95Value: dbMetric?.dataIoPercentP95?.value,
                dataIoPercentP95Timestamp: dbMetric?.dataIoPercentP95?.timestamp,
            
                dataIoPercentP90Value: dbMetric?.dataIoPercentP90?.value,
                dataIoPercentP90Timestamp: dbMetric?.dataIoPercentP90?.timestamp,
            
                dataIoPercentP70Value: dbMetric?.dataIoPercentP70?.value,
                dataIoPercentP70Timestamp: dbMetric?.dataIoPercentP70?.timestamp,
            
                logIoPercentP99Value: dbMetric?.logIoPercentP99?.value,
                logIoPercentP99Timestamp: dbMetric?.logIoPercentP99?.timestamp,
            
                logIoPercentP95Value: dbMetric?.logIoPercentP95?.value,
                logIoPercentP95Timestamp: dbMetric?.logIoPercentP95?.timestamp,
            
                logIoPercentP90Value: dbMetric?.logIoPercentP90?.value,
                logIoPercentP90Timestamp: dbMetric?.logIoPercentP90?.timestamp,
            
                logIoPercentP70Value: dbMetric?.logIoPercentP70?.value,
                logIoPercentP70Timestamp: dbMetric?.logIoPercentP70?.timestamp,

                badges: dbMetric.badges
            })
        })
        return dbMetricsExpanded
    }

    const fetchDbMetrics = (weekStartDate: string) => {
        SQLService.fetchDbMetrics(weekStartDate)
            .then((r: DbMetrics[]) => {
                setDbMetrics(getDbMetricExpanded(r))
            }).catch((ex: CustomError) => {
                setErrorMessage(`${ex.message}: ${ex.details}`)
            })
    }

    const getWeekLabel = (weekStartDate: string): string => {
        const date = new Date(weekStartDate)
        const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
        const month = formatter.format(date).toUpperCase();   
        return `${month} ${date.getDate()}, ${date.getFullYear().toString().slice(-2)} - ${month} ${date.getDate() + 6}, ${date.getFullYear().toString().slice(-2)}`
    }

    const options: MUIDataTableOptions = {
        filter: true,
        filterType: "multiselect",
        responsive: "standard",
        setFilterChipProps: (colIndex, colName, data) => {
            return {
                color: "primary",
                variant: "outlined"
            };
        },
        selectableRows: "none",
        rowsPerPage: 50,
        rowsPerPageOptions: [50, 100, 500]
    };
    return (
        <Box padding={2} mt={2}>
            {weeks && weeks.length > 0 && selectedWeek && <div>
                <FormControl style={{margin:'5px', minWidth: 260}}>
                    <Autocomplete
                        options={weeks}
                        value={selectedWeek}
                        disableClearable
                        getOptionLabel={(option: string) => getWeekLabel(option)}
                        renderInput={(params) => (
                            <TextField {...params} label="Weeks" margin="normal" />
                        )}
                        onChange={(event: any, newValue: string | null) => handleSelectionChange(newValue) }
                    />
                </FormControl>
                {dbMetrics.length > 0 && (
                    <MUIDataTable
                        columns={cols}
                        data={dbMetrics}
                        options={options}
                        title={''}
                    />
                )}
                {!dbMetrics.length && (
                    <Box px={2} py={4}>
                        <Typography>No metrics found for the selected week.</Typography>
                    </Box>
                )}
            </div>}
            {weeks && weeks.length == 0 && (
                <Box px={2} py={4}>
                    <Typography>No records found</Typography>
                </Box>
            )}

            {errorMessage!=null && (
                <Box px={2} py={4}>
                    <Typography>{errorMessage}</Typography>
                </Box>
            )}
        </Box>
    );
};
