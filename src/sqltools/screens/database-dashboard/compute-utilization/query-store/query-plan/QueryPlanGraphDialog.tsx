import React, {useState, useEffect, useRef} from 'react';
import {
    Dialog,
    DialogContent, IconButton, TextField,
    Typography,
    Grid,
    Paper,
    Slide,
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {Alert, AlertTitle, Autocomplete, AutocompleteChangeReason} from "@material-ui/lab";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { IAnalyzeQueryPlan, ICustomError, IMetricMetadata, IAnalyzeQueryPlanResponse } from '../../../../../models';
import { Tooltip, AppBar, Toolbar, Box } from '@material-ui/core';
import { Button } from '@material-ui/core';
import MUIDataTable, {MUIDataTableOptions} from "mui-datatables";
import { getColumns } from "./QueryPlanDataColumns";
import { TransitionProps } from '@material-ui/core/transitions';
import CloseIcon from '@material-ui/icons/Close';
import { QueryPlanAttribute, getQueryPlanAttributes } from './QueryPlanAttribute';
import { SQLService } from '../../../../../services/SQLService';
import { getFormattedDateISO, getFormattedDateUTC } from '../aggregate-query/QueryStoreScreen';
import CodeIcon from '@material-ui/icons/Code';
import { showQueryEvent } from '../../../../../tracking/TrackEventMethods';
import { MenuText, MenuTitle } from '../../../DatabaseDashboardScreen';
import { CopyToClipboard } from '../../../../../components/CopyToClipboard';
import { ShowQueryScreen } from '../../../ShowQueryScreen';
import { useAdminEmail } from '../../../../../../hooks';
import ProgressView from '../../../../../../common/components/ProgressView';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import "html-query-plan/css/qp.css";
import "./xml-plan.css";
import {showPlan} from "html-query-plan/dist/index";

interface Props {
    startTime: string;
    endTime: string;
    aggregatedQueryPlanData: IAnalyzeQueryPlan;
    numOfPlans: number;
    databaseName: string;
    queryText: string;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    toolbar: theme.mixins.toolbar,

    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    queryBlock: {
        display:'flex', 
        justifyContent:'space-between',
        backgroundColor: '#D4D4D4'
    },
    noteBlock: {
        display:'flex', 
        justifyContent:'space-between'
    },
    queryBlock_span: {
        float: 'right',
        marginLeft: 'auto'
    },
    noteBlock_span: {
        float: 'right'
    }
  }),
);

export const QueryPlanGraphDialog: React.FunctionComponent<Props> = (props: Props) => {
    const [queryPlansData, setQueryPlansData] = useState<IAnalyzeQueryPlan[]>([])
    const [chartData, setChartData] = useState<any>()
    const [options, setOptions] = React.useState<QueryPlanAttribute[]>(getQueryPlanAttributes);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<IMetricMetadata>();
    const [selectedPlan, setSelectedPlan] = React.useState<IAnalyzeQueryPlan | null>(null);
    const classes = useStyles();
    const email = useAdminEmail();
    const xmlContainerRef = useRef(null);

    const tableOptions: MUIDataTableOptions = {
        filterType: "dropdown",
        selectableRows: 'single',
        print: false,
        download: true,
        setTableProps: () => {
            return {size: 'small'}
        },
        onRowSelectionChange: (currentRowsSelected: any[], allRowsSelected: any[], rowsSelected?: any[]) => {
            setSelectedPlan(queryPlansData[currentRowsSelected[0].dataIndex])
        },
        isRowSelectable: (dataIndex: number) => {
            return dataIndex == 0 ? false : true
        },
        customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
            return <CustomToolBarSelect/>
        }
    };
    
    const CustomToolBarSelect: React.FC = () => (
        <></>
    )

    const setChartRelatedData = () => {
        const selectorLabels = options.map(o => o.name);
        let chartContent:any = {}
        selectorLabels.forEach((label, j) => {
            let data = []
            data.push([`queryId: ${props.aggregatedQueryPlanData.queryId}`,label])
            queryPlansData.forEach((prop:any, k) => {
                data.push([1245,prop[`${label}`]])
            });
            chartContent[label] = data
        })
        setChartData(chartContent)
    }

    useEffect(() => {
        if(queryPlansData.length > 0) {
            setChartRelatedData()
        }
    }, [queryPlansData])

    const handleClickOpen = () => {
        setOpen(true);
        setLoading(true);
        
        SQLService.getAnalyzeQueryPlan(
            props.databaseName, getFormattedDateUTC(props.startTime), getFormattedDateUTC(props.endTime), props.aggregatedQueryPlanData.queryId.toString())
        .then((r: IAnalyzeQueryPlanResponse | ICustomError) => {
            if ("code" in r && "message" in r && "details" in r) {
                setErrorMessage(`${r.message}: ${r.details}`);
                setLoading(false)
            } else {
                const result = r.metricOutput.result.queryList;
                const queryData = [props.aggregatedQueryPlanData]
                setMetadata(r.metadata);
                setQueryPlansData([...queryData, ...result]);
                setLoading(false);
            }
        });
    };
    const handleClose = () => {
        setOpen(false);
    };
    const basicPropsForMixPanel = { dbName: props.databaseName, userEmail: email, metricTitle: MenuTitle.PERFORMANCE, metricText: `${MenuText.ANALYZE_QUERY_PLAN}`}
    const handleShowQuery = () => {
        setShowQuery(!showQuery)
        metadata && showQueryEvent({
            ...basicPropsForMixPanel,
            query: metadata.underlyingQueries[0]
        })
    }
    const renderXmlPlan = () => {
        setTimeout(() => {
            if (xmlContainerRef.current && selectedPlan) {
                showPlan(xmlContainerRef.current!!, selectedPlan.planXML);
            }
        }, 1000);
    };

    return (
        <>
            <OpenInBrowserIcon fontSize="small" onClick={handleClickOpen} style={{cursor:'pointer'}}/>
            <Dialog
                fullScreen  
                onClose={handleClose} 
                TransitionComponent={Transition}
                open={open}
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Comparitive view of query plans
                        </Typography>
                    </Toolbar>
                </AppBar>
                {errorMessage &&
                    <div style={{ marginLeft: '5px', padding: '10px', color: 'red', fontFamily: 'monospace' }}>
                        <details open>
                            <summary>Error</summary>
                            <div>{errorMessage}</div>
                        </details>
                    </div>
                }
                <div className={showQuery ? classes.queryBlock : classes.noteBlock}>
                    {!showQuery && <Alert severity="info" style={{marginTop:'5px', width: '-webkit-fill-available'}}>
                        <AlertTitle>Note</AlertTitle>
                        <ul>
                            <li>Query plans are being fetched for query ID: <strong>{props.aggregatedQueryPlanData.queryId}</strong> executed between <strong>{getFormattedDateISO(props.startTime)}</strong> & <strong>{getFormattedDateISO(props.endTime)}</strong>.</li>
                            <li>The first row shows the values for aggregated query. Subsequent rows show values of their respective query plan.</li>
                        </ul>
                    </Alert>}
                    
                    <span className={showQuery ? classes.queryBlock_span : classes.noteBlock_span}>
                        {showQuery && metadata && metadata.underlyingQueries && <CopyToClipboard text={metadata.underlyingQueries[0]} />}
                        <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                            <IconButton aria-label="delete" onClick={handleShowQuery}>
                                <CodeIcon />
                            </IconButton>
                        </Tooltip>
                    </span>
                </div>
                {!showQuery && <details style={{ padding: '20px' }}>
                    <summary>Query:</summary>
                    <ShowQueryScreen query={props.queryText} />
                </details>}
                {showQuery && metadata && metadata.underlyingQueries && <ShowQueryScreen query={metadata.underlyingQueries[0]} />}
                
                <DialogContent>
                    {loading && !errorMessage && <ProgressView/>}
                    {!loading && !showQuery && <div>
                        <MUIDataTable
                            title={""}
                            data={queryPlansData}
                            columns={getColumns()}
                            options={tableOptions}
                        />
                    </div>}
                    {selectedPlan && <>
                        <Grid item xs={12} key={`grid-item-${selectedPlan.planId}`} ref={xmlContainerRef}  style={{ marginTop: "10px", width: "-webkit-fill-available", overflowY: 'scroll', display:'grid' }}/>
                        {renderXmlPlan()}
                    </>
                    }
                </DialogContent>
            </Dialog>
        </>
    );
};
