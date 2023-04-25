export enum TrackingEvent {
    // genric events to all metric
    SELECT_DATABASE = 'select_database',
    SELECT_METRIC = 'select_metric',
    SHOW_QUERY = 'show_query',
    RELOAD_METRIC = 'reload_metric',
    EXPAND_METRIC = 'expand_metric',
    TOGGLE_TO_HISTORICAL_VIEW = 'toggle_to_historical_view',
    CONFIGURE_DATA_RECORDING_VIEW = 'configure_data_recording_view',
    ADD_DATA_RECORDING = 'add_data_recording',
    CANCEL_CONFIGURING_DATA_RECORDING = 'cancel_configuring_data_recording',
    SEARCH = 'search', // TODO
    FILTER = 'filter', // TODO
    VIEW_COLUMMNS = 'view_columns',  // TODO
    VIEW_SOLUTION_QUERY = 'view_solution_query',

    // USER_ROLE metric specific events
    USER_ROLE_VIEW_SERVER_ADMIN = 'user_role_view_server_admin'
}