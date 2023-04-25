import { ScreenContainer } from "../../common/components/ScreenContainer";
import React, { FunctionComponent } from "react";
import { Box, Paper } from "@material-ui/core";
import { useHistory, useLocation } from "react-router";
import { Tabs, Tab } from "@material-ui/core";
import { ServiceListScreen } from "./ServiceListScreen";
import { DatabaseListScreen } from './DatabaseListScreen';
import { CronJobsListScreen } from './CronjobsListScreen';
import {DocSAnalyserScreen} from "./DocSAnalyserScreen";
import { DbMetricsScreen } from './db-insights/DbInsightsScreen';


export const HomeScreen: FunctionComponent = () => {
    const history = useHistory();
    const {search} = useLocation();
    const query = new URLSearchParams(search);
    const [tab, selectTab] = React.useState(query.has("t") ? parseInt(query.get("t")![0] || "0") : 0);

    const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
        history.push(`/components?t=${newValue}`);
        selectTab(newValue);
    };

    return (
        <ScreenContainer title={`SQL Dashboard`} maxWidth="xl">
            <Paper>
                <Box padding={5} mt={2}>
                    <Tabs
                        value={tab}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={handleChangeTab}
                    >
                        <Tab label="Services" />
                        <Tab label="Cronjobs" />
                        <Tab label="Databases" />
                        <Tab label="DocS Query Analyser" />
                        <Tab label="DB Insights" />
                    </Tabs>
                    {tab === 0 && <ServiceListScreen/>}
                    {tab === 1 && <CronJobsListScreen/>}
                    {tab === 2 && <DatabaseListScreen/>}
                    {tab === 3 && <DocSAnalyserScreen />}
                    {tab === 4 && <DbMetricsScreen />}
                </Box>
            </Paper>
        </ScreenContainer>
    );
};
