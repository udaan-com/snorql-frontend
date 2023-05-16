import { Box, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import React, {useState, useEffect} from "react";
import { FunctionComponent } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { LogSpaceUsageScreen } from "./LogSpaceUsageScreen";
import { ReadReplicationLagScreen } from "./ReadReplicationLagScreen";
import { SQLService } from '../../../services/SQLService';
import { GeoReplicaProperties } from "../../../models";
import { GeoReplicaLagScreen } from './GeoReplicaLagScreen';

interface DbMonitoringprops {
    databaseName: string
}
const useStyles = makeStyles((theme: Theme) =>
createStyles({
    toolbar: theme.mixins.toolbar,
    content: {
        maxWidth: "85%",
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: "bold",
        flexBasis: '33.33%',
        flexShrink: 0,
        textTransform: "uppercase"
    },
}));
export const DbMonitoringLandingScreen: FunctionComponent<DbMonitoringprops> = (props) => {
    const classes = useStyles();
    const [replicaDbName, setReplicaDbName] = useState<string | null>(null)
    const [geoReplicaProperties, setGeoReplicaProperties] = useState<GeoReplicaProperties | null>(null)

    const fetchData = async () => {
        const dbInfo = await SQLService.getDatabaseDetail(props.databaseName)
        dbInfo && dbInfo.readReplicaDbName!=null ? setReplicaDbName(dbInfo.readReplicaDbName) : setReplicaDbName(null)
        dbInfo && dbInfo.geoReplicaProperties!=null ? setGeoReplicaProperties(dbInfo.geoReplicaProperties) : setGeoReplicaProperties(null)
    }

    useEffect(() => {
        (async () => {
            fetchData()
          })();
          return () => {}; 
    }, [])

    return (
        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'}>
            <LogSpaceUsageScreen databaseName={props.databaseName}/>
            {replicaDbName ? <ReadReplicationLagScreen databaseName={props.databaseName} readReplicaDbName={replicaDbName}/> : null}
            {geoReplicaProperties ? <GeoReplicaLagScreen databaseName={props.databaseName} geoReplicaProperties={geoReplicaProperties}/> : null}
        </Box>
    )
}