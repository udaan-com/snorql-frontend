import React, { FunctionComponent, useEffect, useState,Dispatch, SetStateAction } from "react";
import { Box, Paper, Tooltip, IconButton, FormControl, FormGroup, FormControlLabel, Switch, InputLabel, Select, MenuItem, Typography } from "@material-ui/core"
import ReplayIcon from '@material-ui/icons/Replay';
import CodeIcon from '@material-ui/icons/Code';
import SettingsIcon from '@material-ui/icons/Settings';
import { Fetcher } from "../../../../common/components/Fetcher";
import { Database, IComputeUtilizationMetricResponse, IComputeUtilizationResponse, ICustomError, IMetricMetadata } from "../../../models";
import { SQLService } from "../../../services/SQLService";
import { ShowQueryScreen } from "../ShowQueryScreen";
import { CopyToClipboard } from "../../../components/CopyToClipboard";
import { outerLevelUseStyles } from "../../../components/StyleClass";
import { MetricHeader } from "../../../components/MetricHeader";
import { SingleTriggerDialog } from "../../../components/SingleTriggerDialog";
import { Historical } from "./Historical";
import { UPlot } from "../../../../common/components/plot/Plot";
import {getLayoutWidth} from "../../../../common/utils";
import { AlignedData } from 'uplot';

interface ComputeUtilizationProps {
    databaseName: string;
    databaseDetail: Database
}
export type AggregationType = 'Avg' | 'Max';

export const ComputeUtilizationScreen: FunctionComponent<ComputeUtilizationProps> = (props) => {
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [historicalScreenFlag, setHistoricalScreenFlag] = useState<boolean>(false);
    const [jobConfigureDialogOpen, setJobConfigureDialogOpen] = useState<boolean>(false);
    const [aggregationType, setAggregationType] = useState<AggregationType>('Max');
    const [isReload, setIsReload] = useState<boolean>(false);
    
    const classes = outerLevelUseStyles();
    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={5}>
            <Paper>
                <div style={{ float: 'right' }}>
                    {metadata && metadata.supportsHistorical &&
                    <FormControl component="fieldset">
                        <FormGroup aria-label="historicalEnabled" row>
                            <FormControlLabel
                            onChange={() => setHistoricalScreenFlag(!historicalScreenFlag)}
                            control={<Switch color="primary" />}
                            label="View Historical Data"
                            labelPlacement="bottom"
                            />
                        </FormGroup>
                    </FormControl> }
                    {metadata && metadata.supportsHistorical &&
                    <Tooltip title="Configure Data Recording">
                        <IconButton onClick={() => setJobConfigureDialogOpen(true)}>
                            <SettingsIcon fontSize="default" />
                        </IconButton>
                    </Tooltip> }
                    {!historicalScreenFlag &&
                    <Tooltip title="Reload">
                        <IconButton onClick={() => setIsReload(!isReload)}>
                            <ReplayIcon fontSize="default" />
                        </IconButton>
                    </Tooltip> }
                </div>
                <div style={{ marginLeft: '15px', padding: '10px' }}>
                    <MetricHeader title="Compute Utilization Metric" metadata={metadata} />
                </div>

                <SingleTriggerDialog 
                    open={jobConfigureDialogOpen} 
                    handleClose={() => setJobConfigureDialogOpen(false)} 
                    databaseName={props.databaseName} 
                    metricId={"performance_computeUtilization"} 
                    metricName={"Compute Utilization Metric"}
                    minimumRepeatInterval={metadata?.minimumRepeatInterval} 
                    databaseDetail={props.databaseDetail}
                />
                {!historicalScreenFlag && metadata && <div style={{ paddingLeft: '50%' }}>
                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel id="aggregation-type-label">Aggregation type</InputLabel>
                        <Select
                            labelId="aggregation-type-label"
                            id="aggregation-type"
                            value={aggregationType}
                            onChange={(event: React.ChangeEvent<{ value: unknown }>) => setAggregationType(event.target.value as AggregationType)}
                            label="Aggregation type"
                        >
                            <MenuItem value={'Avg'}>Avg</MenuItem>
                            <MenuItem value={'Max'}>Max</MenuItem>
                        </Select>
                    </FormControl>
                </div>}
                
                {!historicalScreenFlag &&
                    <>
                        <DisplayChart databaseName={props.databaseName} reload={isReload} aggregationType={aggregationType} metadata={metadata} setMetadata={setMetadata}/>
                        {props.databaseDetail.readReplicaDbName && <DisplayChart 
                            databaseName={`${props.databaseDetail.readReplicaDbName}`} 
                            reload={isReload} 
                            aggregationType={aggregationType} 
                            metadata={metadata} 
                            setMetadata={setMetadata}/>
                        }
                    </>
                }
                {historicalScreenFlag && <Historical databaseName={props.databaseName} databaseDetail={props.databaseDetail}/> }
            </Paper>
        </Box>
    );
};


interface DisplayChartProps {
    databaseName: string,
    aggregationType: AggregationType,
    reload: boolean,
    metadata:IMetricMetadata | undefined,
    setMetadata: Dispatch<SetStateAction<IMetricMetadata | undefined>> ;
}

const DisplayChart: FunctionComponent<DisplayChartProps> = (props) => {
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [computeUtilizationAvgData, setComputeUtilizationAvgData] = useState<AlignedData>();
    const [computeUtilizationMaxData, setComputeUtilizationMaxData] = useState<AlignedData>();

    useEffect(() => {
        if(props.reload) {
            SQLService.getComputeUtilization(props.databaseName)
            .then(r => {
                handleOnApiResponse(r)
            });
        }
    }, [props.reload]);
     
    const setChartData = (input: IComputeUtilizationResponse[]) => {
        const xValues = input.map(r => {
            let datetime = new Date(r.timeId)
            datetime.setMinutes(datetime.getMinutes() + 330) // to convert to local timezone
            return datetime.getTime()/1000;
        });
        const avgCpuPercent = input.map(r => r.avgCpuPercent);
        const avgDataIoPercent = input.map(r => r.avgDataIoPercent);
        const avgLogIoPercent = input.map(r => r.avgLogIoPercent);
        const avgMemoryPercent = input.map(r => r.avgMemoryPercent);
        const maxCpuPercent = input.map(r => r.maxCpuPercent);
        const maxDataIoPercent = input.map(r => r.maxDataIoPercent);
        const maxLogIoPercent = input.map(r => r.maxLogIoPercent);
        const maxMemoryPercent = input.map(r => r.maxMemoryPercent);
        setComputeUtilizationAvgData([xValues, avgCpuPercent, avgDataIoPercent, avgLogIoPercent, avgMemoryPercent]);
        setComputeUtilizationMaxData([xValues, maxCpuPercent, maxDataIoPercent, maxLogIoPercent, maxMemoryPercent]);
    }
    
    const handleOnApiResponse = (r: IComputeUtilizationMetricResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            setErrorMessage(`${r.message}: ${r.details}`);
        } else if("error" in r) {
            alert(`[ERROR]: ${r['error']}`)
        } else {
            if("metricOutput" in r){
                const result = r.metricOutput.result.queryList;
                setChartData(result)
                setErrorMessage('')
                if(!props.databaseName.includes("readonly")) {
                    props.setMetadata(r.metadata)
                }
            }
            else{
                setErrorMessage("")
            }
        }
    }  
    const classes = outerLevelUseStyles();
    return (
    <>
        {errorMessage &&
            <div style={{marginLeft:'6px', padding: '10px', color: 'red', fontFamily:'monospace'}}>
                <details open>
                    <summary>Error</summary>
                    <p>{errorMessage}</p>
                </details>
            </div>
        }
        <Fetcher
            fetchData={() => SQLService.getComputeUtilization(props.databaseName)}
            onFetch={(r) => handleOnApiResponse(r)}
        >
            {!props.databaseName.includes('readonly') && <div style={{ float: 'right', padding: '10px' }}>
                {showQuery && props.metadata && props.metadata.underlyingQueries && <CopyToClipboard text={props.metadata.underlyingQueries[0]} />}
                <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                    <IconButton aria-label="delete" onClick={() => setShowQuery(!showQuery)}>
                        <CodeIcon />
                    </IconButton>
                </Tooltip>
            </div>}
            
            {!props.databaseName.includes('readonly') && showQuery && props.metadata && props.metadata.underlyingQueries &&  
                <ShowQueryScreen query={props.metadata.underlyingQueries[0]} />}

            {!showQuery && !errorMessage &&
                <Box paddingTop={8} paddingRight={8} paddingLeft={4}>
                    <div style={{ width: '100%' }}>
                        <Typography variant={'h6'}>{`${props.databaseName.includes('readonly') ? 'Replica Set' : 'Primary'}`}</Typography>
                        {props.aggregationType == 'Avg' && computeUtilizationAvgData!=undefined && <UPlot
                            width={getLayoutWidth(80)/2}
                            data={computeUtilizationAvgData}
                            serieses={[
                                {label: 'Avg CPU(%)'},
                                {label: 'Avg Data IO(%)'},
                                {label: 'Avg Log IO(%)'},
                                {label: 'Avg Memory(%)'}
                            ]}
                            yType={'count'}
                            height={340}
                        />}

                        {props.aggregationType == 'Max' && computeUtilizationMaxData!=undefined && <UPlot
                            width={getLayoutWidth(80)/2}
                            data={computeUtilizationMaxData}
                            serieses={[
                                {label: 'Max CPU(%)'},
                                {label: 'Max Data IO(%)'},
                                {label: 'Max Log IO(%)'},
                                {label: 'Max Memory(%)'}
                            ]}
                            yType={'count'}
                            height={340}
                        />}     
                    </div>
                </Box>
            }
        </Fetcher>
    </>
    );
};


