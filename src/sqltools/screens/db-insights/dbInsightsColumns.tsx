import React from "react";
import { Checkbox, FormGroup, FormLabel, InputLabel, ListItemText, MenuItem, Tooltip } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import { MUIDataTableColumnDef, MUIDataTableColumnOptions } from "mui-datatables";
import SQLElasticPoolLogo from './assets/SQL-Elastic-Pools.png'
import ServerlessDatabaseLogo from './assets/serverless-database.png'
import { FormControl } from '@material-ui/core';
import { Select } from '@material-ui/core';
import { Chip } from '@material-ui/core';

const getLogoByKind = (kind: string) => {
  if(kind.includes("pool")) {
    return SQLElasticPoolLogo
  } else if(kind.includes("serverless")) {
    return ServerlessDatabaseLogo
  } else {
    return null
  }
}
const getTooltipByKind = (kind: string) => {
  if(kind.includes("pool")) {
    return "SQL Elastic Pool"
  } else if(kind.includes("serverless")) {
    return "Serverless Database"
  } else {
    return ""
  }
}
/**  TODO: Rewrite the columns logic once the below tickets have been resolved
 * https://github.com/gregnb/mui-datatables/issues/1958
 * https://github.com/gregnb/mui-datatables/issues/1790
**/
export const dbMetricsColumns = ():  MUIDataTableColumnDef[] => [
  {
    name: "dbName",
    label: "Database",
    options: {
      filter: true,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
      customBodyRender: (value: any, tableMeta: any) => {
        const rowData = tableMeta.rowData;
        let logo = getLogoByKind(rowData[3])
        return (
          <p>
            {value} 
              {logo ? ( 
                <Tooltip title={getTooltipByKind(rowData[3])}>
                  <img src={logo} alt="Logo" height={15} width={15} />
                </Tooltip>
              ): null }
          </p>
        )
      },
    },
  },
  {
    name: "badges",
    label: "Badges",
    options: getLabelOptions()
  },
  {
    name: "tier",
    label: "Tier",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "kind",
    label: "kind",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "rebuildIndexesCountValue",
    label: "Total indexes to rebuild",
    options: getOptions("Total indexes to rebuild", true, 31)
  },
  {
    name: "reorganizeIndexesCountValue",
    label: "Total Indexes to re-organize",
    options: getOptions("Total Indexes to re-organize", true, 32)
  },
  {
    name: "idxFragAbove90Value",
    label: "Index Frag(%) Above 90",
    options: getOptions("Index Frag(%) Above 90", true, 33)
  },
  {
    name: "idxFragBetween60to90Value",
    label: "Index Frag(%) 60-90",
    options: getOptions("Index Frag(%) 60-90", false, 34)
  },
  {
    name: "idxFragBetween30to60Value",
    label: "Index Frag(%) 30-50",
    options: getOptions("Index Frag(%) 30-60", false, 35)
  },
  {
    name: "idxFragBetween15to30Value",
    label: "Index Frag(%) 15-30",
    options: getOptions("Index Frag(%) 15-30", false, 36)
  },
  {
    name: "idxFragBelow15Value",
    label: "Index Frag(%) Below 15",
    options: getOptions("Index Frag(%) Below 15", false, 37)
  },
  {
    name: "duplicateIndexesCountValue",
    label: "Total Duplicate Indexes",
    options: getOptions("Total Duplicate Indexes", true, 38)
  },
  {
    name: "unusedIndexesCountValue",
    label: "Total Unused Indexes",
    options: getOptions("Total Unused Indexes", true, 39)
  },
  {
    name: "overlappingIndexesCountValue",
    label: "Total Overlapping Indexes",
    options: getOptions("Total Overlapping Indexes", true, 40)
  },
  {
    name: "similarIndexesCountValue",
    label: "Total Similar Indexes",
    options: getOptions("Total Similar Indexes", true, 41)
  },
  {
    name: "cpuPercentP99Value",
    label: "P99 CPU(%)",
    options: getOptions("P99 CPU(%)", true, 42)
  },
  {
    name: "cpuPercentP95Value",
    label: "P95 CPU(%)",
    options: getOptions("P95 CPU(%)", false, 43)
  },
  {
    name: "cpuPercentP90Value",
    label: "P90 CPU(%)",
    options: getOptions("P90 CPU(%)", false, 44)
  },
  {
    name: "cpuPercentP70Value",
    label: "P70 CPU(%)",
    options: getOptions("P70 CPU(%)", false, 45)
  },
  {
    name: "memPercentP99Value",
    label: "P99 Memory(%)",
    options: getOptions("P99 Memory(%)", true, 46)
  },
  {
    name: "memPercentP95Value",
    label: "P95 Memory(%)",
    options: getOptions("P95 Memory(%)", false, 47)
  },
  {
    name: "memPercentP90Value",
    label: "P90 Memory(%)",
    options: getOptions("P90 Memory(%)", false, 48)
  },
  {
    name: "memPercentP70Value",
    label: "P70 Memory(%)",
    options: getOptions("P70 Memory(%)", false, 49)
  },
  {
    name: "dataIoPercentP99Value",
    label: "P99 Data Io(%)",
    options: getOptions("P99 Data Io(%)", true, 50)
  },
  {
    name: "dataIoPercentP95Value",
    label: "P95 Data Io(%)",
    options: getOptions("P95 Data Io(%)", false, 51)
  },
  {
    name: "dataIoPercentP90Value",
    label: "P90 Data Io(%)",
    options: getOptions("P90 Data Io(%)", false, 52)
  },
  {
    name: "dataIoPercentP70Value",
    label: "P70 Data Io(%)",
    options: getOptions("P70 Data Io(%)", false, 53)
  },
  {
    name: "logIoPercentP99Value",
    label: "P99 Log Io(%)",
    options: getOptions("P99 Log Io(%)", false, 54)
  },
  {
    name: "logIoPercentP95Value",
    label: "P95 Log Io(%)",
    options: getOptions("P95 Log Io(%)", false, 55)
  },
  {
    name: "logIoPercentP90Value",
    label: "P90 Log Io(%)",
    options: getOptions("P90 Log Io(%)", false, 56)
  },
  {
    name: "logIoPercentP70Value",
    label: "P70 Log Io(%)",
    options: getOptions("P70 Log Io(%)", false, 57)
  },
  
  {
    name: "rebuildIndexesCountTimestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "reorganizeIndexesCountTimestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "idxFragAbove90Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "idxFragBetween60to90Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "idxFragBetween30to60Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "idxFragBetween15to30Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "idxFragBelow15Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "duplicateIndexesCountTimestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "unusedIndexesCountTimestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "overlappingIndexesCountTimestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "similarIndexesCountTimestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "cpuPercentP99Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "cpuPercentP95Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "cpuPercentP90Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "cpuPercentP70Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "memPercentP99Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "memPercentP95Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "memPercentP90Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "memPercentP70Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "dataIoPercentP99Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "dataIoPercentP95Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "dataIoPercentP90Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "dataIoPercentP70Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "logIoPercentP99Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "logIoPercentP95Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "logIoPercentP90Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  },
  {
    name: "logIoPercentP70Timestamp",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false
    }
  }
];

const getLabelOptions = (): MUIDataTableColumnOptions => {
  return {
    filter: true,
    display: 'true',
    filterType: 'custom',
    customBodyRender: (badgesStr: any, tableMeta: any) => {
      const values = badgesStr.split(",")
      if(badgesStr!="" && values.length > 0) {
        const list = values.map((i: string) => (
          <Chip label={i} variant="outlined" color="secondary" style={{marginBottom: '5px'}} key={Math.random()}/>
        ))
        return <>{list}</>
      } else {
        return <p>{badgesStr}</p>
      }
    },
    customFilterListOptions: {
      render: v => v.map((l: string) => l.toUpperCase()),
      update: (filterList, filterPos, index) => {
        filterList[index].splice(filterPos, 1);
        return filterList;
      }
    },
    filterOptions: {
      logic: (location, filters, row) => {
        if(filters.length > 0) {
          const values = location.split(",")
          const labelExists = filters.some(item => values.includes(item))
          return !labelExists
        } else {
          return false;
        }
      },
      display: (filterList: any, onChange, index: number, column) => {
        const optionValues = [
          "Resource underutilized",
          "Resource unhealthy", 
          "Resource overutilized", 
          "High index redundancy",
          "High index fragmentation"
        ];
        return (
          <FormControl>
            <InputLabel htmlFor='select-multiple-chip'>
              Badges
            </InputLabel>
            <Select
              multiple
              value={filterList[index]}
              renderValue={(selected: any) => selected.join(', ')}
              onChange={event => {
                filterList[index] = event.target.value;
                onChange(filterList[index], index, column);
              }}
            >
              {optionValues.map(item => (
                <MenuItem key={item} value={item}>
                  <Checkbox
                    color='primary'
                    checked={filterList[index].indexOf(item) > -1}
                  />
                  <ListItemText primary={item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }
    },
  }
}

const getOptions = (label: string, display: boolean, timestampIdx: number): MUIDataTableColumnOptions => {
  return {
    filter: true,
    sort: true,
    filterType: 'custom',
    display: display,
    customFilterListOptions: {
      render: (v: any) => {
        if (v[0] && v[1]) {
          return `${label} Min: ${v[0]}, Max: ${v[1]}`;
        } else if (v[0]) {
          return `${label} Min: ${v[0]}`;
        } else if (v[1]) {
          return `${label} Max: ${v[1]}`;
        }
        return [];
      },
      update: (filterList: any, filterPos: any, index: any) => {
        if (filterPos === 0) {
          filterList[index].splice(filterPos, 1, "");
        } else if (filterPos === 1) {
          filterList[index].splice(filterPos, 1);
        } else if (filterPos === -1) {
          filterList[index] = [];
        }

        return filterList;
      }
    },
    filterOptions: {
      names: [],
      logic(value: any, filters: any) {
        if (filters[0] && filters[1]) {
          return value < filters[0] || value > filters[1];
        } else if (filters[0]) {
          return value < filters[0];
        } else if (filters[1]) {
          return value > filters[1];
        }
        return false;
      },
      display: (filterList: any, onChange: any, index: any, column: any) => (
        <div>
          <FormLabel>{label}</FormLabel>
          <FormGroup row>
            <TextField
              label="min"
              value={filterList[index][0] || ""}
              onChange={(event) => {
                filterList[index][0] = event.target.value;
                onChange(filterList[index], index, column);
              }}
              style={{ width: "45%", marginRight: "5%" }}
            />
            <TextField
              label="max"
              value={filterList[index][1] || ""}
              onChange={(event) => {
                filterList[index][1] = event.target.value;
                onChange(filterList[index], index, column);
              }}
              style={{ width: "45%" }}
            />
          </FormGroup>
        </div>
      )
    },
    print: false,
    customBodyRender: (metric: any, tableMeta: any) => {
      const rowData = tableMeta.rowData;
      if(metric!=null) {
        return (
          <>
            {metric && 
            <Tooltip style={{cursor:'default'}} title={getDateTime(rowData[timestampIdx])}>
                <p>{metric}</p>
            </Tooltip>}
          </>
        )
      } else return null
    }
  }
}

const getDateTime = (timestamp: number) => {
  let theDate = new Date(timestamp);
  let year = theDate.getFullYear()
  let month = theDate.getMonth() >= 10 ? theDate.getMonth() : `0${theDate.getMonth()}`
  let day = theDate.getDate()
  let hour = theDate.getHours()
  let minutes = theDate.getMinutes()
  let seconds = theDate.getSeconds()
  return `Recorded at ${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
}