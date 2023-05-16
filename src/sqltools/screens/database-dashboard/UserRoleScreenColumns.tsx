import React from "react";

import Person from '@mui/icons-material/Person';
import Apps from '@mui/icons-material/Apps';
import Group from '@mui/icons-material/Group';

export const getGroupMembersColumns = (getGroupMember: (arg: string) => void) => [
    {
        name: "id",
        label: "id",
        options: {
            filter: true,
            sort: true,
            display: false,
        }
    }, {
        name: "appDisplayName",
        label: "appDisplayName",
        options: {
            filter: true,
            sort: true,
            display: false,

        }
    },
    {
        name: "userPrincipalName",
        label: "Email",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "displayName",
        label: "Name",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value: any, data: any) => {
                const rowData = data.rowData;
                const isGroup = rowData[6] == "group";
                if (isGroup) {
                    return (

                        <div onClick={() => getGroupMember(rowData[3])}>
                            <a style={{ color:'black', cursor:'pointer', textDecoration:'underline' }}>{value}  <Group style={{float:'left'}} /></a>
                        </div>

                    )
                }
                else {
                    const isSP = rowData[6] == "servicePrincipal";

                    if(isSP){
                    return (

                        <div onClick={() => getGroupMember(rowData[1])}>
                            <p>{value}  <Apps style={{float:'left'}} /></p>
                        </div>


                    )
                    }
                    else{
                        return (

                            <div onClick={() => getGroupMember(rowData[1])}>
                                <p >{value} <Person style={{float:'left'}} /></p>
                            </div>
    
    
                        )
                    }
                }

            }

        }
        
    },
    {
        name: "createdDateTime",
        label: "Created DateTime",
        options: {
            filter: true,
            sort: true,


        }
    },
    {
        name: "servicePrincipal",
        label: "servicePrincipal",
        options: {
            filter: true,
            sort: true,
            display: false,
        }

    },
    {
        name: "type",
        label: "type",
        options: {
            display: false,
        customBodyRender: (value: any, data: any) => {
            const rowData = data.rowData;
            const isGroup = rowData[6] == "group";
            const isSP = rowData[6] == "servicePrincipal";
            if(isGroup){
                return (
<>
                    <Group />
</>
                )
            }
                else if(isSP){
                    return (
<>
                       <Apps />
  </>  
                    )
                }
                else{
                    return (
<>
                        <Person />
  </>  
                    )
                }
            
            }
        }
    }, {
        name: "group",
        label: "group",
        options: {
            filter: true,
            sort: true,
            display: false,
        }
    }
];