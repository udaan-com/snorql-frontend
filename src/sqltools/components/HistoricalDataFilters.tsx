import { CircularProgress, FormControl, FormHelperText, InputAdornment, MenuItem, Select, TextField } from "@material-ui/core"
import React, { useState } from "react"
import { FunctionComponent } from "react"
import { IMetricHistoricalDataSchema } from "../models"

interface Props {
    handleSelectChange: (selectedValue: string) => void;
    handleFromDateChange: (e: string) => void;
    handleToDateChange: (e: string) => void;
    fetchNext: () => void;
    selectSelectedRunId: string;
    isSelectLoading: boolean;
    selectMenuItems: IMetricHistoricalDataSchema[];
    hasMoreResults: boolean;
    threshold: number;
}

export const HistoricalDataFilters: FunctionComponent<Props> = (props: Props) => {

    var today = new Date();
    const temp_today = new Date();
    var weekAgoDate = new Date(temp_today.setDate(temp_today.getDate() - 7));
    today.setHours(today.getHours() + 5); today.setMinutes(today.getMinutes() + 30);
    weekAgoDate.setHours(weekAgoDate.getHours() + 5); weekAgoDate.setMinutes(weekAgoDate.getMinutes() + 30);
    const dateTimeNow = today.toISOString().slice(0, 16);
    const dateTimeWeekAgo = weekAgoDate.toISOString().slice(0, 16);

    const { handleSelectChange, handleFromDateChange, handleToDateChange, fetchNext, selectSelectedRunId: selectSelectedValue, isSelectLoading, selectMenuItems, hasMoreResults, threshold } = props
    const [fromDate, setFromDate] = useState(dateTimeWeekAgo);
    const [toDate, setToDate] = useState(dateTimeNow);

    const handleSelectScroll = (event: any): void => {
        if (!isSelectLoading && hasMoreResults) {
            if (((event.target.scrollTop+event.target.clientHeight)/(event.target.scrollHeight)) > threshold) {
                fetchNext()
            }
        }
    }

    const handleToDateOnChange = (newToDate: string | null) => {
        if (newToDate !== null && newToDate !== toDate) {
            setToDate(newToDate)
            handleToDateChange(newToDate)
        }
    }

    const handleFromDateOnChange = (newFromDate: string | null) => {
        if (newFromDate !== null && newFromDate !== fromDate) {
            setFromDate(newFromDate)
            handleFromDateChange(newFromDate)
        }
    }

    const handleSelectOnChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        handleSelectChange(event.target.value as string)
    }

    const toPrettyDateString = (timestamp: Date): string => {
        return timestamp.toLocaleString()
    }

    return (
        <div style={{ marginLeft: '15px', padding: '10px' }}>
            <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                <TextField
                type="datetime-local"
                label="From Date Time"
                variant="outlined"
                value={fromDate}
                required
                onChange={(event: any) => handleFromDateOnChange(event.target.value)}
                />
            </FormControl>
            <FormControl style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                <TextField
                type="datetime-local"
                label="To Date Time"
                variant="outlined"
                value={toDate}
                required
                onChange={(event: any) => handleToDateOnChange(event.target.value)}
                InputProps={{ inputProps: { max: dateTimeNow } }}
                />
                </FormControl>
            {selectMenuItems && selectMenuItems.length > 0 &&
            <FormControl variant="outlined" style={{ minWidth: '320px', marginLeft: '10px', marginRight: '10px' }}>
                <Select
                value={selectSelectedValue}
                label="Select Metric Snapshot"
                displayEmpty
                required
                onChange={handleSelectOnChange}
                inputProps={{
                    endadornment: <InputAdornment position="end">{isSelectLoading && <CircularProgress />}</InputAdornment>,
                    }}
                MenuProps =  {{ 
                    PaperProps: {
                        onScroll: handleSelectScroll
                    },
                }}
                >
                <MenuItem disabled value="">
                    <em>Select an instance</em>
                </MenuItem>
                {selectMenuItems.map((selectMenuItem) => (
                    <MenuItem key={selectMenuItem.runId} value={selectMenuItem.runId}>
                        {toPrettyDateString(selectMenuItem.timestamp)}
                    </MenuItem>
                ))}
                </Select>
                <FormHelperText>Select instance to display</FormHelperText>
            </FormControl>
            }
        </div>
    )
}