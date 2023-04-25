import React from "react";
import {Switch, Route, BrowserRouter, Redirect} from "react-router-dom";
import {NotFound} from "../common/components/NotFound";
import {INFRA_PROBS_BASE_PATH} from "./constants";
import {setFavicon} from "../common/utils";
import { HomeScreen } from './screens/HomeScreen';
import { DatabaseDashboardScreen } from './screens/database-dashboard/DatabaseDashboardScreen';
import { ServicesDashboardScreen } from './screens/services-dashboard/ServicesDashboardScreen';
import { CronjobDashboardScreen } from "./screens/cronjob-dashboard/CronjobDashboardScreen";
import {DocSAnalyserDashboard} from "./screens/docs-analyser-dashboard/DocSAnalyserDashboard";

export class InfraRoot extends React.Component {
    componentDidMount () {
        setFavicon('https://upload.wikimedia.org/wikipedia/commons/6/6f/Sql_database_shortcut_icon.png');
    }
    render () {
        return (
            <BrowserRouter basename={INFRA_PROBS_BASE_PATH}>
                <Switch>
                    <Route path={"/services/:serviceName"} component={ServicesDashboardScreen} />
                    <Route path={"/cronjobs/:cronjobName"} component={CronjobDashboardScreen} />
                    <Route path={"/databases/:databaseType/:databaseName"} component={DatabaseDashboardScreen} />
                    <Route path={"/docs-analyser"} component={DocSAnalyserDashboard} />
                    <Route path={"/components"} component={HomeScreen} />
                    <Redirect path={"/"} exact={true} to={'/components'} />
                    <Route component={NotFound} />
                </Switch>
            </BrowserRouter>
        );
    }
}
