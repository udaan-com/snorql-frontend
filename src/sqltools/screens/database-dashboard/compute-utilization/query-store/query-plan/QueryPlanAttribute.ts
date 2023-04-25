
export interface QueryPlanAttribute {
    name: string;
    label: string
}
export const getQueryPlanAttributes = (): QueryPlanAttribute[] => [
    {
        name: "avgDuration",
        label: "Avg Duration"
    },
    {
        name: "avgCpuTime",
        label: "Avg CPU Time"
    },
    {
        name: "avgLogicalIoReads",
        label: "Avg Logical IO Reads"
    },
    {
        name: "avgLogicalIoWrites",
        label: "Avg Logical IO Writes"
    },
    {
        name: "avgPhysicalIoReads",
        label: "Avg Physical IO Reads"
    },
    {
        name: "avgClrTime",
        label: "Avg CLR Time"
    },
    {
        name: "avgDOP",
        label: "Avg DOP"
    },
    {
        name: "avgQueryMaxUsedMemory",
        label: "Avg Query Max Used Memory"
    },
    {
        name: "avgRowcount",
        label: "Avg Row count"
    },
    {
        name: "avgLogBytesUsed",
        label: "Avg Log Bytes Used"
    },
    {
        name: "avgTempdbSpaceUsed",
        label: "Avg Tempdb Space Used"
    },
    {
        name: "avgQueryWaitTime",
        label: "Avg Query Wait Time"
    },
    {
        name: "totalDuration",
        label: "Total Duration"
    },
    {
        name: "totalCpuTime",
        label: "Total CPU Time"
    },
    {
        name: "totalLogicalIoReads",
        label: "Total Logical IO Reads"
    },
    {
        name: "totalLogicalIoWrites",
        label: "Total Logical IO Writes"
    },
    {
        name: "totalPhysicalIoReads",
        label: "Total Physical IO Reads"
    },
    {
        name: "totalClrTime",
        label: "Total CLR Time"
    },
    {
        name: "totalDOP",
        label: "Total DOP"
    },
    {
        name: "totalQueryMaxUsedMemory",
        label: "Total Query Max Used Memory"
    },
    {
        name: "totalRowcount",
        label: "Total Row count"
    },
    {
        name: "totalLogBytesUsed",
        label: "Total Log Bytes Used"
    },
    {
        name: "totalTempdbSpaceUsed",
        label: "Total Tempdb Space Used"
    },
    {
        name: "countExecutions",
        label: "Count Executions"
    }
]