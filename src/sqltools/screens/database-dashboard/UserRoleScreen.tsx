import React, { FunctionComponent, useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Tooltip, IconButton, Theme, createStyles, Modal } from "@material-ui/core"

import { Fetcher } from "../../../common/components/Fetcher";
import { DataGrid } from '@material-ui/data-grid';
import { Database, GroupMembers, GroupMembersResponse, ICustomError, IUserRoleMetricResponse, SQLAdminResponse, UserRole } from "../../models";
import { SQLService } from "../../services/SQLService";
import { useHistory } from "react-router-dom";
import CodeIcon from '@material-ui/icons/Code';
import { ShowQueryScreen } from "./ShowQueryScreen";
import { CopyToClipboard } from "../../components/CopyToClipboard";
import ArrowBack from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/core/styles';
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import { getGroupMembersColumns } from "./UserRoleScreenColumns";
import { showQueryEvent, userRoleViewServerAdminEvent } from '../../tracking/TrackEventMethods';
import { useAdminEmail } from "../../../hooks";

import { MenuText, MenuTitle } from "./DatabaseDashboardScreen";
import {MiscService} from "../../services/MiscService";

interface UserScreenProps {
    databaseName: string;
    databaseType: string;
    setErrorMessage: (value: string) => void;
    setIsOnboarded: (value: boolean) => void;
}

export const UserRoleScreen: FunctionComponent<UserScreenProps> = (props) => {
    const history = useHistory();
    const [userRoles, setUserRoles] = useState<UserRole[]>([])
    const [groupMembers, setGroupMembers] = useState<GroupMembersResponse>()
    const [showQuery, setShowQuery] = useState<boolean>(false);
    const [isNotOnboarded, setIsNotOnboarded] = useState<boolean>(false);
    const [dbAdmin, setDbAdmin] = useState<string>();
    const [showGroupMembers, setShowGroupMembers] = useState<boolean>(false);
    const [underlyingQuery, setUnderlyingQuery] = useState<string>('');
    const email = useAdminEmail();

    const getGroupMember = (param: string) => {
        MiscService.getGroupMembers(param).then((res) =>
            setGroupMembers({ "groupMembers": formatGroupMembers(res[0].groupMembers), "groupName": res[0].groupName }));
        setShowGroupMembers(true)
        userRoleViewServerAdminEvent({dbName: props.databaseName, userEmail: email})

    }
    const handleClose = () => {setShowGroupMembers(false); setGroupMembers({groupName:"",groupMembers:[]}); }


    const getAdmin = (rgid: string) => {
        MiscService.getAdmin(rgid).then((res: SQLAdminResponse) => {
            if (res.properties?.administrators != null) {
                setDbAdmin(res.properties?.administrators.login)
                props.setIsOnboarded(true)

            }
            else {
                setIsNotOnboarded(old => true)
                props.setIsOnboarded(false)
                setDbAdmin(res.properties?.administratorLogin ?? "")
            }
        });
    }
    
    useEffect(() => {

        const getRGID = async (databaseName: string) => {
            SQLService.getDatabases()
            .then((r) => {
                if (r !== undefined && r.length > 0) {
                    let value:Database[] = r.map((x:Database)=>({...x,isShow:true}));
                    const rgid = value.find(db => db.name === databaseName)
                    let rgId = rgid?.id.substring(1).split("/")
                    rgId?.pop()
                    rgId?.pop()
                    if (rgId) { rgId.join("/") } else { throw new ReferenceError("RG ID not found!") }
                    getAdmin(rgId.join("/"));
                }
            })
            .catch((error) => {
                console.log("There has been an error while fetching rg id.", error)
            })
        }

        getRGID(props.databaseName);
    }, [])

    const formatGroupMembers = (response: any[]): GroupMembers[] => {
        response.map((eachItem, index) => {
            eachItem['id'] = index + 1
            eachItem["group"] = eachItem["group"].toString()
            eachItem["servicePrincipal"] = eachItem["servicePrincipal"].toString()
        })
        return response;
    }

    const columns = [
        {
            field: 'name', headerName: 'Name', width: 250, renderCell: (param: any) => (
                
                <div onClick={() => {console.log(param);getGroupMember(param.value)}}>
                    { param.data.type == 'X' ?(
                    <p style={{ textDecoration:'underline', cursor:'pointer'}} >{param.value}</p>
                    ):(
                        <p>{param.value}</p>
                    )    
                }
                    </div>
            )
        },
        { field: 'role', headerName: 'Role', width: 450 },
        { field: 'roletype', headerName: 'Type', width: 450 },
    ]
    const options: MUIDataTableOptions = {
        filterType: "multiselect",
        selectableRows: 'none',
        print: false,
        download: true
    };

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            toolbar: theme.mixins.toolbar,
            content: {
                flexGrow: 1,
                padding: theme.spacing(3),
            },
        }));

    const useModalStyle = makeStyles( () =>
        createStyles({
            content:{position: 'absolute' ,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: "5px 10px black",
            padding : "10px",
            overflow:'scroll',
            backgroundColor:"white",
            height:'auto',
            maxHeight:'80%',
            display:'block',
            width:'70%'
            }
        })
    );
    const handleUserRole = (r: IUserRoleMetricResponse | ICustomError) => {
        if ("code" in r && "message" in r && "details" in r) {
            props.setErrorMessage(`${r.message}: ${r.details}`)
        }
        else {
            const result = r.metricOutput.result.queryList;
            setUnderlyingQuery(r.metadata.underlyingQueries[0])
            setUserRoles([...formatUserRoleResponse(result)]);
        }
    }
    const formatUserRoleResponse = (response: any[]): UserRole[] => {
        response.map((eachItem, index) => {
            if(eachItem["type"] == "S") eachItem["roletype"] = "SQL User"
            else if(eachItem["type"] == "E") eachItem["roletype"] = "External User/ Srvice Principal"
            else if(eachItem["type"] == "X") eachItem["roletype"] = "External Group"
            eachItem['id'] = index + 1
        })
        return response;
    }

    const handleOnShowQuery = () => {
        setShowQuery(!showQuery)
        showQueryEvent({
            dbName: props.databaseName,
            userEmail: email,
            metricTitle: MenuTitle.ACCESS_CONTROL,
            metricText: MenuText.USER_ROLES,
            query: underlyingQuery
        })
    }

    const classes = useStyles();
    const modalClasses= useModalStyle();
    return (

        <Box className={[classes.content, classes.toolbar].join(' ')} mt={10} alignItems={'center'} justifyContent={'center'} paddingTop={5}>
            <Paper>
                {isNotOnboarded &&
                    <div style={{ paddingLeft: '50px' }}><h3><a  style={{color:'red'}} target="_blank" href="https://bigassmessage.com/1efc3">NOT YET ONBOARDED TO AAD :(</a></h3></div>
                }
                <Fetcher
                    fetchData={() => SQLService.getDbUsers(props.databaseName)}
                    onFetch={(r) => handleUserRole(r)}
                >
                    <div style={{ float: 'right', padding: '10px' }}>
                        {showQuery && <CopyToClipboard text={underlyingQuery} />}
                        <Tooltip title={showQuery ? 'Hide the source' : 'Show the source'}>
                            <IconButton onClick={() => handleOnShowQuery()}>
                                <CodeIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    {showQuery && !showGroupMembers && <ShowQueryScreen query={underlyingQuery} />}

                    {!showQuery && userRoles && userRoles.length > 0  &&
                        <Box paddingTop={3} paddingRight={8} paddingBottom={4} paddingLeft={4}>
                            <div style={{ height: 700, width: '100%' }}>
                            <h3 onClick={() => getGroupMember(dbAdmin??"")} >Server Admin: <a style={{ textDecoration: 'underline', cursor:'pointer' }} >{dbAdmin}</a></h3>
                                <DataGrid
                                    autoPageSize={true}
                                    rows={userRoles}
                                    columns={columns}
                                    showCellRightBorder
                                />
                            </div>
                        </Box>
                    }

                    {!showQuery && groupMembers && showGroupMembers &&
                        <Modal
                      open={showGroupMembers}
                      onClose={handleClose}
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                    >
                        <>
                        <Box className={modalClasses.content}>
                            <h3 onClick={() => getGroupMember(dbAdmin??"")} >Server Admin: <a style={{ textDecoration: 'underline',cursor:'pointer'  }} >{dbAdmin}</a></h3>
                            <p style={{ cursor: 'pointer' }} onClick={() => setShowGroupMembers(!showGroupMembers)}> <ArrowBack /></p>
                            <MUIDataTable
                                title={"Group Name - " + groupMembers.groupName}
                                data={groupMembers.groupMembers}
                                columns={getGroupMembersColumns(getGroupMember)}
                                options={options}
                            />
                            </Box>
                            </>
                        </Modal>
                    }

                    {!showQuery && userRoles.length === 0 && !showGroupMembers &&
                        <Box padding={2}>
                            <Typography variant={'h6'}>No users exist</Typography>
                            <Button style={{ margin: '16px' }} variant={"contained"} onClick={() => history.push('/')}> Back to Home</Button>
                        </Box>
                    }
                </Fetcher>
            </Paper>
        </Box>
    );
};
