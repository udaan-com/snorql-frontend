import React, { FunctionComponent, useState, useEffect } from "react";
import { Box, MenuItem, TextField, Typography, Chip } from "@mui/material";
import { Fetcher } from "../../common/components/Fetcher";
import { useHistory } from "react-router";
import { Table, TableBody, TableCell, TableRow, TableContainer, TableHead } from "@mui/material";
import { FilterList } from "../components/FilterList";
import { IContainer, GetSQLAlert } from "../models";
import {MiscService} from "../services/MiscService";

export const CronJobsListScreen: FunctionComponent = () => {
    const [cronjobs, setCronjobs] = useState<IContainer[]>([]);
    const [dropdownMode, setDropdownMode] = useState('all');
    const history = useHistory();
    const dropdownModeValues = [
        {
            value: 'all',
            label: 'All Cronjobs',
        },
        {
            value: 'onboarded',
            label: 'Onboarded Cronjobs',
        },
        {
            value: 'yetToOnboard',
            label: 'Cronjobs yet to Onboard',
        }
    ];
    const onMouseOver = (event:any) => {
        event.target.style.cursor = "pointer"
        event.target.style.background = "#D3D3D3"
    }

    const onMouseOut = (event:any) => {
        event.target.style.background = "#FFFFFF"
    }

    const handleAPICall = async (r: any) => {
        try {
            if (r !== undefined && r.length > 0) {
                const onboardedCronjobs = await MiscService.getAllAlerts()
                .catch((e) => { throw new Error(e.toString()) })
                const rows = filterList(r, onboardedCronjobs)
                setCronjobs(rows);
            }
        } catch (error: any) {
            alert(error.toString());
        }
    }

    const filterList = (allCronjobs:string[], onboardedCronjobs: GetSQLAlert[]):IContainer[] => {
        let rows: IContainer[] = [];
        allCronjobs.map((item) => {
            const isOnboarded: boolean = onboardedCronjobs.some(i => i.name == item && !i.disabled);
            rows.push({
                "name": item,
                "isShow": true,
                isOnboarded
            });
        })
        return rows;
    }

    useEffect(() => {
        let filteredList: IContainer[] = cronjobs;
        if(dropdownMode == 'onboarded') filteredList = filteredList.map((x: IContainer) => x.isOnboarded ? { ...x, isShow: true } : { ...x, isShow: false });
        if(dropdownMode == 'yetToOnboard') filteredList = filteredList.map((x: IContainer) => x.isOnboarded ? { ...x, isShow: false } : { ...x, isShow: true });
        if(dropdownMode == 'all') filteredList = filteredList.map((x: IContainer) => ({...x, isShow: true}));
        setCronjobs(filteredList);
        
    }, [dropdownMode])

    return (
        <Box padding={2} mt={2}>
            <Fetcher
                fetchData={() => MiscService.getAllCronjobs()}
                onFetch={r => handleAPICall(r) }
            >
            {cronjobs.length > 0 && (
                <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Please click on a cronjob to get SQL Slow Query Stats(last 24hours)</strong>
                                <FilterList handleFilter={setCronjobs} />
                            </TableCell>

                            <TableCell>
                                <TextField
                                    select
                                    style={{padding: '10px', width: '300px'}}
                                    label="Filter By"
                                    value={dropdownMode}
                                    variant="outlined"
                                    onChange={(e) => setDropdownMode(e.target.value)}
                                >
                                    {dropdownModeValues.map((option:any) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cronjobs.filter(x=>x.isShow).map(cronjob => (
                            <TableRow key={cronjob.name}>
                                <TableCell 
                                    key={cronjob.name} 
                                    color="primary" onClick={() => history.push(`/cronjobs/${cronjob.name}/slow-query/realtime`)}
                                    onMouseEnter={(event) => onMouseOver(event)}
                                    onMouseOut={event => onMouseOut(event)}
                                >
                                    {cronjob.name}
                                </TableCell>
                                <TableCell>
                                    {cronjob.isOnboarded ? <Chip label="Onboarded" color="primary"/>: <Chip label="Yet to Onboard" />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            )}
            {!cronjobs.length && (
                <Box px={2} py={4}>
                    <Typography>No records found</Typography>
                </Box>
            )}
            </Fetcher>
        </Box>
    );
};
