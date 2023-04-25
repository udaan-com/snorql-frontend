export const getIndexStatsTriggerConfigColumns = () => [
    {
      name: "triggerName",
      label: "Trigger Name",
      options: {
        display: false,
        filter: true,
        sort: true,
        setCellProps: () => ({style: {whiteSpace:"pre"}}),
      }
    },
    {
      name: "description",
      label: "Trigger Description",
      options: {
        filter: true,
        sort: true,
        setCellProps: () => ({style: {whiteSpace:"pre"}}),
      }
    },
    {
      name: "configuredByName",
      label: "Configured By",
      options: {
        display: false,
        filter: false,
        sort: false,
        setCellProps: () => ({style: {whiteSpace:"pre"}})
      }
    },
    {
      name: "configuredByEmail",
      label: "Configured By (Email)",
      options: {
        display: true,
        filter: false,
        sort: false,
        setCellProps: () => ({style: {whiteSpace:"pre"}})
      }
    },
    {
      name: "repeatInterval",
      label: "Repeat Interval",
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({style: {whiteSpace:"pre"}}),
        display:true,
        customBodyRender: (repeatInterval: any) => { return (repeatInterval + " seconds") }
      }
    },
    {
        name: "tableName",
        label: "Table Name",
        options: {
            display: true,
            filter: true,
            sort: false,
            setCellProps: () => ({style: {whiteSpace:"pre"}})
        }
    },
    {
        name: "indexName",
        label: "Index Name",
        options: {
            display: true,
            filter: true,
            sort: false,
            setCellProps: () => ({style: {whiteSpace:"pre"}})
        }
    },
    {
      name: "startTime",
      label: "Start Time",
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({style: {whiteSpace:"pre"}}),
        display:false,
        customBodyRender: (value: string | undefined) => { return ((value) ? (new Date(value)).toLocaleString() : "NA") }
      }
    },
    {
      name: "endTime",
      label: "End Time",
      options: {
        display: true,
        filter: false,
        sort: false,
        setCellProps: () => ({style: {whiteSpace:"pre"}}),
        customBodyRender: (value: string | undefined) => { return ((value) ? (new Date(value)).toLocaleString() : "NA") }
      }
    },
    {
      name: "nextFireTime",
      label: "Next Fire Time",
      options: {
        display: false,
        filter: false,
        sort: false,
        setCellProps: () => ({style: {whiteSpace:"pre"}}),
        customBodyRender: (value: string | undefined) => { return ((value) ? (new Date(value)).toLocaleString() : "NA") }
      }
    },
  ]