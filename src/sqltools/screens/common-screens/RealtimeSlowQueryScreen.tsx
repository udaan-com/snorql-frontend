import React, { FunctionComponent, useState } from "react";
import { useHistory } from "react-router-dom";
import { Box, Typography, Paper, Theme, createStyles } from "@material-ui/core"
import { SQLService } from "../../services/SQLService";
import { Fetcher } from "../../../common/components/Fetcher";
import { alertType, LongRunningSQLQueries } from "../../models";
import { useLocation } from "react-router";
import { Table, TableBody, TableCell, TableRow, TableContainer, TableHead } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { ClickToExpandDialog } from "../../components/ClickToExpandDialog";
import {MiscService} from "../../services/MiscService";

interface RelatimeSlowQueryScreenProps {
    name: string;
    type: alertType;
}

export const RelatimeSlowQueryScreen: FunctionComponent<RelatimeSlowQueryScreenProps> = props => {
    const [rows, setRows] = useState<LongRunningSQLQueries[]>([]);
    const { name, type } = props

    const { search } = useLocation();
    const query = new URLSearchParams(search);
    let startTime: number;
    let endTime: number;
    let numResult = 10;
    let threshold = 1;
    let hostname = '';
    if (query.has("numResults")) {
        numResult = +(query.get("numResults")!);
    }
    if (query.has("threshold")) {
        threshold = +(query.get("threshold")!);
    }
    if (query.has("hostname")) {
        hostname = (query.get("hostname")!);
    }
    if (query.has("start") && query.has("end")) {
        startTime = Number.parseFloat(query.get("start")!);
        endTime = Number.parseFloat(query.get("end")!);
    } else {
        let currentDatetime = new Date().getTime();
        endTime = Math.round(currentDatetime / 1000);
        startTime = endTime - 86400; // (24 hrs ago)
    }

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,

            content: {
                flexGrow: 1,
                padding: theme.spacing(3),
            },
        }));

    const trimNewLines = (text: string): string => {
        return text.replace(/(\r\n|\n|\r)/gm, "")
    }
    const classes = useStyles();

    const extractNamedParams = (text: string): string => {
        const namedAruguments = text.match(/named:(.*), finder/i)
        return (namedAruguments && namedAruguments.length > 0 && namedAruguments[1]!="{}") ? namedAruguments[1] : "";
    }

    return (

        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={2}>
            <Fetcher
                fetchData={() => MiscService.getSQLQueryDetails(name, startTime, endTime, numResult, threshold, type, hostname)}
                onFetch={r => {
                    if (r !== undefined && r.length > 0) {
                        setRows(r);
                    }
                }
                }
            >
                {rows.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Sl No.</b></TableCell>
                                    <TableCell><b>SQL Query</b></TableCell>
                                    <TableCell><b>Parameters</b></TableCell>
                                    <TableCell><b>Frequency</b></TableCell>
                                    <TableCell><b>Duration Per Call(in sec)</b></TableCell>
                                    <TableCell><b>Host</b></TableCell>
                                    <TableCell><b>DB</b></TableCell>
                                    <TableCell><b>Method Called From</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((container, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <ClickToExpandDialog text={trimNewLines(container.Query)} title="query"/>
                                        {container.Bindings && extractNamedParams(container.Bindings)!="" ? <ClickToExpandDialog text={extractNamedParams(container.Bindings)} title="parameters"/> : <TableCell>N/A</TableCell>}
                                        <TableCell>{container.CallsPerDay}</TableCell>
                                        <TableCell>{container.DurationPerCall.toFixed(2)}</TableCell>
                                        <TableCell>{container.Host}</TableCell>
                                        <TableCell>{container.Path}</TableCell>
                                        <TableCell>{container.CallingMethod}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {!rows.length && (
                    <Box px={2} py={4}>
                        <Typography>No records found</Typography>
                    </Box>
                )}
            </Fetcher>
        </Box>

    );
};
