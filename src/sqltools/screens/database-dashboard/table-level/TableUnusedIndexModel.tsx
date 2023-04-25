import React from "react";

const smoothMoveToTableSchema = () =>{
  document.getElementById('tableSchema')?.scrollIntoView({
    behavior: 'smooth'
  });
}


export const getTableUnusedIndexColumns = () => [
  {
    field: "id",
    headerName: "Id",
    width: 20

  },
  {
    field: "objectName",
    headerName: "Object Name",
    width: 300

  },
  {
    field: "indexName",
    headerName: "Index Name",
    width: 650
  },
  {
    field: "userSeeks",
    headerName: "User Seeks",
    width: 120
  },
  {
    field: "userScans",
    headerName: "User Scans",
    width: 150
  },
  {
    field: "userLookups",
    headerName: "User Lookups",
    width: 150
  },
  {
    field: "userUpdates",
    headerName: "User Updates",
    width: 150
  }
,
{
  field: "indexColumnNames",
  headerName: "Index Column Names",
  width: 400,
  renderCell: (param: any) => (
                
    <div>
        <a style={{ cursor:'pointer', color:'blue' }} onClick={smoothMoveToTableSchema} >{param.value.split(" ").join(", ")}</a>
      </div>
)
},
{
  field: "includeColumnNames",
  headerName: "Include Column Names",
  width: 400,
  renderCell: (param: any) => (
                
    <div>
        <a style={{ cursor:'pointer', color:'blue' }} onClick={smoothMoveToTableSchema} >{param.value.split(" ").join(", ")}</a>
      </div>
)
}

];