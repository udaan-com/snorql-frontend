import React from "react";

export const getTableSchemaColumn = () => [
    {
      name: "columnName",
      label: "Column Name",
      options: {
        filter: true,
        sort: true,
       }
      
    },
    {
     name: "ordinalPosition",
      label: "Ordinal Position",
      options: {
        filter: true,
        sort: true,
        display:false
        
       }
    },
    {
     name: "columnDefault",
      label: "Column Default",
      
      
    },
    // {
    //  name: "nullable",
    //   label: "Is Nullable ?",
    //   options: {
    //     display: true,
    //     filter: false,
    //     sort: false,
    //     customBodyRender: (value: boolean) => {
    //         return <p style={{ margin: 0, padding: 0}}>{value.toString()}</p>
    //     }
    //   }
    // },
    {
     name: "dataType",
      label: "Data Type",
      

    },{
        name: "createdDate",
         label: "Created Date",
         
   
       },
    // {
    //  name: "identity",
    //   label: "Is Identity",
    //   options: {
    //     display: true,
    //     filter: false,
    //     sort: false,
        
    //     customBodyRender: (value: boolean) => {
    //         return <p style={{ margin: 0, padding: 0}}>{value.toString()}</p>

    //     }
    //   }
    // }, {
    //     name: "rowGuid",
    //      label: "Is Row Guid",
    //      options: {
    //         display: true,
    //         filter: false,
    //         sort: false,
    //         customBodyRender: (value: boolean) => {
    //             return <p style={{ margin: 0, padding: 0}}>{value.toString()}</p>

    //         }
    //       }
    //    },
    {
     name: "characterMaximumLength",
      label: "Character Maximum Length",
    
    },
    {
     name: "collationName",
      label: "Collation Name",
    }
   
];