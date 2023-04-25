import React, { FunctionComponent, useState, useEffect } from "react";
import { Box, MenuItem, TextField, Typography } from "@material-ui/core";
import { Fetcher } from "../../common/components/Fetcher";
import { useHistory } from "react-router";
import { Table, TableBody, TableCell, TableRow, TableContainer, TableHead } from "@material-ui/core";
import Chip from '@material-ui/core/Chip';
import { FilterList } from "../components/FilterList";
import { GetSQLAlert, IContainer } from "../models";
import {MiscService} from "../services/MiscService";

export const ServiceListScreen: FunctionComponent = () => {
    const [containers, setContainers] = useState<IContainer[]>([]);
    const [dropdownMode, setDropdownMode] = useState('all');

    const history = useHistory();
    const dropdownModeValues = [
        {
            value: 'all',
            label: 'All Services',
        },
        {
            value: 'onboarded',
            label: 'Onboarded Services',
        },
        {
            value: 'yetToOnboard',
            label: 'Services yet to Onboard',
        }
    ];
    const onMouseOver = (event: any) => {
        event.target.style.cursor = "pointer"
        event.target.style.background = "#D3D3D3"
    }

    const onMouseOut = (event: any) => {
        event.target.style.background = "#FFFFFF"
    }

    const handleAPICall = async (r: any) => {
        try {
            if (r !== undefined && r.length > 0) {
                const onboardedServices = await MiscService.getAllAlerts()
                .catch((e) => { throw new Error(e.toString()) })
                const rows = filterList(r, onboardedServices)
                setContainers(rows);
            }
        } catch (error: any) {
            alert(error.toString());
        }
    }

    const filterList = (allServices:string[], onboardedServices: GetSQLAlert[]):IContainer[] => {
        let rows: IContainer[] = [];
        allServices.map((item) => {
            const isOnboarded: boolean = onboardedServices.some(i => i.name == item && !i.disabled);
            rows.push({
                "name": item,
                "isShow": true,
                isOnboarded
            });
        })
        return rows;
    }

    useEffect(() => {
        let filteredList: IContainer[] = containers;
        if(dropdownMode == 'onboarded') filteredList = filteredList.map((x: IContainer) => x.isOnboarded ? { ...x, isShow: true } : { ...x, isShow: false });
        if(dropdownMode == 'yetToOnboard') filteredList = filteredList.map((x: IContainer) => x.isOnboarded ? { ...x, isShow: false } : { ...x, isShow: true });
        if(dropdownMode == 'all') filteredList = filteredList.map((x: IContainer) => ({...x, isShow: true}));
        setContainers(filteredList);
        
    }, [dropdownMode])

    return (
        <Box padding={2} mt={2}>
            <Fetcher
                fetchData={() => MiscService.getAllServices()}
                onFetch={r => handleAPICall(r) }
            >
                {containers?.length > 0 && (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Please click on a service to get SQL Query Stats(last 24 hours)</strong>
                                        <FilterList handleFilter={setContainers} />
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
                                {containers.filter(x=>x.isShow).map(container => (
                                    <TableRow key={container.name}>
                                        <TableCell 
                                            key={container.name} 
                                            color="primary" onClick={() => history.push(`/services/${container.name}/slow-query/realtime`)}
                                            onMouseEnter={(event) => onMouseOver(event)} 
                                            onMouseOut={event => onMouseOut(event)}
                                        >
                                            {container.name}
                                        </TableCell>
                                        <TableCell>
                                            {container.isOnboarded ? <Chip label="Onboarded" color="primary"/>: <Chip label="Yet to Onboard" />}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {!containers.length && (
                    <Box px={2} py={4}>
                        <Typography>No records found</Typography>
                    </Box>
                )}
            </Fetcher>
        </Box>
    );
};
