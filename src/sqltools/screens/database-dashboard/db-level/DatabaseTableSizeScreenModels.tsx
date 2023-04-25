export const getTableSizeColumns = () => [
    {
      name: "tableName",
      label: "Table Name",
      options: {
        filter: true,
        sort: true,
       }
      
    },
    {
     name: "rows",
      label: "Rows",
      
    },
    {
     name: "totalSpaceKB",
      label: "Total Space KB",
      
    },
    {
     name: "totalSpaceMB",
      label: "Total Space MB",
    },
    {
     name: "usedSpaceKB",
      label: "Used Space KB",
     

    },
    {
     name: "usedSpaceMB",
      label: "Used Space MB",
    },
    {
     name: "unusedSpaceKB",
      label: "Unused Space KB",
    
    },
    {
     name: "unusedSpaceMB",
      label: "Unused Space MB",
    }
   
];