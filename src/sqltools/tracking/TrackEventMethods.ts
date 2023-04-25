import { TrackingEvent } from './TrackingEvent';
import { SqlMixpanelConfig } from './SqlMixpanelConfig';


interface SelectDatabaseProps { 
    dbName: string;
    userEmail: string;
}

interface SelectMetricProps extends SelectDatabaseProps { 
    metricTitle: string;
    metricText: string;
}

interface ShowQueryProps extends SelectMetricProps { 
    query: string
}

interface ReloadMetricProps extends SelectMetricProps {}
interface ExpandMetricProps extends SelectMetricProps {}
interface ToggleToHistoricViewProps extends SelectMetricProps{}
interface ConfigureDataRecordingViewProps extends SelectMetricProps{}
interface AddDataRecordingProps extends SelectMetricProps{}
interface CancelConfiguringDataRecordingProps extends SelectMetricProps{}
interface UserRoleViewServerAdminProps extends SelectDatabaseProps {}

export const selectDatabaseEvent = (props: SelectDatabaseProps) => SqlMixpanelConfig.track(TrackingEvent.SELECT_DATABASE, props)

export const selectMetricEvent = (props: SelectMetricProps) => SqlMixpanelConfig.track(TrackingEvent.SELECT_METRIC, props)

export const showQueryEvent = (props: ShowQueryProps) => SqlMixpanelConfig.track(TrackingEvent.SHOW_QUERY, props)

export const reloadMetricEvent = (props: ReloadMetricProps) => SqlMixpanelConfig.track(TrackingEvent.RELOAD_METRIC, props)

export const expandMetricEvent = (props: ExpandMetricProps) => SqlMixpanelConfig.track(TrackingEvent.EXPAND_METRIC, props)

export const toggleToHistoricViewEvent = (props: ToggleToHistoricViewProps) => SqlMixpanelConfig.track(TrackingEvent.TOGGLE_TO_HISTORICAL_VIEW, props)

export const configureDataRecordingViewEvent = (props: ConfigureDataRecordingViewProps) => SqlMixpanelConfig.track(TrackingEvent.CONFIGURE_DATA_RECORDING_VIEW, props)

export const addDataRecordingsEvent = (props: AddDataRecordingProps) => SqlMixpanelConfig.track(TrackingEvent.ADD_DATA_RECORDING, props)

export const cancelConfiguringDataRecordingEvent = (props: CancelConfiguringDataRecordingProps) => SqlMixpanelConfig.track(TrackingEvent.CANCEL_CONFIGURING_DATA_RECORDING, props)

export const userRoleViewServerAdminEvent = (props: UserRoleViewServerAdminProps) => SqlMixpanelConfig.track(TrackingEvent.USER_ROLE_VIEW_SERVER_ADMIN, props)

export const viewSolutionQueryEvent = (props: SelectMetricProps) => SqlMixpanelConfig.track(TrackingEvent.VIEW_SOLUTION_QUERY, props)
