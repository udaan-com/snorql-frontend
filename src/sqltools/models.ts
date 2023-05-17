import { AdminUsersSetExpirationArguments } from "@slack/web-api";

export enum DatabaseType {
    POSTGRES = "postgres", SQLSERVER = "sqlserver"
}

export class SQLQueryView {
    statementText?: string;
    timeTaken?: number;
}


export interface SQLQueryDetails {
    data?: Data;
}

export interface Data {
    result?: Result[];
}

export interface Result {
    metric?: Metric;
    values?: Value[][];
}

export interface Value {
    timestamp?: number;
    timeElapsed?: string;
}

export interface Metric {
    statement_text?: string;
}

export class ServiceName {
    constructor(name: string) {
        this.name = name;
    }
    name?: string;
}

// Dashboard models
export type SubMenuItem = {
    text: string,
    icon: any,
    path: string,
}

export type MenuItem = {
    text: string,
    icon: any,
    path?: string,
    subitems?: SubMenuItem[]
}

export type Menus = {
    title: string;
    items: MenuItem[]
}

// Service Dashboard models
export interface LongRunningSQLQueries {
    Query: string;
    CallingMethod: string;
    CallsPerDay: number;
    DurationPerCall: number;
    TotalTimePerQuery: number;
    Host: string;
    Path: string;
    Bindings?: string;
}
export interface SendSquadcastAlertPayload {
    message: string;
    description: string;
    assigneeType: string;
    serviceSlug: string;
    tags: object;
    createdByEmail?: string;
}
export interface CreatePayloadSQLAlert {
    duration: number;
    threshold: number;
    squadName: string;
    serviceSlug: string;
    name: string;
    hostname?: string;
    disabled: Boolean;
    type: string;
}
export interface GetSQLAlert {
    duration: number;
    threshold: number;
    squadName: string;
    serviceSlug: string;
    name: string;
    hostname?: string;
    disabled: Boolean;
    type: alertType;
    id: number;
}
export interface UpdatePayloadSQLAlert {
    duration: number;
    threshold: number;
    squadName: string;
    serviceSlug: string;
    name: string;
    hostname?: string;
    disabled: Boolean;
    id?: number;
}

export type alertType = "service" | "cronjob";

// Database Dashboard models
export interface Database {
    id: string,
    name: string;
    type: string;
    tier: string;
    family?: string;
    skuName: string;
    capacity: string;
    storage: string;
    kind: string;
    location: string;
    isShow: boolean;
    readReplicaDbName?: string;
    geoReplicaProperties?: GeoReplicaProperties;
    highAvailability?: HighAvailabilityProperties;
    onboardStatus: string;
    
}
export interface HighAvailabilityProperties {
    mode: string,
    state: string
}
export interface GeoReplicaProperties {
    dbRole: string,
    primaryDbName: string,
    secondaryReplicas: string[]
}

export interface GroupMembers{
    id:number;
    appDisplayName?: string;
    createdDateTime: string;
    displayName?: string;
    servicePrincipal: string;
    userPrincipalName?: string;
    type: string;
    group: string;
}

export interface GroupMembersResponse{
        groupName: string;
        groupMembers: GroupMembers[];
}

export interface UserRole {
    id:number;
    name: string;
    role: string;
}

export interface IContainer {
    name: string;
    isShow:boolean;
    isOnboarded?: boolean;
}
export interface IConfigureDatabase {
    isConfigured: boolean;
}

export interface IErrorMessage {
    error: string;
    message: string;
}
export interface ICustomError {
    code: number;
    message: string;
    details: string;
    error?: string
}

export type TMetricPeriod = "REAL_TIME" | "HISTORICAL";
export interface IMetricInput {
    metricId?: string,
    metricPeriod: string,
    databaseName: string,
    from?: string,
    to?: string,
    recommendationRequired: Boolean
}
export interface IMetricMetadata {
    underlyingQueries: string[],
    description: string,
    referenceDocumentation: string[],
    supportsHistorical: boolean,
    minimumRepeatInterval?: number,
    supportsAlert: boolean,
    supportedAlerts: ALERT_TYPE[]
}

// UserRole Interfaces
export interface UserRoleResponse {
    name: string;
    role: string;
    type: string;
    roletype: string;
}
interface IUserRoleMetricOutput {
    result: IUserRoleMetricResult,
    recommendation?: any
}
interface IUserRoleMetricResult {
    queryList: UserRoleResponse[]
}
export interface IUserRoleMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IUserRoleMetricOutput,
    metadata: IMetricMetadata
}

// ActiveQuery Interfaces
export interface ActiveQuery {
    sessionId: number;
    status: string;
    blockedBy: number,
    waitType: string | null;
    waitResource: string;
    waitTime: string;
    cpuTime: number;
    logicalReads: number;
    reads: number;
    writes: number;
    elapsedTime: string;
    queryText: string;
    storedProc: string;
    command: string;
    loginName: string;
    hostName: string;
    programName: string;
    hostProcessId: number;
    lastRequestEndTime: string;
    loginTime: string;
    openTransactionCount: number;
}
export interface IActiveQueryMetricOutput {
    result: IActiveQueryMetricResult,
    recommendation?: any
}
export interface IActiveQueryMetricResult {
    queryList: ActiveQuery[]
}
export interface IActiveQueryMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IActiveQueryMetricOutput,
    metadata: IMetricMetadata
}

// LongRunningQuery Interfaces
interface ILongRunningQueryMetricParams {
    elapsedTimeParam: number
}
export interface ILongRunningQueryMetricInput extends IMetricInput {
    elapsedTime: string
}
export interface ILongRunningQueryMetricResponse {
    metricInput: ILongRunningQueryMetricInput,
    metricOutput: IActiveQueryMetricOutput,
    metadata: IMetricMetadata
}

// BlockingQuery Interfaces
export interface IBlockingQueryStyle {
    sId: string,
    bgColor: string,
    borderColor: string
}
export interface BlockingQuery extends ActiveQuery {
    groupId: number
}
export interface IBlockingQueryMetricResult {
    queryList: BlockingQuery[]
}
export interface IBlockingQueryMetricOutput {
    result: IBlockingQueryMetricResult,
    recommendation?: any
}
export interface IBlockingRunningQueryMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IBlockingQueryMetricOutput,
    metadata: IMetricMetadata
}
// new
export interface IBlockingTreeSessionData extends ActiveQuery {
    blockingThese: string,
    batchText: string,
    inputBuffer: string,
}
export interface IBlockingTree extends ActiveQuery {
    blockingThese: string,
    batchText: string,
    inputBuffer: string,
    blockingTree: IBlockingTree[]
}
export interface IBlockingTreeMetricResult {
    queryList: IBlockingTree[]
}
export interface IBlockingTreeMetricOutput {
    result: IBlockingTreeMetricResult,
    recommendation?: any
}
export interface IBlockingTreeMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IBlockingTreeMetricOutput,
    metadata: IMetricMetadata
}

// Index Stats Model
export interface IIndexStatsResponse {
    id: number;
    name?: string;
    updated?: string;
    rows?: number;
    rowsSampled?: number;
    steps?: number;
    density?: number;
    averageKeyLength?: number;
    stringIndex?: string;
    filterExpression?: string;
    unfilteredRows?: number;
    persistedSamplePercent?: number;
}
export interface IIndexStatsOutput {
    result: IIndexStatsResult,
    recommendation?: any
}
export interface IIndexStatsResult {
    queryList: IIndexStatsResponse[]
}
export interface IIndexStatsMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IIndexStatsOutput,
    metadata: IMetricMetadata
}
export interface IIndexStatsInput extends IMetricInput {
    indexName: string,
    tableName: string
}


// Active DDL Model
export interface IActiveDDLResponse {
    id: number,
    currentStep?: string,
    queryText?: string,
    totalRows?: number,
    rowsProcessed: number,
    rowsLeft: number,
    percentComplete: number,
    elapsedSeconds: number,
    estimatedSecondsLeft: number,
    estimatedCompletionTime: string
}
export interface IActiveDDLOutput {
    result: IActiveDDLResult,
    recommendation?: any
}
export interface IActiveDDLResult {
    queryList: IActiveDDLResponse[]
}
export interface IActiveDDLMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IActiveDDLOutput,
    metadata: IMetricMetadata
}

// Compute Utilization Model
export interface IComputeUtilizationResponse {
    timeId: string,
    maxCpuPercent: number,
    maxDataIoPercent: number,
    maxLogIoPercent: number,
    maxMemoryPercent: number,
    avgCpuPercent: number,
    avgDataIoPercent: number,
    avgLogIoPercent: number,
    avgMemoryPercent: number
}
export interface IComputeUtilizationOutput {
    result: IComputeUtilizationResult,
    recommendation?: any
}
export interface IComputeUtilizationResult {
    queryList: IComputeUtilizationResponse[]
}
export interface IComputeUtilizationMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IComputeUtilizationOutput,
    metadata: IMetricMetadata
}


// Database Storage Size
export interface DatabseStorageSizeResponse {
    databaseName: string,
    databaseSize: string,
    unallocatedSpace: string,
    reserved: string,
    data: string,
    indexSize: string,
    unused: string,
    dbTotalSize: number
}
export interface IDatabseStorageSizeOutput {
    result: IDatabseStorageSizeResult,
    recommendation?: any
}
export interface IDatabseStorageSizeResult {
    queryList: DatabseStorageSizeResponse[]
}
export interface IDatabseStorageSizeResponse {
    metricInput: IMetricInput,
    metricOutput: IDatabseStorageSizeOutput,
    metadata: IMetricMetadata
}

export interface IDatabseStorageSizeInput extends IMetricInput {
    dbName: string
}

// Database Table Storage Size
export interface DatabaseTableSizeResponse {
    tableName: string,
    id: number,
    schemaName: string,
    rows: string,
    totalSpaceKB: string,
    totalSpaceMB: string,
    usedSpaceKB: string,
    usedSpaceMB: string,
    unusedSpaceKB: string,
    unusedSpaceMB: string
}
export interface IDatabaseTableSizeOutput {
    result: IDatabaseTableSizeResult,
    recommendation?: any
}
export interface IDatabaseTableSizeResult {
    queryList: DatabaseTableSizeResponse[]
}
export interface IDatabaseTableSizeResponse {
    metricInput: IMetricInput,
    metricOutput: IDatabaseTableSizeOutput,
    metadata: IMetricMetadata
}

// Database Top indexes
export interface DatabaseTopIndexResponse {
    rows: string,
    indexName: string,
    tableName: string,
    totalSpaceMB: string,
    usedSpaceMB: string,
    unusedSpaceMB: string,
    id: number
}
export interface IDatabaseTopIndexOutput {
    result: IDatabaseTopIndexResult,
    recommendation?: any
}
export interface IDatabaseTopIndexResult {
    queryList: DatabaseTopIndexResponse[]
}
export interface IDatabaseTopIndexResponse {
    metricInput: IMetricInput,
    metricOutput: IDatabaseTopIndexOutput,
    metadata: IMetricMetadata
}

// Table Size
export interface TableSizeResponse {
    name: string,
    rows: string,
    reserved: string,
    data: string,
    indexSize: string,
    unused: string
}
export interface ITableSizeOutput {
    result: ITableSizeResult,
    recommendation?: any
}
export interface ITableSizeResult {
    queryList: TableSizeResponse[]
}
export interface ITableSizeResponse {
    metricInput: IMetricInput,
    metricOutput: ITableSizeOutput,
    metadata: IMetricMetadata
}
export interface ITableSizeInput extends IMetricInput {
    tableName: string
}

// Table Unused indexes
export interface TableUnusedIndexResponse {
    objectName: string,
    indexName: string,
    userSeeks: number,
    userScans: number,
    userLookups: number,
    id: number,
    userUpdates: number,
    columnName:string,
}
interface ITableUnusedIndexOutput {
    result: ITableUnusedIndexResult,
    recommendation: ITableUnusedIndexOutputRecommendation
}
interface ITableUnusedIndexOutputRecommendation {
    indexesToDrop: string[]
}
interface ITableUnusedIndexResult {
    queryList: ITableUnusedIndexResponse[]
}
export interface ITableUnusedIndexResponse {
    metricInput: IMetricInput,
    metricOutput: ITableUnusedIndexOutput,
    metadata: IMetricMetadata
}
export interface ITableUnusedIndexInput extends IMetricInput {
    tableName: string
}

// PVS
export interface PVSResponse {
    persistentVersionStoreSizeGb?: number,

    onlineIndexVersionStoreSizeGb?: number,

    currentAbortedTransactionCount: number,

    abortedVersionCleanerStartTime?: string,

    abortedVersionCleanerEndTime?: string,

    oldestTransactionBeginTime?: string,

    activeTransactionSessionId?: number,

    activeTransactionElapsedTimeSeconds?: number
}
interface IPVSOutput {
    result: IPVSResult,
    recommendation?: any
}
interface IPVSResult {
    queryList: PVSResponse[]
}
export interface IPVSResponse {
    metricInput: IMetricInput,
    metricOutput: IPVSOutput,
    metadata: IMetricMetadata
}

// Database Growth Size
export interface DatabaseGrowthResponse {
    startTime: string,
    endTime: string,
    storageInMegabytes: string
}
interface IDatabaseGrowthOutput {
    result: IDatabaseGrowthResult,
    recommendation?: any
}
interface IDatabaseGrowthResult {
    queryList: DatabaseGrowthResponse[]
}
export interface IDatabaseGrowthResponse {
    metricInput: IMetricInput,
    metricOutput: IDatabaseGrowthOutput,
    metadata: IMetricMetadata
}
export interface IDatabaseGrowthInput extends IMetricInput {
    dbNameForGrowth: string
}
export interface DailyDatabaseGrowth {
    startTime: Date,
    storageInMegabytes: string
}

// model for get admin

export interface SQLAdminType{
    administratorType: string,
    principalType: string,
    login: string,
    sid: string,
    tenantId: string
}

export interface SQLAdminProperties{
    administratorLogin: string,
     version: string,
     state: string,
     administrators?: SQLAdminType,
     fullyQualifiedDomainName: string,
     privateEndpointConnections: Array<any>,
     restrictOutboundNetworkAccess: string

}

// model for admin api
export interface SQLAdminResponse{
    kind: string,
    properties?: SQLAdminProperties,
    location: string,
    id: string,
    name: string,
    type: string
}

// Table Schema Model
export interface TableSchemaResponse {
    columnName:string,
    nullable:string,
    identity:string,
    rowGuid:boolean,
    createdDate:string,
    ordinalPosition:number,
    columnDefault?:string,
    isNullable:string,
    dataType:string,
    characterMaximumLength?:number,
    collationName?:string
}
interface ITableSchemaOutput {
    result: ITableSchemaResult,
    recommendation?: any
}
interface ITableSchemaResult {
    queryList: TableSchemaResponse[]
}
export interface ITableSchemaResponse {
    metricInput: IMetricInput,
    metricOutput: ITableSchemaOutput,
    metadata: IMetricMetadata
}
export interface ITableSchemaInput extends IMetricInput {
    tableName: string
}

// Session Locks Model
export interface SessionLocksResponse {
    sessionId: number,
    databaseId: number,
    requestLifetime: number,
    dbName: string,
    objectName: string,
    indexId: string,
    indexName: string,
    resourceType: string,
    resourceDescription: string,
    resourceAssociatedEntityId: string,
    requestMode: string,
    requestStatus: string
}

interface ISessionLocksOutput {
    result: ISessionLocksResult,
    recommendation?: any
}

interface ISessionLocksResult {
    queryList: SessionLocksResponse[]
}

export interface ISessionInput extends IMetricInput {
    sessionId: number
}

export interface ISessionLocksResponse {
    metricInput: ISessionInput,
    metricOutput: ISessionLocksOutput,
    metadata: IMetricMetadata
}

// Session ActiveQuery Interfaces
export interface SessionActiveQuery {
    sessionId: number;
    status: string;
    blockedBy: number,
    waitType: string | null;
    waitResource: string;
    waitTime: string;
    cpuTime: number;
    logicalReads: number;
    reads: number;
    writes: number;
    elapsedTime: string;
    queryText: string;
    storedProc: string;
    command: string;
    loginName: string;
    hostName: string;
    programName: string;
    hostProcessId: number;
    lastRequestEndTime: string;
    loginTime: string;
    openTransactionCount: number;
    xmlPlan: string;
}
export interface ISessionActiveQueryMetricOutput {
    result: ISessionActiveQueryMetricResult,
    recommendation?: any
}
export interface ISessionActiveQueryMetricResult {
    queryList: SessionActiveQuery[]
}
export interface ISessionActiveQueryMetricResponse {
    metricInput: IMetricInput,
    metricOutput: ISessionActiveQueryMetricOutput,
    metadata: IMetricMetadata
}

// Session Latest Executed Query Interfaces
export interface SessionLatestExecutedQuery {
    sessionId: string,
    queryString: string
}
export interface ISessionLatestExecutedQueryOutput {
    result: ISessionLatestExecutedQueryResult,
    recommendation?: any
}
export interface ISessionLatestExecutedQueryResult {
    queryList: SessionLatestExecutedQuery[]
}
export interface ISessionLatestExecutedQueryResponse {
    metricInput: IMetricInput,
    metricOutput: ISessionLatestExecutedQueryOutput,
    metadata: IMetricMetadata
}

// Database Index Redundancy Analysis
export enum IndexRedundantReasonEnum {
    OVERLAPPING = "OVERLAPPING",
    DUPLICATE = "DUPLICATE",
    UNUSED = "UNUSED",
    SIMILAR = "SIMILAR"
}
export interface IndexRedundancyTableMetadata {
    tableName: string,
    selectedIndexCount?: number,
    isTableUnused?: boolean,
    selectedIndexSize?: number
}
export interface IndexRedundancyReason {
    message: string,
    type: IndexRedundantReasonEnum,
    servingIndex?: string
}
export interface IndexRedundancyMetric {
    tableObjectId: number,
    tableName: string,
    indexId: number,
    indexType: string,
    indexName: string,
    indexUsage?: string,
    indexUpdates?: number,
    indexColumnNrs: string,
    indexColumnNames: string,
    includeColumnNrs?: string,
    includeColumnNames?: string,
    indexSizeInKb: number,
    isUnique: boolean,
    reason?: IndexRedundancyReason
}
export interface IndexRedundancyMetricOutput{
    result: IndexRedundancyMetricResult,
    recommendation?: null
}
export interface IndexRedundancyMetricResponse {
    metricInput: IMetricInput,
    metricOutput: IndexRedundancyMetricOutput,
    metadata: IMetricMetadata
}
export interface IndexRedundancyMetricResult {
    queryList: IndexRedundancyMetric[]
}


// Database Optimization Models
// Index Fragmentation Model
export interface IndexFragmentationMetric {
    schemaName: string,
    objectName: string,
    indexName: string,
    indexType: string,
    avgFragmentationInPercent: number,
    avgPageSpaceUsedInPercent: number,
    pageCount: number,
    allocUnitTypeDesc: string
}
export interface IIndexFragmentationMetricOutput {
    result: IIndexFragmentationMetricResult,
    recommendation?: any
}
export interface IndexFragmentationmetricResponse {
    metricInput: IMetricInput,
    metricOutput: IIndexFragmentationMetricOutput,
    metadata: IMetricMetadata
}
export interface IndexFragmentationMetricInput extends IMetricInput {
    mode: INDEX_PHYSICAL_STATS_MODES
}
export interface IIndexFragmentationMetricResult {
    queryList: IndexFragmentationMetric[]
}
export interface IndexBasicInfo {
    schemaName: string,
    objectName: string,
    indexName: string,
    indexType: string,
    pageCount: number
}
export interface IndexFragmentationMetricRecommendation {
    indexesToRebuild: IndexBasicInfo[],
    indexesToReorganise: IndexBasicInfo[]
}
export enum INDEX_PHYSICAL_STATS_MODES {
    DEFAULT = "DEFAULT", NULL="NULL", LIMITED = "LIMITED", SAMPLED = "SAMPLED", DETAILED = "DETAILED"
}
export interface IndexPhysicalStats {
    modeId: INDEX_PHYSICAL_STATS_MODES,
    modeName: string
}
export interface ResourceTypeInfo {
    resourceType: RESOURCE_TYPE,
    resourceName: string
}

// QueryStore Interfaces
export interface IQueryStore {
    queryId: number,
    objectId: number,
    objectName?: string,
    querySqlText: string,
    countExecutions: number,
    numPlans: number,
    totalDuration: number,
    totalCpuTime: number,
    totalLogicalIoReads: number,
    totalLogicalIoWrites: number,
    totalPhysicalIoReads: number,
    totalClrTime: number,
    totalDop: number,
    totalQueryMaxUsedMemory: number,
    totalRowcount: number,
    totalLogBytesUsed: number,
    totalTempdbSpaceUsed: number,
    avgDuration: number,
    avgCpuTime: number,
    avgLogicalIoReads: number,
    avgLogicalIoWrites: number,
    avgPhysicalIoReads: number,
    avgClrTime: number,
    avgDop: number,
    avgQueryMaxUsedMemory: number,
    avgRowcount: number,
    avgLogBytesUsed: number,
    avgTempdbSpaceUsed: number
}
export interface IQueryStoreOutput {
    result: IQueryStoreResult,
    recommendation?: any
}
export interface IQueryStoreResult {
    queryList: IQueryStore[]
}
export interface IQueryStoreInput extends IMetricInput {
    startTime: string,
    endTime: string,
    sortKey: string,
    sortOrder: string
}
export interface IQueryStoreResponse {
    metricInput: IQueryStoreInput,
    metricOutput: IQueryStoreOutput,
    metadata: IMetricMetadata
}


// Analyze Query Plan Interfaces
export interface IAnalyzeQueryPlan {
    queryId: number,
    planId?: number,
    querySqlText: string,
    countExecutions: number,
    totalDuration: number,
    totalCpuTime: number,
    totalLogicalIoReads: number,
    totalLogicalIoWrites: number,
    totalPhysicalIoReads: number,
    totalClrTime: number,
    totalDOP: number,
    totalQueryMaxUsedMemory: number,
    totalRowcount: number,
    totalLogBytesUsed: number,
    totalTempdbSpaceUsed: number,
    avgDuration: number,
    avgCpuTime: number,
    avgLogicalIoReads: number,
    avgLogicalIoWrites: number,
    avgPhysicalIoReads: number,
    avgClrTime: number,
    avgDOP: number,
    avgQueryMaxUsedMemory: number,
    avgRowcount: number,
    avgLogBytesUsed: number,
    avgTempdbSpaceUsed: number,
    planXML:string
}
export interface IAnalyzeQueryPlanOutput {
    result: IAnalyzeQueryPlanResult,
    recommendation?: any
}
export interface IAnalyzeQueryPlanResult {
    queryList: IAnalyzeQueryPlan[]
}
export interface IAnalyzeQueryPlanInput extends IMetricInput {
    startTime: string,
    endTime: string,
    queryId: string
}
export interface IAnalyzeQueryPlanResponse {
    metricInput: IAnalyzeQueryPlanInput,
    metricOutput: IAnalyzeQueryPlanOutput,
    metadata: IMetricMetadata
}

// Log Space Usage Interfaces
export interface ILogSpaceUsage {
    name: string,
    spaceUsedInGB: number,
    maxSpaceInGB: number
}
export interface ILogSpaceUsageRecommendation {
    isActionRequired: boolean,
    text: string
}
export interface ILogSpaceUsageOutput {
    result: ILogSpaceUsageResult,
    recommendation?: ILogSpaceUsageRecommendation
}
export interface ILogSpaceUsageResult {
    queryList: ILogSpaceUsage[]
}
export interface ILogSpaceUsageResponse {
    metricInput: IMetricInput,
    metricOutput: ILogSpaceUsageOutput,
    metadata: IMetricMetadata
}

// Read Replication Lag Interfaces
export interface IReadReplicationLag {
    lastRedoneTimeInMillis: number,
    lastReceivedTimeInMillis: number,
    replicationLagInMillis: number
}
export interface IReadReplicationLagRecommendation {
    isActionRequired: boolean,
    text: string
}
export interface IReadReplicationLagOutput {
    result: IReadReplicationLagResult,
    recommendation?: IReadReplicationLagRecommendation
}
export interface IReadReplicationLagResult {
    queryList: IReadReplicationLag[]
}
export interface IReadReplicationLagInput extends IMetricInput {
    replicaDatabaseName: string
}
export interface IReadReplicationLagResponse {
    metricInput: IReadReplicationLagInput,
    metricOutput: IReadReplicationLagOutput,
    metadata: IMetricMetadata
}

// Geo Replica Lag Interfaces
export interface IGeoReplicaLag {
    partnerServer: string,
    partnerDatabase: string,
    replicationState: number,
    replicationStateDesc: string,
    roleDesc: string,  
    secondaryAllowConnectionsDesc: string,  
    lastReplication: string,  
    replicationLagSec: number
}
export interface IGeoReplicaLagRecommendation {
    isActionRequired: boolean,
    text: string
}
export interface IGeoReplicaLagOutput {
    result: IGeoReplicaLagResult,
    recommendation?: IGeoReplicaLagRecommendation
}
export interface IGeoReplicaLagResult {
    queryList: IGeoReplicaLag[]
}
export interface IGeoReplicaLagInput extends IMetricInput {
    primaryDatabaseName: string
}
export interface IGeoReplicaLagResponse {
    metricInput: IGeoReplicaLagInput,
    metricOutput: IGeoReplicaLagOutput,
    metadata: IMetricMetadata
}


// Historical Data Schema Model
export interface IMetricHistoricalDataSchema {
    runId:string,
    timestamp:Date,
    metricId:string,
    databaseName:string,
    metricInput:string,
    metricOutput:string
}

export interface NextPageToken {
    nextPartitionKey?: string,
    nextRowKey?: string
}

export interface HistoricalDataResult {
    result: Array<IMetricHistoricalDataSchema>,
    metadata: NextPageToken
}

export interface IMetricHistoricalDataFilter {
    runId?:string[],
    timestamp?:string[],
    fromDate: string,
    toDate: string,
    pageSize: number,
    nextPartitionKey?: string,
    nextRowKey?: string
}

// Configure Active Query Job Model
export interface IMetricJobConfig {
    databaseName: string,
    metricId: string,
    description: string,
    configuredByName: string,
    configuredByEmail: string,
    watchIntervalInSeconds: number,
    endAt: Date,
    dataRetentionPeriodInDays: number
}

// Configure Long Running Query Job Model
export interface ILongRunningMetricJobConfig extends IMetricJobConfig {
    elapsedTime: number
}

// Configure Index Stats Job Model
export interface IIndexStatsJobConfig extends IMetricJobConfig {
    tableName: string,
    indexName: string
}

export interface ITableSizeJobConfig extends IMetricJobConfig {
    tableName: string
}

export interface IDatabaseStorageJobConfig extends IMetricJobConfig {
    dbName: string
}

// Trigger Model Class
export interface IMetricTrigger {
    triggerName: string,
    metricId: string,
    description?: string,
    startTime?: string,
    endTime?: string,
    nextFireTime?: string,
    configuredByName: string,
    configuredByEmail: string,
    repeatInterval: string,
    dataRetentionPeriodInDays: number
}

export interface ILongRunningMetricTrigger extends IMetricTrigger {
    elapsedTime: string
}

export interface IIndexStatsTrigger extends IMetricTrigger {
    tableName: string,
    indexName: string
}

export interface ITableSizeTrigger extends IMetricTrigger {
    tableName: string
}

// DocS Analyser Model

export interface DocSEligibleDatabases {
    dbs: string[];
}

export enum AnalysisAgent {
    GITHUB = 'GITHUB',
    ADHOC = 'ADHOC'
}

export interface BaseAnalysisRequest {
    type: AnalysisAgent
}

export interface GithubAnalysisRequest extends BaseAnalysisRequest {
    type: AnalysisAgent.GITHUB;
    prUrl: string;
}

export enum InputType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    ENUM = 'ENUM',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    TIMESTAMP = 'TIMESTAMP'
}

export interface BaseQueryAnalysisMetadata {
    type: AnalysisAgent;
}

export interface QueryAnalysisMetadataForGithub extends BaseQueryAnalysisMetadata {
    type: AnalysisAgent.GITHUB;
    repository: string;
    prNumber: number;
    headCommentInt: number;
}

export interface BaseInputDetails {
    key: string;
    type: InputType;
}

export interface StringInput extends BaseInputDetails {
    type: InputType.STRING;
    key: string;
    isNullable: boolean;
}

export interface NumberInput extends BaseInputDetails {
    type: InputType.NUMBER;
    key: string;
    isNullable: boolean;
}

export interface EnumInput extends BaseInputDetails {
    type: InputType.ENUM;
    key: string;
    superSet: string[];
    isNullable: boolean;
}

export interface BooleanInput extends BaseInputDetails {
    type: InputType.BOOLEAN;
    key: string;
    isNullable: boolean;
}

export interface DateInput extends BaseInputDetails {
    type: InputType.DATE;
    key: string;
    isNullable: boolean;
}

export interface TimeStampInput extends BaseInputDetails {
    type: InputType.TIMESTAMP;
    key: string;
    isNullable: boolean;
}

export interface EligibleQueryAnalysisInput {
    required: boolean;
    allowMultiple: boolean;
    parentKey: string;
    details: BaseInputDetails[];
}

export interface EligibleQueryForAnalysis {
    query: string;
    inputs: EligibleQueryAnalysisInput[];
    metadata: BaseQueryAnalysisMetadata;
}

export interface EligibleQueryAnalysisResponse {
    eligibleQueries: EligibleQueryForAnalysis[];
}

export enum QueryAnalyserInputType {
    LIST = 'LIST',
    SINGLE = 'SINGLE'
}

export interface BaseQueryCostAnalyserInputParam {
    key: string;
    type: InputType;
    inputType: QueryAnalyserInputType;
}

export interface SingleQueryCostAnalyserInputParam extends BaseQueryCostAnalyserInputParam {
    inputType: QueryAnalyserInputType.SINGLE;
    key: string;
    type: InputType;
    value: any;
}

export interface ListQueryCostAnalyserInputParam extends BaseQueryCostAnalyserInputParam {
    inputType: QueryAnalyserInputType.LIST;
    key: string;
    type: InputType;
    value: any[];
}

export interface QueryAnalyserInputDetails {
    dbName: string;
    query: string;
    inputDetails: BaseQueryCostAnalyserInputParam[];
    metadata: BaseQueryAnalysisMetadata;
}

export enum PlanPointerType {
    DANGER = 'DANGER',
    GOOD = "GOOD",
    MODERATE = "MODERATE"
}

export interface PlanPointer {
    text: string,
    type: PlanPointerType
}

export interface ExecutionPlanAnalysis {
    executedQuery: string;
    estimateCost: number;
    pointers: PlanPointer[];
}

export interface XMLPlanAnalysis {
    xmlPlan: string;
}

export interface DocSAnalysisResponse {
    query: string;
    dbName: string;
    planAnalysis: ExecutionPlanAnalysis;
    xmlPlanAnalysis: XMLPlanAnalysis;
}

// Alert Modal Class
export enum ALERT_TYPE {
    alert_activeQueriesFilter = "alert_activeQueriesFilter",
    alert_databaseUsedSpace = "alert_databaseUsedSpace",
    alert_indexFragmentation="alert_indexFragmentation",
    alert_resourceUtilization="alert_resourceUtilization",
    alert_logSpaceUsage="alert_logSpaceUsage",
    alert_readReplicationLag="alert_readReplicationLag",
    alert_geoReplicaLag="alert_geoReplicaLag"
}

export interface AlertInfo {
    alertId: ALERT_TYPE,
    alertName: string
}

export interface AlertSeverity {
    severityId: ALERT_SEVERITY,
    severityName: string
}

export enum ALERT_SEVERITY {
    CRITICAL = "CRITICAL", ERROR="ERROR", INFORMATIONAL="INFORMATIONAL", WARNING="WARNING",VERBOSE="VERBOSE" 
}

export interface IMetricAlert {
    databaseName: string,
    alertType: string,
    alertNameString: string,
    severity: ALERT_SEVERITY,
    description?: string,
    configuredByName: string,
    configuredByEmail: string,
    watchIntervalInSeconds: number,
    endAt?: Date,
    alertId?: string
}

export interface ActiveQueriesAlert extends IMetricAlert {
    queriesCountThreshold?: number,
    elapsedTimeThreshold?: number,
    cpuTimeThreshold?: number,
    logicalReadsThreshold?: number,
    readsThreshold?: number,
    writesThreshold?: number,
    openTransactionCountThreshold?: number
}

export interface QueriesCountAlert extends IMetricAlert {
    queriesCountThreshold?: number,
    elapsedTimeThreshold?: number
}

export interface DatabaseUsedSpaceAlert extends IMetricAlert {
    dbName: string,
    percentageOccupiedThreshold: number
}

export interface IndexFragmentationAlert extends IMetricAlert {
    pageCountThreshold: number,
    mode: INDEX_PHYSICAL_STATS_MODES
}

// Resource Utilization Alert
export enum RESOURCE_TYPE {
    CPU = "CPU", DATA_IO="DATA_IO", MEMORY = "MEMORY", LOG_IO="LOG_IO"
}

export interface ResourceUtilizationAlert extends IMetricAlert {
    configuredOnReplica: boolean
    resourceType: RESOURCE_TYPE,
    resourceUtilizationThreshold: number
}
export interface LogSpaceUsageAlert extends IMetricAlert {
    logSpaceUsageLimitInPercent: number
}
export interface ReadReplicationLagAlert extends IMetricAlert {
    thresholdInSec: number
}
export interface GeoReplicaLagAlert extends IMetricAlert {
    thresholdInSec: number
    primaryDatabaseName: string
}


// DbMetrics
export interface DbMetricsExpanded {
    dbName: string,
    tier: string,
    kind: string,

    rebuildIndexesCountValue?: number,
    rebuildIndexesCountTimestamp?: number,

    reorganizeIndexesCountValue?: number,
    reorganizeIndexesCountTimestamp?: number,

    idxFragAbove90Value?: number,
    idxFragAbove90Timestamp?: number,

    idxFragBetween60to90Value?: number,
    idxFragBetween60to90Timestamp?: number,

    idxFragBetween30to60Value?: number,
    idxFragBetween30to60Timestamp?: number,

    idxFragBetween15to30Value?: number,
    idxFragBetween15to30Timestamp?: number,

    idxFragBelow15Value?: number,
    idxFragBelow15Timestamp?: number,
    
    duplicateIndexesCountValue?: number,
    duplicateIndexesCountTimestamp?: number,

    unusedIndexesCountValue?: number,
    unusedIndexesCountTimestamp?: number,

    overlappingIndexesCountValue?: number,
    overlappingIndexesCountTimestamp?: number,

    similarIndexesCountValue?: number,
    similarIndexesCountTimestamp?: number,

    cpuPercentP99Value?: number,
    cpuPercentP99Timestamp?: number,

    cpuPercentP95Value?: number,
    cpuPercentP95Timestamp?: number,

    cpuPercentP90Value?: number,
    cpuPercentP90Timestamp?: number,

    cpuPercentP70Value?: number,
    cpuPercentP70Timestamp?: number,
    
    memPercentP99Value?: number,
    memPercentP99Timestamp?: number,

    memPercentP95Value?: number,
    memPercentP95Timestamp?: number,

    memPercentP90Value?: number,
    memPercentP90Timestamp?: number,

    memPercentP70Value?: number,
    memPercentP70Timestamp?: number,

    dataIoPercentP99Value?: number,
    dataIoPercentP99Timestamp?: number,

    dataIoPercentP95Value?: number,
    dataIoPercentP95Timestamp?: number,

    dataIoPercentP90Value?: number,
    dataIoPercentP90Timestamp?: number,

    dataIoPercentP70Value?: number,
    dataIoPercentP70Timestamp?: number,

    logIoPercentP99Value?: number,
    logIoPercentP99Timestamp?: number,

    logIoPercentP95Value?: number,
    logIoPercentP95Timestamp?: number,

    logIoPercentP90Value?: number,
    logIoPercentP90Timestamp?: number,

    logIoPercentP70Value?: number,
    logIoPercentP70Timestamp?: number,

    badges?: string,
}
export interface DbMetrics {
    db: DatabaseInsight,
    rebuildIndexesCount?: DbInsightMetric,
    reorganizeIndexesCount?: DbInsightMetric,
    idxFragAbove90?: DbInsightMetric,
    idxFragBetween60to90?: DbInsightMetric,
    idxFragBetween30to60?: DbInsightMetric,
    idxFragBetween15to30?: DbInsightMetric,
    idxFragBelow15?: DbInsightMetric,
    duplicateIndexesCount?: DbInsightMetric,
    unusedIndexesCount?: DbInsightMetric,
    overlappingIndexesCount?: DbInsightMetric,
    similarIndexesCount?: DbInsightMetric,
    cpuPercentP99?: DbInsightMetric,
    cpuPercentP95?: DbInsightMetric,
    cpuPercentP90?: DbInsightMetric,
    cpuPercentP70?: DbInsightMetric,
    memPercentP99?: DbInsightMetric,
    memPercentP95?: DbInsightMetric,
    memPercentP90?: DbInsightMetric,
    memPercentP70?: DbInsightMetric,
    dataIoPercentP99?: DbInsightMetric,
    dataIoPercentP95?: DbInsightMetric,
    dataIoPercentP90?: DbInsightMetric,
    dataIoPercentP70?: DbInsightMetric,
    logIoPercentP99?: DbInsightMetric,
    logIoPercentP95?: DbInsightMetric,
    logIoPercentP90?: DbInsightMetric,
    logIoPercentP70?: DbInsightMetric,
    badges: string
}
export interface DatabaseInsight {
    name: string,
    tier: string,
    kind: string
}
export interface DbInsightMetric {
    value: number,
    timestamp: number
}

export interface DbMetricWeeks {
    weeks: string[]
}